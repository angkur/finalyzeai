import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2, Mail, Lock, User, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = 'login' | 'signup' | 'forgot' | 'verification-sent';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextPath = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const { user, signIn, signUp, signInWithGoogle, signOut, resetPasswordForEmail, resendVerificationEmail, isLoading: authLoading } = useAuth();

  // Friendly error messages
  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('email not confirmed')) {
      return 'Please verify your email before signing in. Check your inbox for the verification link.';
    }
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (message.includes('user already registered') || message.includes('already registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    return error.message;
  };

  // If user is already logged in, show options instead of auto-redirecting
  if (user && !authLoading && nextPath !== "/") {
    navigate(nextPath, { replace: true });
    return null;
  }

  if (user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 shadow-card text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Already Signed In
            </h1>
            <p className="text-muted-foreground mb-6">
              You're signed in as <span className="font-medium text-foreground">{user.email}</span>
            </p>
            <div className="space-y-3">
              <Button 
                variant="hero" 
                className="w-full" 
                onClick={() => navigate("/")}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  await signOut();
                  setMode('login');
                }}
              >
                Sign Out & Use Different Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    // Forgot password flow
    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        const { error } = await resetPasswordForEmail(email);
        if (error) {
          toast.error(getErrorMessage(error));
        } else {
          toast.success("Password reset email sent! Check your inbox.");
          setMode('login');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Validate password for login/signup
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error, needsEmailConfirmation } = await signIn(email, password);
        if (error) {
          if (needsEmailConfirmation) {
            setPendingVerificationEmail(email);
            setMode('verification-sent');
          } else {
            toast.error(getErrorMessage(error));
          }
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        const { error, needsEmailConfirmation } = await signUp(email, password, fullName);
        if (error) {
          toast.error(getErrorMessage(error));
        } else if (needsEmailConfirmation) {
          setPendingVerificationEmail(email);
          setMode('verification-sent');
          toast.success("Account created! Please check your email to verify.");
        } else {
          toast.success("Account created successfully!");
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;
    
    setIsResending(true);
    try {
      const { error } = await resendVerificationEmail(pendingVerificationEmail);
      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success("Verification email resent! Check your inbox.");
      }
    } catch (error: any) {
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Verification sent screen
  if (mode === 'verification-sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 shadow-card text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Check Your Email
            </h1>
            <p className="text-muted-foreground mb-2">
              We've sent a verification link to:
            </p>
            <p className="font-medium text-foreground mb-6">{pendingVerificationEmail}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to verify your account. If you don't see it, check your spam folder.
            </p>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setMode('login');
                  setPendingVerificationEmail(null);
                }}
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate("/")}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
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
            {mode === 'login' ? "Welcome Back" : mode === 'signup' ? "Create Account" : "Reset Password"}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login'
              ? "Sign in to access your dashboard"
              : mode === 'signup'
              ? "Join us and start analyzing your data"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? "Signing in..." : mode === 'signup' ? "Creating account..." : "Sending..."}
                </>
              ) : (
                <>{mode === 'login' ? "Sign In" : mode === 'signup' ? "Create Account" : "Send Reset Link"}</>
              )}
            </Button>
          </form>

          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </button>
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-3"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
            </>
          )}

          {mode !== 'forgot' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
