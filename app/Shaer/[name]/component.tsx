"use client";
import Ashaar from "@/app/Components/shaer/Ashaar";
import EBkooks from "@/app/Components/shaer/EBooks";
import Ghazlen from "@/app/Components/shaer/Ghazlen";
import Intro2 from "@/app/Components/shaer/Intro";
import Intro from "@/app/Components/shaer/IntroPhoto";
import Nazmen from "@/app/Components/shaer/Nazmen";
import Rubai from "@/app/Components/shaer/Rubai";
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
    const toLines = (v?: string | string[]) =>
      typeof v === "string"
        ? v.replace(/\r\n?/g, "\n").split("\n").filter(Boolean)
        : (v as string[] | undefined);
    return {
      ...rec,
      tafseel: toStringMultiline(rec.tafseel),
      searchKeys: toLines(rec.searchKeys),
      enTakhallus: toLines(rec.enTakhallus),
      hiTakhallus: toLines(rec.hiTakhallus),
      enName: toLines(rec.enName),
      hiName: toLines(rec.hiName),
      enLocation: toLines(rec.enLocation),
      hiLocation: toLines(rec.hiLocation),
    } as IntroFields;
  }, [initialData]);

  // Active tab handling
  const [activeNav, setActiveNav] = useState<string>("");
  useEffect(() => {
    const initializeActiveNav = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      setActiveNav(tab || "تعارف");
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
      <div dir="rtl" className="container mx-auto flex flex-col">
        <div className="h-screen flex items-center justify-center">
          <div className="text-lg">لوڈ ہو رہا ہے...</div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="container mx-auto flex flex-col">
      <Intro data={data as any} currentTab={activeNav} />
      <div className="inner-navs w-full md:w-[80vw] flex flex-row gap-3 border-b-2 self-center pb-0 px-4 pt-4 text-xl">
        <div
          className={`nav-item ${activeNav === "تعارف" ? "active" : ""
            } min-w-[40px] text-center transition-all ease-in-out duration-500`}
        >
          <a
            href={`/Shaer/${nameParam}?tab=${encodeURIComponent("تعارف")}`}
            onClick={handleLinkClick("تعارف")}
          >
            تعارف
          </a>
        </div>
        {data.ghazlen && (
          <div
            className={`nav-item ${activeNav === "غزلیں" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/Shaer/${nameParam}?tab=${encodeURIComponent(
                "غزلیں"
              )}`}
              onClick={handleLinkClick("غزلیں")}
            >
              غزلیں
            </a>
          </div>
        )}
        {data.nazmen && (
          <div
            className={`nav-item ${activeNav === "نظمیں" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/Shaer/${nameParam}?tab=${encodeURIComponent(
                "نظمیں"
              )}`}
              onClick={handleLinkClick("نظمیں")}
            >
              نظمیں
            </a>
          </div>
        )}
        {data.ashaar && (
          <div
            className={`nav-item ${activeNav === "اشعار" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/Shaer/${nameParam}?tab=${encodeURIComponent(
                "اشعار"
              )}`}
              onClick={handleLinkClick("اشعار")}
            >
              اشعار
            </a>
          </div>
        )}
        {data.eBooks && (
          <div
            className={`nav-item ${activeNav === "ئی - بکس" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/Shaer/${nameParam}?tab=${encodeURIComponent(
                "ئی - بکس"
              )}`}
              onClick={handleLinkClick("ئی - بکس")}
            >
              ای-بکس
            </a>
          </div>
        )}
        {data.rubai && (
          <div
            className={`nav-item ${activeNav === "رباعی" ? "active" : ""
              } min-w-[40px] text-center transition-all ease-in-out duration-500`}
          >
            <a
              href={`/Shaer/${nameParam}?tab=${encodeURIComponent(
                "رباعی"
              )}`}
              onClick={handleLinkClick("رباعی")}
            >
              رباعی
            </a>
          </div>
        )}
      </div>
      {activeNav === "تعارف" && <Intro2 data={data as any} />}
      {activeNav === "غزلیں" && (
        <Ghazlen takhallus={data.takhallus as string} />
      )}
      {activeNav === "نظمیں" && (
        <Nazmen takhallus={data.takhallus as string} />
      )}
      {activeNav === "اشعار" && (
        <Ashaar takhallus={data.takhallus as string} />
      )}
      {activeNav === "ئی - بکس" && (
        <EBkooks takhallus={data.takhallus as string} />
      )}
      {activeNav === "رباعی" && (
        <Rubai takhallus={data.takhallus as string} />
      )}
    </div>
  );
};

export default ShaerComponent;
