import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < dayInMs) {
        return;
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show banner for iOS after a delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle beforeinstallprompt for Android/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-primary/95 to-accent/95 backdrop-blur-lg border-t border-primary/20 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                  Install AI Predict
                </h3>
                <p className="text-white/80 text-xs sm:text-sm truncate">
                  {isIOS
                    ? "Tap Share → Add to Home Screen"
                    : "Get quick access from your home screen"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!isIOS && deferredPrompt && (
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Install</span>
                </Button>
              )}
              <Button
                onClick={handleDismiss}
                size="icon"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;