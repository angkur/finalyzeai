import { useEffect, useState } from "react";
import { Check, Sparkles, Star, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  },
  {
    name: "starter",
    price: "$12",
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
  },
  {
    name: "pro",
    price: "$29",
    period: "/month",
    description: "For power users and growing businesses",
    icon: Crown,
    features: [
      "100 analyses per day",
      "500 analyses per month",
      "Document upload (up to 100MB)",
      "Unlimited analysis history",
      "Priority support",
      "API access",
      "Custom report templates",
      "Team collaboration (coming soon)",
    ],
    limits: {
      daily_limit: 100,
      monthly_limit: 500,
      upload_limit_mb: 100,
      history_retention_days: null,
    },
    popular: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user) {
        setCurrentPlan(null);
        return;
      }

      const { data, error } = await supabase
        .from("user_plans")
        .select("plan_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setCurrentPlan(data.plan_name);
      }
    };

    fetchCurrentPlan();
  }, [user]);

  const handlePlanChange = async (planName: string) => {
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

    const plan = plans.find((p) => p.name === planName);
    if (!plan) return;

    setChangingPlan(planName);
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("user_plans")
        .update({
          plan_name: planName,
          daily_limit: plan.limits.daily_limit,
          monthly_limit: plan.limits.monthly_limit,
          upload_limit_mb: plan.limits.upload_limit_mb,
          history_retention_days: plan.limits.history_retention_days ?? 36500, // ~100 years for unlimited
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setCurrentPlan(planName);
      toast({
        title: "Plan updated!",
        description: `You've successfully switched to the ${planName.charAt(0).toUpperCase() + planName.slice(1)} plan.`,
      });
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error updating plan",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setChangingPlan(null);
    }
  };

  const getButtonText = (planName: string) => {
    if (!user) return "Get Started";
    if (currentPlan === planName) return "Current Plan";
    
    const currentIndex = plans.findIndex((p) => p.name === currentPlan);
    const targetIndex = plans.findIndex((p) => p.name === planName);
    
    if (currentIndex === -1) return "Get Started";
    return targetIndex > currentIndex ? "Upgrade" : "Downgrade";
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
            {currentPlan && (
              <div className="mt-4">
                <Badge variant="secondary" className="text-sm">
                  Current plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </Badge>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.name;
              const isChanging = changingPlan === plan.name;
              
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
                      onClick={() => handlePlanChange(plan.name)}
                      disabled={isLoading || isCurrentPlan}
                    >
                      {isChanging ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
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
                  Yes! You can change your plan at any time. Your new limits take effect immediately.
                  When upgrading, you'll get instant access to higher limits. When downgrading, your 
                  limits will be adjusted right away.
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
                <h3 className="font-semibold mb-2 text-foreground">What is analysis history retention?</h3>
                <p className="text-sm text-muted-foreground">
                  Analysis history retention determines how long your past analyses and uploaded documents 
                  are stored. Free users get 7 days, while Pro users enjoy unlimited history retention.
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
                onClick={() => user ? handlePlanChange("starter") : navigate("/auth")}
              >
                {user ? "Upgrade to Starter" : "Get Started for Free"}
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
