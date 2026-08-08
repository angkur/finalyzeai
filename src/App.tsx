import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import SplashScreen from "@/components/SplashScreen";
import RouteMeta from "@/components/RouteMeta";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import UserGuide from "./pages/UserGuide";
import AiTools from "./pages/AiTools";
import ContactPage from "./pages/Contact";
import Calculators from "./pages/Calculators";
import SharedResult from "./pages/SharedResult";
import CalculatorDetail from "./pages/CalculatorDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import AiPredict from "./pages/AiPredict";
import FinPredict from "./pages/FinPredict";
import UsageDashboard from "./pages/UsageDashboard";
import Analytics from "./pages/Analytics";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import Glossary from "./pages/Glossary";
import Faq from "./pages/Faq";
import EditorialPolicy from "./pages/EditorialPolicy";
import OAuthConsent from "./pages/OAuthConsent";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Only show splash on first visit or PWA launch
    const hasVisited = sessionStorage.getItem("app_loaded");
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    
    if (!hasVisited || isPWA) {
      setIsFirstVisit(true);
      sessionStorage.setItem("app_loaded", "true");
    } else {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {showSplash && isFirstVisit && (
        <SplashScreen onComplete={handleSplashComplete} minDuration={2200} />
      )}
      <BrowserRouter>
        <RouteMeta />
        <AuthProvider>
          <AnalyticsProvider>
            <PWAInstallBanner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/user-guide" element={<UserGuide />} />
              <Route path="/ai-tools" element={<AiTools />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/calculators/:slug" element={<CalculatorDetail />} />
              <Route path="/r/:type" element={<SharedResult />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/ai-predict" element={<AiPredict />} />
              <Route path="/fin-predict" element={<FinPredict />} />
              <Route path="/usage" element={<UsageDashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/subscription" element={<SubscriptionManagement />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/editorial-policy" element={<EditorialPolicy />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnalyticsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
