import { useState, useEffect } from "react";
import type { DeliveryMode } from "@/components/TopBar";

const MODE_STORAGE_KEY = "mm-tacos-delivery-mode";
const ADDRESS_STORAGE_KEY = "mm-tacos-delivery-address";

export const useDeliveryMode = () => {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showModeModal, setShowModeModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
    const storedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY);
    
    if (storedMode === "livraison" || storedMode === "emporter") {
      setDeliveryMode(storedMode);
      if (storedAddress) {
        setDeliveryAddress(storedAddress);
      }
    } else {
      // Show modal after a short delay for first-time visitors
      const timer = setTimeout(() => {
        setShowModeModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    setIsInitialized(true);
  }, []);

  // Save mode and address to localStorage
  const handleModeChange = (mode: DeliveryMode, address?: string) => {
    setDeliveryMode(mode);
    if (mode) {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
    if (address) {
      setDeliveryAddress(address);
      localStorage.setItem(ADDRESS_STORAGE_KEY, address);
    }
    setShowModeModal(false);
    setIsInitialized(true);
  };

  // Handle "View Menu" without selecting mode
  const handleViewMenu = () => {
    setShowModeModal(false);
    setIsInitialized(true);
  };

  return {
    deliveryMode,
    deliveryAddress,
    showModeModal,
    isInitialized,
    setDeliveryMode: handleModeChange,
    handleViewMenu,
  };
};
