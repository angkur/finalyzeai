import { useEffect } from "react";
import { Check, Sparkles, Star, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out AI Predict",
    analyses: "5 analyses/month",
    icon: Sparkles,
    features: [
      "5 AI-powered analyses per month",
      "Basic financial insights",
      "Document upload (up to 5MB)",
      "Standard response time",
      "Community support",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Mini",
    price: "$3",
    period: "/month",
    description: "Great for occasional users",
    analyses: "25 analyses/month",
    icon: Star,
    features: [
      "25 AI-powered analyses per month",
      "Basic financial insights",
      "Document upload (up to 10MB)",
      "Standard response time",
      "Email support",
      "Analysis history (30 days)",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Starter",
    price: "$12",
    period: "/month",
    description: "Best for individuals and small teams",
    analyses: "100 analyses/month",
    icon: Zap,
    features: [
      "100 AI-powered analyses per month",
      "Advanced financial modeling",
      "Document upload (up to 25MB)",
      "Priority response time",
      "Data visualization exports",
      "Email support",
      "Analysis history (90 days)",
    ],
    cta: "Start Free Trial",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For power users and growing businesses",
    analyses: "500 analyses/month",
    icon: Crown,
    features: [
      "500 AI-powered analyses per month",
      "All Starter features",
      "Predictive modeling & forecasting",
      "Document upload (up to 100MB)",
      "Custom report templates",
      "API access",
      "Priority support",
      "Unlimited analysis history",
      "Team collaboration (coming soon)",
    ],
    cta: "Start Free Trial",
    variant: "outline" as const,
    popular: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/#demo");
    } else {
      navigate("/auth");
    }
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
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? "border-primary shadow-lg shadow-primary/10 scale-105" 
                      : "hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Most Popular
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
                    <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="font-display text-5xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    
                    <div className="mb-6 py-3 px-4 rounded-lg bg-primary/5 border border-primary/10">
                      <span className="text-sm font-semibold text-primary">{plan.analyses}</span>
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
                      variant={plan.variant} 
                      className="w-full"
                      onClick={handleGetStarted}
                    >
                      {plan.cta}
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
                  Yes! You can change your plan at any time. When upgrading, you'll get immediate access 
                  to additional features. When downgrading, the change takes effect at the next billing cycle.
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
                <h3 className="font-semibold mb-2 text-foreground">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  The Free plan gives you 5 analyses per month to try out AI Predict. For Starter and Pro 
                  plans, we offer a 7-day free trial so you can experience the full power of our AI tools.
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
                Start with our free tier and experience the power of AI-driven insights.
              </p>
              <Button variant="hero" size="lg" onClick={handleGetStarted}>
                Get Started for Free
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
