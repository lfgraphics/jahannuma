"use client";
import Ashaar from "../../Components/shaer/Ashaar";
import EBkooks from "../../Components/shaer/EBooks";
import Ghazlen from "../../Components/shaer/Ghazlen";
import Intro2 from "../../Components/shaer/Intro";
import Intro from "../../Components/shaer/IntroPhoto";
import Nazmen from "../../Components/shaer/Nazmen";
import Rubai from "../../Components/shaer/Rubai";
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
  enTafseel?: string | string[];
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

  // Use server-side data directly, no need for client-side fetching
  const data: IntroFields = useMemo(() => {
    const rec = initialData?.fields || {};
    // Normalize text fields:
    // - tafseel MUST be a single string for consumers (Intro/IntroPhoto) that call string methods
    // - other multi-value fields can stay arrays (split later in UI as needed)
    const toStringMultiline = (v?: string | string[]) =>
      Array.isArray(v) ? v.join("\n") : String(v ?? "");
    const toSingleLine = (primary?: string | string[], fallback?: string | string[]) => {
      const preferred = Array.isArray(primary)
        ? primary.find(Boolean)
        : String(primary ?? "").trim();
      if (preferred) return String(preferred).trim();
      if (Array.isArray(fallback)) return String(fallback.find(Boolean) ?? "").trim();
      return String(fallback ?? "").trim();
    };
    const toLines = (v?: string | string[]) =>
      typeof v === "string"
        ? v.replace(/\r\n?/g, "\n").split("\n").filter(Boolean)
        : (v as string[] | undefined);
    return {
      ...rec,
      description: toStringMultiline(rec.enDescription ?? rec.description),
      takhallus: toSingleLine(rec.enTakhallus, rec.takhallus),
      name: toSingleLine(rec.enName, rec.name),
      location: toSingleLine(rec.enLocation, rec.location),
      tafseel: toStringMultiline(rec.enTafseel ?? rec.tafseel),
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

  // Active tab handling
  const [activeNav, setActiveNav] = useState<string>("intro");
  useEffect(() => {
    const initializeActiveNav = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = (urlParams.get("tab") || "").trim();
      const lower = tab.toLowerCase();
      const normalized =
        lower === "intro" || lower === "ta'aruf" || tab === "تعارف"
          ? "intro"
          : lower === "ghazlen" || tab === "غزلیں"
            ? "ghazlen"
            : lower === "nazmen" || tab === "نظمیں"
              ? "nazmen"
              : lower === "ashaar" || lower === "ash'ar" || tab === "اشعار"
                ? "ashaar"
                : lower === "ebooks" || lower === "e-books" || tab === "ای-بکس" || tab === "ئی - بکس"
                  ? "ebooks"
                  : lower === "rubai" || lower === "ruba'i" || tab === "رباعی"
                    ? "rubai"
                    : "intro";
      setActiveNav(normalized);
    };
    initializeActiveNav();
    window.addEventListener("popstate", initializeActiveNav);
    return () => window.removeEventListener("popstate", initializeActiveNav);
  }, []);

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    // Update URL to reflect the active tab
    const url = new URL(window.location.href);
    url.searchParams.set("tab", nav);
    window.history.pushState({}, "", url.toString());
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
          className={`nav-item ${activeNav === "intro" ? "active" : ""
            } min-w-[40px] text-center transition-all ease-in-out duration-500`}
        >
          <a
            href={`/EN/Shaer/${nameParam}?tab=intro`}
            onClick={handleLinkClick("intro")}
          >
            Ta'aruf
          </a>
        </div>
        {data.ghazlen && (
          <div
            className={`nav-item ${activeNav === "ghazlen" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=ghazlen`}
              onClick={handleLinkClick("ghazlen")}
            >
              Ghazlen
            </a>
          </div>
        )}
        {data.nazmen && (
          <div
            className={`nav-item ${activeNav === "nazmen" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=nazmen`}
              onClick={handleLinkClick("nazmen")}
            >
              Nazmen
            </a>
          </div>
        )}
        {data.ashaar && (
          <div
            className={`nav-item ${activeNav === "ashaar" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=ashaar`}
              onClick={handleLinkClick("ashaar")}
            >
              Ash'ar
            </a>
          </div>
        )}
        {data.eBooks && (
          <div
            className={`nav-item ${activeNav === "ebooks" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=ebooks`}
              onClick={handleLinkClick("ebooks")}
            >
              E-Books
            </a>
          </div>
        )}
        {data.rubai && (
          <div
            className={`nav-item ${activeNav === "rubai" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/EN/Shaer/${nameParam}?tab=rubai`}
              onClick={handleLinkClick("rubai")}
            >
              Ruba'i
            </a>
          </div>
        )}
      </div>
      {activeNav === "intro" && <Intro2 data={data as any} />}
      {activeNav === "ghazlen" && (
        <Ghazlen takhallus={data.takhallus as string} />
      )}
      {activeNav === "nazmen" && (
        <Nazmen takhallus={data.takhallus as string} />
      )}
      {activeNav === "ashaar" && (
        <Ashaar takhallus={data.takhallus as string} />
      )}
      {activeNav === "ebooks" && (
        <EBkooks takhallus={data.takhallus as string} />
      )}
      {activeNav === "rubai" && (
        <Rubai takhallus={data.takhallus as string} />
      )}
    </div>
  );
};

export default ShaerComponent;
