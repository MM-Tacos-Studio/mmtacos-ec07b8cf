import { useState, useEffect } from "react";

/**
 * Detects if the app is running inside a Capacitor native container (iOS/Android)
 * vs a regular web browser.
 */
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Capacitor injects a global object when running in native mode
    const win = window as any;
    const native =
      !!win.Capacitor?.isNativePlatform?.() ||
      !!win.Capacitor?.isPluginAvailable;
    setIsNative(native);
  }, []);

  return isNative;
}
