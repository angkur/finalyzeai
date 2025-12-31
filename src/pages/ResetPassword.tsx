import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEmail } from "@/hooks/useEmail";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type PageState = 'loading' | 'valid' | 'invalid' | 'success';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loading');
  const navigate = useNavigate();
  const { updatePassword, session, isLoading: authLoading, user } = useAuth();
  const { sendPasswordResetSuccess } = useEmail();

  useEffect(() => {
    // Wait for auth to finish loading before determining state
    if (authLoading) {
      return;
    }

    // Check URL for recovery token (Supabase adds it as hash fragment)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    // If we have a recovery token in URL or an active session, show the form
    if ((accessToken && type === 'recovery') || session) {
      setPageState('valid');
    } else {
      // No token and no session - invalid link
      setPageState('invalid');
    }
  }, [authLoading, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message || "Failed to reset password");
      } else {
        setPageState('success');
        toast.success("Password updated successfully! Redirecting...");
        
        // Send confirmation email
        if (user?.email) {
          sendPasswordResetSuccess(user.email, user.user_metadata?.full_name).catch(console.error);
        }
        
        // Auto-redirect to homepage after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 shadow-card">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="font-display text-xl font-semibold text-foreground mb-2">
              Validating Reset Link
            </h1>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid/expired link
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 shadow-card">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Invalid or Expired Link
            </h1>
            <p className="text-muted-foreground mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Button 
                variant="hero" 
                className="w-full" 
                onClick={() => navigate("/auth")}
              >
                Go to Sign In
              </Button>
              <p className="text-sm text-muted-foreground">
                You can request a new reset link from the sign in page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 shadow-card">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Password Updated!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully changed. Redirecting you to the dashboard...
            </p>
            <Button variant="hero" className="w-full" onClick={() => navigate("/")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Valid state - show reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/auth")}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Button>

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">FinanceAI</span>
          </a>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Set New Password
          </h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
