import { useEffect, useState } from "react";
import { Check, Sparkles, Star, Zap, Crown, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Stripe price IDs for each plan
const STRIPE_PRICES = {
  "mini-pro": "price_1SnNzFGj42kzuAASjkxZfEvI",
  "mini": "price_1SnNzYGj42kzuAASdZ3S0PwS",
  "starter": "price_1SnO0KGj42kzuAASMuvVqTrS",
  "pro": "price_1SnO1NGj42kzuAASLZ9votZm",
};

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Sparkles;
  features: string[];
  limits: {
    daily_limit: number;
    monthly_limit: number;
    upload_limit_mb: number;
    history_retention_days: number | null;
  };
  popular: boolean;
  stripePrice?: string;
}

const plans: Plan[] = [
  {
    name: "free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out AI Predict",
    icon: Sparkles,
    features: [
      "5 analyses per day",
      "5 analyses per month",
      "Document upload (up to 5MB)",
      "7-day analysis history",
      "Community support",
    ],
    limits: {
      daily_limit: 5,
      monthly_limit: 5,
      upload_limit_mb: 5,
      history_retention_days: 7,
    },
    popular: false,
  },
  {
    name: "mini-pro",
    price: "$2",
    period: "/month",
    description: "Perfect for light users who need a bit more",
    icon: Star,
    features: [
      "7 analyses per day",
      "15 analyses per month",
      "Document upload (up to 8MB)",
      "14-day analysis history",
      "Basic email support",
    ],
    limits: {
      daily_limit: 7,
      monthly_limit: 15,
      upload_limit_mb: 8,
      history_retention_days: 14,
    },
    popular: false,
    stripePrice: STRIPE_PRICES["mini-pro"],
  },
  {
    name: "mini",
    price: "$3",
    period: "/month",
    description: "Great for occasional users",
    icon: Zap,
    features: [
      "10 analyses per day",
      "25 analyses per month",
      "Document upload (up to 10MB)",
      "30-day analysis history",
      "Email support",
    ],
    limits: {
      daily_limit: 10,
      monthly_limit: 25,
      upload_limit_mb: 10,
      history_retention_days: 30,
    },
    popular: false,
    stripePrice: STRIPE_PRICES["mini"],
  },
  {
    name: "starter",
    price: "$5",
    period: "/month",
    description: "Best for individuals and small teams",
    icon: Zap,
    features: [
      "25 analyses per day",
      "100 analyses per month",
      "Document upload (up to 25MB)",
      "90-day analysis history",
      "Priority support",
      "Data visualization exports",
    ],
    limits: {
      daily_limit: 25,
      monthly_limit: 100,
      upload_limit_mb: 25,
      history_retention_days: 90,
    },
    popular: true,
    stripePrice: STRIPE_PRICES["starter"],
  },
  {
    name: "pro",
    price: "$10",
    period: "/month",
    description: "For power users and growing businesses",
    icon: Crown,
    features: [
      "50 analyses per day",
      "500 analyses per month",
      "Document upload (up to 50MB)",
      "Unlimited analysis history",
      "Priority support",
      "API access",
      "Custom report templates",
      "Team collaboration (coming soon)",
    ],
    limits: {
      daily_limit: 50,
      monthly_limit: 500,
      upload_limit_mb: 50,
      history_retention_days: null,
    },
    popular: false,
    stripePrice: STRIPE_PRICES["pro"],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle success/cancel URL params
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const planName = searchParams.get("plan");

    if (success === "true" && planName) {
      toast({
        title: "Subscription successful!",
        description: `Welcome to the ${planName.charAt(0).toUpperCase() + planName.slice(1)} plan. Refreshing your subscription status...`,
      });
      // Clear URL params and refresh subscription
      window.history.replaceState({}, "", "/pricing");
      checkSubscription();
    } else if (canceled === "true") {
      toast({
        title: "Checkout canceled",
        description: "Your subscription was not processed.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/pricing");
    }
  }, [searchParams]);

  const checkSubscription = async () => {
    if (!user) {
      setCurrentPlan(null);
      setSubscriptionEnd(null);
      return;
    }

    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      if (data) {
        setCurrentPlan(data.plan_name || "free");
        setSubscriptionEnd(data.subscription_end);
        
        // Update local user_plans table to sync with Stripe
        if (data.plan_name && data.plan_name !== "free") {
          const plan = plans.find(p => p.name === data.plan_name);
          if (plan) {
            await supabase
              .from("user_plans")
              .update({
                plan_name: data.plan_name,
                daily_limit: plan.limits.daily_limit,
                monthly_limit: plan.limits.monthly_limit,
                upload_limit_mb: plan.limits.upload_limit_mb,
                history_retention_days: plan.limits.history_retention_days ?? 36500,
                stripe_customer_id: data.stripe_customer_id,
                stripe_subscription_id: data.stripe_subscription_id,
              })
              .eq("user_id", user.id);
          }
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      // Fall back to database
      const { data, error: dbError } = await supabase
        .from("user_plans")
        .select("plan_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!dbError && data) {
        setCurrentPlan(data.plan_name);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const handleCheckout = async (planName: string, priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (planName === currentPlan) {
      toast({
        title: "Already on this plan",
        description: "You're already subscribed to this plan.",
      });
      return;
    }

    setCheckoutLoading(planName);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, planName },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Checkout error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Portal error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreePlan = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // If they have an active subscription, direct them to manage it
    if (currentPlan && currentPlan !== "free") {
      handleManageSubscription();
      return;
    }

    toast({
      title: "Already on Free plan",
      description: "You're currently on the Free plan.",
    });
  };

  const getButtonText = (planName: string) => {
    if (!user) return "Get Started";
    if (currentPlan === planName) return "Current Plan";
    if (planName === "free" && currentPlan !== "free") return "Manage Subscription";
    
    const currentIndex = plans.findIndex((p) => p.name === currentPlan);
    const targetIndex = plans.findIndex((p) => p.name === planName);
    
    if (currentIndex === -1) return "Subscribe";
    return targetIndex > currentIndex ? "Upgrade" : "Change Plan";
  };

  const getButtonVariant = (plan: Plan) => {
    if (currentPlan === plan.name) return "secondary" as const;
    if (plan.popular) return "hero" as const;
    return "outline" as const;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container px-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Simple, transparent pricing
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Choose your </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">AI Predict</span>
              <span className="text-foreground"> plan</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with our free tier and upgrade as your needs grow. All plans include access to our 
              powerful AI-driven financial analysis tools.
            </p>
            {user && (
              <div className="mt-4 flex items-center justify-center gap-3">
                {currentPlan && (
                  <Badge variant="secondary" className="text-sm">
                    Current plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </Badge>
                )}
                {subscriptionEnd && currentPlan !== "free" && (
                  <Badge variant="outline" className="text-sm">
                    Renews: {new Date(subscriptionEnd).toLocaleDateString()}
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={checkSubscription}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}
            {currentPlan && currentPlan !== "free" && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.name;
              const isCheckingOut = checkoutLoading === plan.name;
              
              return (
                <Card 
                  key={plan.name}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? "border-primary shadow-lg shadow-primary/10 scale-105" 
                      : isCurrentPlan
                      ? "border-primary/50 bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute top-0 left-0 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-br-lg">
                      Your Plan
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto p-3 rounded-xl mb-4 ${
                      plan.popular 
                        ? "bg-gradient-primary" 
                        : "bg-primary/10"
                    }`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <CardTitle className="font-display text-2xl capitalize">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="font-display text-5xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    
                    <div className="mb-6 py-3 px-4 rounded-lg bg-primary/5 border border-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {plan.limits.monthly_limit} analyses/month
                      </span>
                    </div>
                    
                    <ul className="space-y-3 mb-8 text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant={getButtonVariant(plan)} 
                      className="w-full"
                      onClick={() => {
                        if (plan.name === "free") {
                          handleFreePlan();
                        } else if (plan.stripePrice) {
                          handleCheckout(plan.name, plan.stripePrice);
                        }
                      }}
                      disabled={isCheckingOut || isCurrentPlan}
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        getButtonText(plan.name)
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold mb-4 text-foreground">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground mb-12">
              Have questions? We've got answers.
            </p>
            
            <div className="grid gap-6 text-left">
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">What counts as an analysis?</h3>
                <p className="text-sm text-muted-foreground">
                  Each time you submit a query to AI Predict, it counts as one analysis. This includes 
                  financial analysis, report generation, predictive modeling, and document Q&A queries.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">Can I upgrade or downgrade anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can change your plan at any time through the "Manage Subscription" button.
                  Changes take effect immediately and billing is prorated.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">What happens if I exceed my monthly limit?</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive a notification when approaching your limit. Once reached, you can either 
                  upgrade to a higher tier or wait until the next billing cycle for your analyses to reset.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">How do I cancel my subscription?</h3>
                <p className="text-sm text-muted-foreground">
                  You can cancel anytime through the "Manage Subscription" button. Your subscription will 
                  remain active until the end of your current billing period.
                </p>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
                Ready to transform your financial analysis?
              </h2>
              <p className="text-muted-foreground mb-6">
                {user 
                  ? "Upgrade your plan to unlock more powerful features."
                  : "Start with our free tier and experience the power of AI-driven insights."
                }
              </p>
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => {
                  if (!user) {
                    navigate("/auth");
                  } else if (STRIPE_PRICES["starter"]) {
                    handleCheckout("starter", STRIPE_PRICES["starter"]);
                  }
                }}
                disabled={checkoutLoading === "starter"}
              >
                {checkoutLoading === "starter" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : user ? (
                  "Upgrade to Starter"
                ) : (
                  "Get Started for Free"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Pricing;
