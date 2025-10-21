"use client";
import Ashaar from "@/app/EN/Components/shaer/Ashaar";
import EBkooks from "@/app/EN/Components/shaer/EBooks";
import Ghazlen from "@/app/EN/Components/shaer/Ghazlen";
import Intro2 from "@/app/EN/Components/shaer/Intro";
import Intro from "@/app/EN/Components/shaer/IntroPhoto";
import Nazmen from "@/app/EN/Components/shaer/Nazmen";
import Rubai from "@/app/EN/Components/shaer/Rubai";
import { getEnhancedLanguageFieldValue } from "@/lib/language-field-utils";
import React, { useEffect, useMemo, useState } from "react";
import "./shaer.css";

// Using simple custom nav instead of shadcn Tabs

interface IntroFields {
  description?: string;
  enDescription?: string;
  hiDescription?: string;
  takhallus: string;
  name?: string;
  dob?: string;
  location?: string;
  tafseel?: string | string[];
  searchKeys?: string | string[];
  enTakhallus?: string | string[];
  hiTakhallus?: string | string[];
  enName?: string | string[];
  hiName?: string | string[];
  enLocation?: string | string[];
  hiLocation?: string | string[];
  ghazlen?: boolean;
  eBooks?: boolean;
  nazmen?: boolean;
  ashaar?: boolean;
  rubai?: boolean;
  likes?: number;
  id?: string;
  photo?: Array<{
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    width: number;
    height: number;
    thumbnails?: {
      small: { url: string; width: number; height: number };
      large: { url: string; width: number; height: number };
      full: { url: string; width: number; height: number };
    };
  }>;
}

interface ShaerRecord {
  fields: IntroFields;
  id: string;
}

const ShaerComponent = ({
  params,
  initialData,
}: {
  params: { name: string };
  initialData: ShaerRecord;
}) => {
  const nameParam = params.name;
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use server-side data with language-aware field selection for English
  const data: IntroFields = useMemo(() => {
    const rec = initialData?.fields || {};

    // Normalize text fields with English preference
    const toStringMultiline = (v?: string | string[]) =>
      Array.isArray(v) ? v.join("\n") : String(v ?? "");
    const toLines = (v?: string | string[]) =>
      typeof v === "string"
        ? v.replace(/\r\n?/g, "\n").split("\n").filter(Boolean)
        : (v as string[] | undefined);

    return {
      ...rec,
      // Use enhanced English fields with fallback
      takhallus: getEnhancedLanguageFieldValue(rec, 'takhallus', 'EN', 'shaer', ['EN', 'UR', 'HI']) || rec.takhallus,
      name: getEnhancedLanguageFieldValue(rec, 'name', 'EN', 'shaer', ['EN', 'UR', 'HI']) || rec.name,
      location: getEnhancedLanguageFieldValue(rec, 'location', 'EN', 'shaer', ['EN', 'UR', 'HI']) || rec.location,
      description: getEnhancedLanguageFieldValue(rec, 'description', 'EN', 'shaer', ['EN', 'UR', 'HI']) || rec.description,
      tafseel: toStringMultiline(getEnhancedLanguageFieldValue(rec, 'tafseel', 'EN', 'shaer', ['EN', 'UR', 'HI']) || rec.tafseel),
      searchKeys: toLines(rec.searchKeys),
      enTakhallus: toLines(rec.enTakhallus),
      hiTakhallus: toLines(rec.hiTakhallus),
      enName: toLines(rec.enName),
      hiName: toLines(rec.hiName),
      enLocation: toLines(rec.enLocation),
      hiLocation: toLines(rec.hiLocation),
      likes: Number(rec.likes || 0),
      id: rec.id || initialData?.id,
    } as IntroFields;
  }, [initialData]);

  // Active tab handling with English labels
  const [activeNav, setActiveNav] = useState<string>("");
  useEffect(() => {
    const initializeActiveNav = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      setActiveNav(tab || "Introduction");
    };
    initializeActiveNav();
    window.addEventListener("popstate", initializeActiveNav);
    return () => window.removeEventListener("popstate", initializeActiveNav);
  }, []);

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    // Update URL to reflect the active tab
    const url = new URL(window.location.href);
    url.searchParams.set('tab', nav);
    window.history.pushState({}, '', url.toString());
  };

  const handleLinkClick =
    (nav: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Only intercept plain left-clicks so ctrl/cmd/shift/middle-click still work
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      e.preventDefault();
      handleNavClick(nav);
    };

  // Show loading state during hydration to prevent hook mismatch
  if (!isClient) {
    return (
      <div dir="ltr" className="container mx-auto flex flex-col">
        <div className="h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div dir="ltr" className="container mx-auto flex flex-col">
      <Intro
        data={data as any}
        currentTab={activeNav}
        recordId={initialData?.id}
        showLikeButton={true}
        baseId={require("@/lib/airtable-client-utils").getClientBaseId("SHAER")}
        table="Intro"
        storageKey="Shura"
        onLikeChange={({ id, liked, likes }) => {
          console.info("Poet like changed", { id, liked, likes });
        }}
      />
      <div className="inner-navs w-full md:w-[80vw] flex flex-row gap-3 border-b-2 self-center pb-0 px-4 pt-4 text-xl">
        <div
          className={`nav-item ${activeNav === "Introduction" ? "active" : ""
            } min-w-[40px] text-center transition-all ease-in-out duration-500`}
        >
          <a
            href={`/EN/Shaer/${nameParam}?tab=${encodeURIComponent("Introduction")}`}
            onClick={handleLinkClick("Introduction")}
          >
            Introduction
          </a>
        </div>
        {data.ghazlen && (
          <div
            className={`nav-item ${activeNav === "Ghazals" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=${encodeURIComponent("Ghazals")}`}
              onClick={handleLinkClick("Ghazals")}
            >
              Ghazals
            </a>
          </div>
        )}
        {data.nazmen && (
          <div
            className={`nav-item ${activeNav === "Poems" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=${encodeURIComponent("Poems")}`}
              onClick={handleLinkClick("Poems")}
            >
              Poems
            </a>
          </div>
        )}
        {data.ashaar && (
          <div
            className={`nav-item ${activeNav === "Couplets" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=${encodeURIComponent("Couplets")}`}
              onClick={handleLinkClick("Couplets")}
            >
              Couplets
            </a>
          </div>
        )}
        {data.eBooks && (
          <div
            className={`nav-item ${activeNav === "E-Books" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=${encodeURIComponent("E-Books")}`}
              onClick={handleLinkClick("E-Books")}
            >
              E-Books
            </a>
          </div>
        )}
        {data.rubai && (
          <div
            className={`nav-item ${activeNav === "Quatrains" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=${encodeURIComponent("Quatrains")}`}
              onClick={handleLinkClick("Quatrains")}
            >
              Quatrains
            </a>
          </div>
        )}
      </div>
      {activeNav === "Introduction" && <Intro2 data={data as any} />}
      {activeNav === "Ghazals" && (
        <Ghazlen takhallus={data.takhallus as string} />
      )}
      {activeNav === "Poems" && (
        <Nazmen takhallus={data.takhallus as string} />
      )}
      {activeNav === "Couplets" && (
        <Ashaar takhallus={data.takhallus as string} />
      )}
      {activeNav === "E-Books" && (
        <EBkooks takhallus={data.takhallus as string} />
      )}
      {activeNav === "Quatrains" && (
        <Rubai takhallus={data.takhallus as string} />
      )}
    </div>
  )
};

export default ShaerComponent;