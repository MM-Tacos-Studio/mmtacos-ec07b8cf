import { useState, useEffect } from "react";
import { Phone, Clock, Download, MapPin, Truck, ChevronDown } from "lucide-react";

export type DeliveryMode = "livraison" | "emporter" | null;

interface TopBarProps {
  deliveryMode?: DeliveryMode;
  onModeChange?: (mode: DeliveryMode) => void;
  showInstallButton?: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const TopBar = ({ deliveryMode, onModeChange, showInstallButton = true }: TopBarProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isInStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Handle Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    }
  };

  const handleModeSelect = (mode: DeliveryMode) => {
    onModeChange?.(mode);
    setShowModeDropdown(false);
  };

  return (
    <div className="bg-primary py-2 px-4">
      <div className="container mx-auto flex items-center justify-between text-primary-foreground text-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <a href="tel:+22373360131" className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity">
            <Phone className="h-4 w-4" />
            <span className="font-medium text-xs md:text-sm">+223 73 36 01 31</span>
          </a>
          
          {/* Delivery Mode Indicator */}
          {deliveryMode && (
            <div className="relative">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
              >
                {deliveryMode === "livraison" ? (
                  <>
                    <Truck className="h-3 w-3" />
                    <span className="hidden sm:inline">Livraison</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span className="hidden sm:inline">Sur place</span>
                  </>
                )}
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showModeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[100] min-w-[180px] overflow-hidden">
                  <button
                    onClick={() => handleModeSelect("livraison")}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${deliveryMode === "livraison" ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <Truck className="h-4 w-4" />
                    Livraison
                  </button>
                  <button
                    onClick={() => handleModeSelect("emporter")}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${deliveryMode === "emporter" ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <MapPin className="h-4 w-4" />
                    Je viendrais récupérer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Install Button - Only show if not standalone and prompt available */}
          {showInstallButton && !isStandalone && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Installer</span>
            </button>
          )}
          
          <div className="flex items-center gap-1 md:gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-xs md:text-sm">9h - 4h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
