"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/multilingual-texts";
import { isLangRTL } from "@/lib/multilingual-texts";

type LanguageCtx = {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageCtx | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("UR");

  // Initialize from localStorage; fallback to pathname
  useEffect(() => {
    try {
      const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Language | null;
      if (saved && ["EN", "UR", "HI"].includes(saved)) {
        setLanguageState(saved);
        return;
      }
    } catch {}

    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const match = pathname.match(/^\/(EN|HI)(?=\/|$)/);
      const inferred = (match ? (match[1] as Language) : "UR") as Language;
      setLanguageState(inferred);
      try {
        localStorage.setItem("lang", inferred);
      } catch {}
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== "undefined") localStorage.setItem("lang", lang);
    } catch {}
  };

  const value = useMemo<LanguageCtx>(() => ({ language, setLanguage, isRTL: isLangRTL(language) }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
