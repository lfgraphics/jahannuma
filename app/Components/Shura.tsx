"use client";
import React, { useEffect, useMemo, useState } from "react";
import Card from "./shaer/Profilecard";
import SkeletonLoader from "./SkeletonLoader";
import { useAirtableList } from "@/hooks/useAirtableList";
import { escapeAirtableFormulaValue } from "@/lib/utils";
import { TTL } from "@/lib/airtable-fetcher";
import { House, Search, X } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

type Photo = {
  thumbnails?: { full?: { url?: string; height?: number; width?: number } };
};

type IntroRecord = {
  fields: {
    takhallus: string;
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
    ghazal?: boolean;
    eBooks?: boolean;
    nazmen?: boolean;
    likes?: number;
    photo?: Photo[];
    id?: string;
    slugId?: string;
  };
  id: string;
  createdTime: string;
};

export default function Shura() {
  const [searchText, setSearchText] = useState("");
  const [initialDataItems, setInitialDataItems] = useState<IntroRecord[]>([]);
  const [moreLoading, setMoreLoading] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);

  useEffect(() => {
    AOS.init({ offset: 20, delay: 0, duration: 300 });
  }, []);

  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const safe = escapeAirtableFormulaValue(q);
    return `OR( FIND('${safe}', LOWER({takhallus})), FIND('${safe}', LOWER({name})), FIND('${safe}', LOWER({dob})), FIND('${safe}', LOWER({location})), FIND('${safe}', LOWER({tafseel})), FIND('${safe}', LOWER({searchKeys})), FIND('${safe}', LOWER({enTakhallus})), FIND('${safe}', LOWER({hiTakhallus})), FIND('${safe}', LOWER({enName})), FIND('${safe}', LOWER({hiName})), FIND('${safe}', LOWER({enLocation})), FIND('${safe}', LOWER({hiLocation})) )`;
  }, [searchText]);

  const { records, isLoading, hasMore, loadMore } = useAirtableList<IntroRecord>(
    "appgWv81tu4RT3uRB",
    "Intro",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 1200, ttl: TTL.list }
  );

  const data: IntroRecord[] = useMemo(() => {
    return (records || []).map((r: any) => ({
      ...r,
      fields: {
        ...r.fields,
        tafseel: String(r.fields?.tafseel || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        searchKeys: String(r.fields?.searchKeys || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        enTakhallus: String(r.fields?.enTakhallus || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        hiTakhallus: String(r.fields?.hiTakhallus || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        enName: String(r.fields?.enName || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        hiName: String(r.fields?.hiName || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        enLocation: String(r.fields?.enLocation || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        hiLocation: String(r.fields?.hiLocation || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        ghazal: Boolean(r.fields?.ghazal),
        eBooks: Boolean(r.fields?.eBooks),
        nazmen: Boolean(r.fields?.nazmen),
        likes: Number(r.fields?.likes || 0),
      },
    }));
  }, [records]);

  useEffect(() => {
    setNoMoreData(!hasMore);
  }, [hasMore]);

  const handleSearchKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.toLowerCase();
    let xMark = document.getElementById("shuraSearchClear");
    let sMark = document.getElementById("shuraSearchIcon");
    value === "" ? xMark?.classList.add("hidden") : xMark?.classList.remove("hidden");
    value === "" ? sMark?.classList.add("hidden") : sMark?.classList.remove("hidden");
    if (value && initialDataItems.length === 0 && data.length > 0) {
      setInitialDataItems(data);
    }
    setSearchText(value);
  };

  const clearSearch = () => {
    let input = document.getElementById("shuraSearchBox") as HTMLInputElement;
    let xMark = document.getElementById("shuraSearchClear");
    let sMark = document.getElementById("shuraSearchIcon");
    if (input) input.value = "";
    xMark?.classList.add("hidden");
    sMark?.classList.add("hidden");
    setSearchText("");
    setInitialDataItems([]);
  };

  const handleLoadMore = async () => {
    try { setMoreLoading(true); await loadMore(); } finally { setMoreLoading(false); }
  };

  return (
    <>
      {isLoading && <SkeletonLoader />}
      {initialDataItems.length > 0 && data.length === 0 && (
        <div className="block mx-auto text-center my-3 text-2xl">سرچ میں کچھ نہیں ملا</div>
      )}
      {initialDataItems.length > 0 && (
        <button className="bg-white text-[#984A02] hover:px-7 transition-all duration-200 ease-in-out border block mx-auto my-4 active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md" onClick={clearSearch}>
          تلاش ریسیٹ کریں
        </button>
      )}
      {!isLoading && (
        <>
          <div className="flex flex-col gap-4">
            <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[116px] md:top-[80px] border-foreground">
              <div className="filter-btn basis-[75%] text-center flex">
                <div dir="rtl" className="flex justify-center items-center basis-[100%] h-auto pt-1">
                  <House color="#984A02" className="ml-3 cursor-pointer" size={30} onClick={() => { if (typeof window !== 'undefined') window.location.href = "/"; }} />
                  <input
                    type="text"
                    placeholder="لکھ کر تلاش کریں"
                    className="text-foreground border border-foreground focus:outline-none focus:border-l-0 border-l-0 p-1 w-64 leading-7 bg-transparent"
                    id="shuraSearchBox"
                    onKeyUp={(e) => handleSearchKeyUp(e)}
                  />
                  <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border border-r-0 border-l-0 border-foreground">
                    <X color="#984A02" size={24} onClick={clearSearch} id="shuraSearchClear" className="hidden text-[#984A02] cursor-pointer" />
                  </div>
                  <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border-t border-b border-l border-foreground">
                    <Search color="#984A02" size={24} id="shuraSearchIcon" className="hidden text-[#984A02] text-xl cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
            <div id="section" dir="rtl" className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-1 sticky top-[128px] m-3`}>
              {data.map((item, index) => (
                <div className="relative" key={index} data-aos="fade-up">
                  <Card data={item} />
                </div>
              ))}
            </div>
          </div>
          {data.length > 0 && (
            <div className="flex justify-center text-lg m-5">
              <button onClick={handleLoadMore} disabled={noMoreData || moreLoading} className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer">
                {moreLoading ? "لوڈ ہو رہا ہے۔۔۔" : noMoreData ? "مزید شعراء کی تفصیلات موجود نہیں ہیں" : "مزید شعراء کی تفصیات لوڈ کریں"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

