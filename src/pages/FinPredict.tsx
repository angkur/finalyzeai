import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIDemo from "@/components/AIDemo";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const FinPredict = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show login prompt for non-authenticated users
  if (!isLoading && !user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="p-4 rounded-full bg-primary/10 inline-block mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4 text-foreground">
              Sign in Required
            </h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to access the Fin Predict analysis tools and start analyzing your financial data.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <AIDemo />
      </div>
      <Footer />
    </main>
  );
};

export default FinPredict;
