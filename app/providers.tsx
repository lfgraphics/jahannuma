"use client";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TourProvider } from "@/contexts/TourContext";
import { ThemeProvider } from "next-themes";
import React from "react";

// Suppress React 19 false-positive warning for next-themes script tag in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    origError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TourProvider>
          <Toaster richColors position="top-right" closeButton dir="rtl" />
          {children}
        </TourProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default Providers;
