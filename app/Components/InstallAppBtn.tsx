"use client";
import React, { useEffect, useState } from "react";
import "../../public/sw";

const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Detect if app is running in standalone mode (PWA)
    const checkStandaloneMode = () => {
      // Check for display-mode: standalone
      const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;

      // Check for iOS standalone mode
      const isIOSStandalone = (window.navigator as any).standalone === true;

      // Check for Android standalone mode (fallback)
      const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;

      return isStandaloneDisplay || isIOSStandalone || isAndroidStandalone;
    };

    setIsStandalone(checkStandaloneMode());

    // Listen for display mode changes
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches || (window.navigator as any).standalone === true);
    };

    standaloneMediaQuery.addEventListener('change', handleDisplayModeChange);

    const handleBeforeInstallPrompt = (e: any) => {
      console.log("fired inside useEffect");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallPrompt = () => {
    console.log("handleInstallPrompt is fired");
    if (typeof window !== "undefined") {
      if (deferredPrompt) {
        console.log("Inside deferredPrompt block");
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the A2HS prompt");
          } else {
            console.log("User dismissed the A2HS prompt");
          }
          setDeferredPrompt(null);
        });
      }
    }
  };

  // Don't render the button if app is in standalone mode (PWA)
  if (isStandalone) {
    return null;
  }

  return (
    <button
      onClick={handleInstallPrompt}
      className="bg-[#984A02] text-white hover:text-[#984A02] hover:bg-white transition-all 500ms ease-in-out p-2 rounded-sm mr-3 w-32 text-[1rem]"
    >
      ایپ انسٹال کریں
    </button>
  );
};

export default InstallPWAButton;
