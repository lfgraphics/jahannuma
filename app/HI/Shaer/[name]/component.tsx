"use client";
import Ashaar from "@/app/HI/Components/shaer/Ashaar";
import EBkooks from "@/app/HI/Components/shaer/EBooks";
import Ghazlen from "@/app/HI/Components/shaer/Ghazlen";
import Intro2 from "@/app/HI/Components/shaer/Intro";
import Intro from "@/app/HI/Components/shaer/IntroPhoto";
import Nazmen from "@/app/HI/Components/shaer/Nazmen";
import Rubai from "@/app/HI/Components/shaer/Rubai";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

  // Use server-side data with language-aware field selection for Hindi
  const data: IntroFields = useMemo(() => {
    const rec = initialData?.fields || {};

    // Normalize text fields with Hindi preference
    const toStringMultiline = (v?: string | string[]) =>
      Array.isArray(v) ? v.join("\n") : String(v ?? "");
    const toLines = (v?: string | string[]) =>
      typeof v === "string"
        ? v.replace(/\r\n?/g, "\n").split("\n").filter(Boolean)
        : (v as string[] | undefined);

    return {
      ...rec,
      // Use enhanced Hindi fields with fallback
      takhallus: getEnhancedLanguageFieldValue(rec, 'takhallus', 'HI', 'shaer', ['HI', 'UR', 'EN']) || rec.takhallus,
      name: getEnhancedLanguageFieldValue(rec, 'name', 'HI', 'shaer', ['HI', 'UR', 'EN']) || rec.name,
      location: getEnhancedLanguageFieldValue(rec, 'location', 'HI', 'shaer', ['HI', 'UR', 'EN']) || rec.location,
      description: getEnhancedLanguageFieldValue(rec, 'description', 'HI', 'shaer', ['HI', 'UR', 'EN']) || rec.description,
      tafseel: toStringMultiline(getEnhancedLanguageFieldValue(rec, 'tafseel', 'HI', 'shaer', ['HI', 'UR', 'EN']) || rec.tafseel),
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

  // Active tab handling with Hindi labels
  const [activeNav, setActiveNav] = useState<string>("");
  useEffect(() => {
    const initializeActiveNav = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      setActiveNav(tab || "परिचय");
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
          <div className="text-lg">लोड हो रहा है...</div>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div dir="ltr" className="container mx-auto flex flex-col">
        <Intro
          data={data as any}
          currentTab={activeNav}
          recordId={initialData?.id}
          showLikeButton={true}
          baseId="appgWv81tu4RT3uRB"
          table="Intro"
          storageKey="Shura"
          onLikeChange={({ id, liked, likes }) => {
            console.info("Poet like changed", { id, liked, likes });
          }}
        />
        <div className="inner-navs w-full md:w-[80vw] flex flex-row gap-3 border-b-2 self-center pb-0 px-4 pt-4 text-xl">
          <div
            className={`nav-item ${activeNav === "परिचय" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/HI/Shaer/${nameParam}?tab=${encodeURIComponent("परिचय")}`}
              onClick={handleLinkClick("परिचय")}
            >
              परिचय
            </a>
          </div>
          {data.ghazlen && (
            <div
              className={`nav-item ${activeNav === "गज़लें" ? "active" : ""
                } min-w-[40px] text-center transition-all ease-in-out duration-500`}
            >
              <a
                href={`/HI/Shaer/${nameParam}?tab=${encodeURIComponent("गज़लें")}`}
                onClick={handleLinkClick("गज़लें")}
              >
                गज़लें
              </a>
            </div>
          )}
          {data.nazmen && (
            <div
              className={`nav-item ${activeNav === "नज़्में" ? "active" : ""
                } min-w-[40px] text-center transition-all ease-in-out duration-500`}
            >
              <a
                href={`/HI/Shaer/${nameParam}?tab=${encodeURIComponent("नज़्में")}`}
                onClick={handleLinkClick("नज़्में")}
              >
                नज़्में
              </a>
            </div>
          )}
          {data.ashaar && (
            <div
              className={`nav-item ${activeNav === "अशआर" ? "active" : ""
                } min-w-[40px] text-center transition-all ease-in-out duration-500`}
            >
              <a
                href={`/HI/Shaer/${nameParam}?tab=${encodeURIComponent("अशआर")}`}
                onClick={handleLinkClick("अशआर")}
              >
                अशआर
              </a>
            </div>
          )}
          {data.eBooks && (
            <div
              className={`nav-item ${activeNav === "ई-बुक्स" ? "active" : ""
                } min-w-[40px] text-center transition-all ease-in-out duration-500`}
            >
              <a
                href={`/HI/Shaer/${nameParam}?tab=${encodeURIComponent("ई-बुक्स")}`}
                onClick={handleLinkClick("ई-बुक्स")}
              >
                ई-बुक्स
              </a>
            </div>
          )}
          {data.rubai && (
            <div
              className={`nav-item ${activeNav === "रुबाई" ? "active" : ""
                } min-w-[40px] text-center transition-all ease-in-out duration-500`}
            >
              <a
                href={`/HI/Shaer/${nameParam}?tab=${encodeURIComponent("रुबाई")}`}
                onClick={handleLinkClick("रुबाई")}
              >
                रुबाई
              </a>
            </div>
          )}
        </div>
        {activeNav === "परिचय" && <Intro2 data={data as any} />}
        {activeNav === "गज़लें" && (
          <Ghazlen takhallus={data.takhallus as string} />
        )}
        {activeNav === "नज़्में" && (
          <Nazmen takhallus={data.takhallus as string} />
        )}
        {activeNav === "अशआर" && (
          <Ashaar takhallus={data.takhallus as string} />
        )}
        {activeNav === "ई-बुक्स" && (
          <EBkooks takhallus={data.takhallus as string} />
        )}
        {activeNav === "रुबाई" && (
          <Rubai takhallus={data.takhallus as string} />
        )}
      </div>
    </LanguageProvider>
  );
};

export default ShaerComponent;