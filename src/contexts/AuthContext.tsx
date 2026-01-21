import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useEmail } from "@/hooks/useEmail";
import { PLAN_LIMITS, getRetentionDaysForDb, PlanLimits } from "@/config/plans";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserPlanData {
  planName: string;
  limits: PlanLimits;
  subscriptionEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userPlan: UserPlanData | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
  refreshPlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { sendWelcomeEmail } = useEmail();
  const welcomeEmailSentRef = useRef<Set<string>>(new Set());
  const planSyncedRef = useRef<Set<string>>(new Set());

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  // Sync user plan with Stripe and update database
  const syncUserPlan = useCallback(async (userId: string) => {
    try {
      // Check Stripe subscription status
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        // Fall back to database
        const { data: dbPlan } = await supabase
          .from("user_plans")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (dbPlan) {
          const limits = PLAN_LIMITS[dbPlan.plan_name] || PLAN_LIMITS.free;
          setUserPlan({
            planName: dbPlan.plan_name,
            limits,
            subscriptionEnd: dbPlan.expires_at,
            stripeCustomerId: dbPlan.stripe_customer_id,
            stripeSubscriptionId: dbPlan.stripe_subscription_id,
          });
        }
        return;
      }

      const planName = data?.plan_name || "free";
      const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.free;

      // Update user_plans table to sync with Stripe
      const planData = {
        user_id: userId,
        plan_name: planName,
        daily_limit: limits.daily_limit,
        monthly_limit: limits.monthly_limit,
        upload_limit_mb: limits.upload_limit_mb,
        history_retention_days: getRetentionDaysForDb(planName),
        stripe_customer_id: data?.stripe_customer_id || null,
        stripe_subscription_id: data?.stripe_subscription_id || null,
        expires_at: data?.subscription_end || null,
      };

      await supabase
        .from("user_plans")
        .upsert(planData, { onConflict: "user_id" });

      setUserPlan({
        planName,
        limits,
        subscriptionEnd: data?.subscription_end || null,
        stripeCustomerId: data?.stripe_customer_id || null,
        stripeSubscriptionId: data?.stripe_subscription_id || null,
      });

      planSyncedRef.current.add(userId);
    } catch (err) {
      console.error("Error syncing user plan:", err);
    }
  }, []);

  const refreshPlan = useCallback(async () => {
    if (user) {
      await syncUserPlan(user.id);
    }
  }, [user, syncUserPlan]);

  useEffect(() => {
    let initialSessionChecked = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            // Sync plan on every auth state change
            syncUserPlan(session.user.id);
          }, 0);
          
          // Only send welcome email for truly new signups (not existing session restores)
          // Check if user was created within last 30 seconds to detect new signup
          if (event === 'SIGNED_IN' && initialSessionChecked && !welcomeEmailSentRef.current.has(session.user.id)) {
            const createdAt = new Date(session.user.created_at).getTime();
            const now = Date.now();
            const isNewUser = (now - createdAt) < 30000; // Created within last 30 seconds
            
            if (isNewUser) {
              const userEmail = session.user.email;
              const userName = session.user.user_metadata?.full_name;
              if (userEmail) {
                welcomeEmailSentRef.current.add(session.user.id);
                setTimeout(() => {
                  sendWelcomeEmail(userEmail, userName).catch(console.error);
                }, 0);
              }
            }
          }
        } else {
          setProfile(null);
          setUserPlan(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        syncUserPlan(session.user.id);
      }
      setIsLoading(false);
      initialSessionChecked = true;
    });

    return () => subscription.unsubscribe();
  }, [syncUserPlan]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    // If signup succeeds, email confirmation is typically required
    if (!error) {
      return { error: null, needsEmailConfirmation: true };
    }
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Check if email is not confirmed
    if (error?.message?.toLowerCase().includes('email not confirmed')) {
      return { error: error as Error | null, needsEmailConfirmation: true };
    }
    
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserPlan(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (!error) {
      await fetchProfile(user.id);
    }

    return { error: error as Error | null };
  };

  const resetPasswordForEmail = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userPlan,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        resetPasswordForEmail,
        updatePassword,
        resendVerificationEmail,
        refreshPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
