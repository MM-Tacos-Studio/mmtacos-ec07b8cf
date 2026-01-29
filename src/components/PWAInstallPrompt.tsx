import { useState, useEffect } from "react";
import { X, Share, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const checkStandalone = () => {
      const isInStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isInStandaloneMode);
    };
    
    checkStandalone();

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < threeDays) {
        return;
      }
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari && !isStandalone) {
      // Show iOS prompt after a short delay
      setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    // Handle Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowAndroidPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleDismiss = () => {
    setShowIOSPrompt(false);
    setShowAndroidPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowAndroidPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) return null;

  // iOS Install Prompt
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 mx-4 mb-4 rounded-2xl shadow-2xl">
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-xl p-2 flex-shrink-0">
              <img 
                src="/icon-192x192.png" 
                alt="MM Tacos" 
                className="w-12 h-12 rounded-lg"
              />
            </div>
            
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-lg mb-1">Installer MM Tacos</h3>
              <p className="text-sm text-white/90 mb-3">
                Accédez rapidement à nos tacos depuis votre écran d'accueil !
              </p>
              
              <div className="bg-white/20 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-white text-orange-500 rounded-full p-1.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <span>Appuyez sur <strong>Partager</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-white text-orange-500 rounded-full p-1.5">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Puis <strong>"Sur l'écran d'accueil"</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android Install Prompt
  if (showAndroidPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 mx-4 mb-4 rounded-2xl shadow-2xl">
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl p-2 flex-shrink-0">
              <img 
                src="/icon-192x192.png" 
                alt="MM Tacos" 
                className="w-12 h-12 rounded-lg"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Installer MM Tacos</h3>
              <p className="text-sm text-white/90">
                Ajoutez l'app à votre écran d'accueil pour commander plus vite !
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="flex-1 text-white hover:bg-white/20 border border-white/30"
            >
              Plus tard
            </Button>
            <Button
              onClick={handleAndroidInstall}
              className="flex-1 bg-white text-orange-500 hover:bg-white/90 font-bold"
            >
              <Download className="w-4 h-4 mr-2" />
              Installer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;
