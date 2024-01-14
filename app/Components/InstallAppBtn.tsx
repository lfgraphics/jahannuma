// InstallPWAButton.tsx

"use client";
import "../../public/service-worker";
import React, { useEffect, useState } from "react";

const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
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
    };
  }, [deferredPrompt]);

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

  return (
    <button
      onClick={handleInstallPrompt}
      className="bg-[#984A02] text-white hover:text-[#984A02] hover:bg-white transition-all 500ms ease-in-out p-2 rounded-sm mr-3 w-32 text-[1rem] standalone:hidden"
    >
      ایپ انسٹال کریں
    </button>
  );
};

export default InstallPWAButton;
