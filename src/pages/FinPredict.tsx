import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIDemo from "@/components/AIDemo";
import ToolLanding from "@/components/ToolLanding";
import { finPredictLanding } from "@/config/toolLandings";
import { useAuth } from "@/contexts/AuthContext";

const FinPredict = () => {
  const { user, isLoading } = useAuth();

  // Public, indexable marketing page for signed-out visitors
  if (!isLoading && !user) {
    return <ToolLanding {...finPredictLanding} />;
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
