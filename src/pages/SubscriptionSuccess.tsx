import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Crown, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import confetti from "canvas-confetti";

const TIERS = {
  starter: {
    name: "AI Predict Starter",
    price: "$5",
    icon: Zap,
    color: "text-blue-500",
    features: ["10 predictions/day", "Basic analytics", "Email support"],
  },
  pro: {
    name: "AI Predict Pro",
    price: "$10",
    icon: Sparkles,
    color: "text-purple-500",
    features: ["50 predictions/day", "Advanced analytics", "Priority support", "API access"],
  },
  enterprise: {
    name: "AI Predict Enterprise",
    price: "$25",
    icon: Crown,
    color: "text-amber-500",
    features: ["Unlimited predictions", "Custom models", "Dedicated support", "SLA guarantee", "Team collaboration"],
  },
};

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") as keyof typeof TIERS | null;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Fire confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#22c55e", "#eab308"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Show content after a short delay
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const selectedTier = tier && TIERS[tier] ? TIERS[tier] : TIERS.starter;
  const TierIcon = selectedTier.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className={`max-w-lg w-full transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 relative">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-scale-in">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TierIcon className={`w-5 h-5 ${selectedTier.color}`} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Subscription Activated!</CardTitle>
            <p className="text-muted-foreground mt-2">
              Welcome to {selectedTier.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Plan</p>
              <p className="text-xl font-semibold">{selectedTier.name}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {selectedTier.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">What's included:</p>
              <ul className="space-y-2">
                {selectedTier.features.map((feature, index) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm animate-fade-in"
                    style={{ animationDelay: `${index * 100 + 500}ms` }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button asChild size="lg" className="w-full">
                <Link to="/ai-predict">Start Using AI Predict</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/usage">View Usage Dashboard</Link>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              A confirmation email has been sent to your registered email address.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
