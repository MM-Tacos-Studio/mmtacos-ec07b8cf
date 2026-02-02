import { useState, useEffect } from "react";
import type { DeliveryMode } from "@/components/TopBar";

const STORAGE_KEY = "mm-tacos-delivery-mode";

export const useDeliveryMode = () => {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "livraison" || stored === "emporter") {
      setDeliveryMode(stored);
    } else {
      // Show modal after a short delay for first-time visitors
      const timer = setTimeout(() => {
        setShowModeModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when mode changes
  const handleModeChange = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
    if (mode) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
    setShowModeModal(false);
    setIsInitialized(true);
  };

  return {
    deliveryMode,
    showModeModal,
    isInitialized,
    setDeliveryMode: handleModeChange,
  };
};
