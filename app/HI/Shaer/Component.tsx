"use client";
import { House, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import SkeletonLoader from "../Components/SkeletonLoader";
import Card from "../Components/shaer/Profilecard";
// aos for cards animation
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { escapeAirtableFormulaValue } from "@/lib/utils";
import AOS from "aos";
import "aos/dist/aos.css";

interface Photo {
  filename: string;
  height: number;
  id: string;
  size: number;
  thumbnails: {
    full: {
      height: number;
      url: string;
      width: number;
    };
    large: {
      height: number;
      url: string;
      width: number;
    };
    small: {
      height: number;
      url: string;
      width: number;
    };
  };
  type: string;
  url: string;
  width: number;
}

interface FormattedRecord {
  fields: {
    takhallus: string;
    dob: string;
    location: string;
    tafseel: string[];
    searchKeys: string[];
    enTakhallus: string[];
    hiTakhallus: string[];
    enName: string[];
    hiName: string[];
    enLocation: string[];
    hiLocation: string[];
    ghazal: boolean;
    eBooks: boolean;
    nazmen: boolean;
    likes: number;
    photo: Photo[];
  };
  id: string;
  createdTime: string;
}

const Page: React.FC<{}> = () => {
  const [data, setData] = useState<FormattedRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, 300);

  const [initialDataItems, setInitialdDataItems] = useState<FormattedRecord[]>(
    []
  );
  const [noMoreData, setNoMoreData] = useState(false);
  // notifications handled by global Sonner Toaster

  useEffect(() => {
    AOS.init({
      offset: 20,
      delay: 0,
      duration: 300,
    });
  }, []);

  // Build search filter formula safely - prioritize takhallus and poet names
  const filterFormula = useMemo(() => {
    const q = debouncedSearchText.trim().toLowerCase();
    if (!q) return undefined;
    const safe = escapeAirtableFormulaValue(q);
    // Priority order: takhallus first, then names, then other fields
    return `OR( FIND('${safe}', LOWER({takhallus})), FIND('${safe}', LOWER({enTakhallus})), FIND('${safe}', LOWER({hiTakhallus})), FIND('${safe}', LOWER({name})), FIND('${safe}', LOWER({enName})), FIND('${safe}', LOWER({hiName})), FIND('${safe}', LOWER({dob})), FIND('${safe}', LOWER({location})), FIND('${safe}', LOWER({enLocation})), FIND('${safe}', LOWER({hiLocation})), FIND('${safe}', LOWER({tafseel})), FIND('${safe}', LOWER({searchKeys})) )`;
  }, [debouncedSearchText]);

  const {
    records,
    isLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useAirtableList("shaer", {
    pageSize: 30,
    filterByFormula: filterFormula,
  });



  useEffect(() => {
    // format records to expected local shape and sort by search relevance
    const formatted: FormattedRecord[] = (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        tafseel: String(record.fields?.hiTafseel || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        searchKeys: String(record.fields?.searchKeys || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        enTakhallus: String(record.fields?.enTakhallus || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        hiTakhallus: String(record.fields?.hiTakhallus || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        enName: String(record.fields?.enName || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        hiName: String(record.fields?.hiName || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        enLocation: String(record.fields?.enLocation || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        hiLocation: String(record.fields?.hiLocation || "")
          ?.replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        ghazal: Boolean(record.fields?.ghazal),
        eBooks: Boolean(record.fields?.eBooks),
        nazmen: Boolean(record.fields?.nazmen),
        likes: Number(record.fields?.likes || 0),
      },
    }));

    // Sort by search relevance when there's a search query
    let sortedData = formatted;
    if (debouncedSearchText.trim()) {
      const query = debouncedSearchText.trim().toLowerCase();
      sortedData = formatted.sort((a, b) => {
        const aTakhallus = (a.fields.takhallus || "").toLowerCase();
        const aEnTakhallus = (
          Array.isArray(a.fields.enTakhallus) ? a.fields.enTakhallus.join(" ") : String(a.fields.enTakhallus || "")
        ).toLowerCase();
        const aHiTakhallus = (
          Array.isArray(a.fields.hiTakhallus) ? a.fields.hiTakhallus.join(" ") : String(a.fields.hiTakhallus || "")
        ).toLowerCase();
        const aEnName = (Array.isArray(a.fields.enName) ? a.fields.enName.join(" ") : String(a.fields.enName || "")).toLowerCase();
        const aHiName = (Array.isArray(a.fields.hiName) ? a.fields.hiName.join(" ") : String(a.fields.hiName || "")).toLowerCase();
        const aOther = `${a.fields.dob || ""} ${a.fields.location || ""} ${Array.isArray(a.fields.tafseel) ? a.fields.tafseel.join(" ") : String(a.fields.tafseel || "")
          }`.toLowerCase();

        const bTakhallus = (b.fields.takhallus || "").toLowerCase();
        const bEnTakhallus = (
          Array.isArray(b.fields.enTakhallus) ? b.fields.enTakhallus.join(" ") : String(b.fields.enTakhallus || "")
        ).toLowerCase();
        const bHiTakhallus = (
          Array.isArray(b.fields.hiTakhallus) ? b.fields.hiTakhallus.join(" ") : String(b.fields.hiTakhallus || "")
        ).toLowerCase();
        const bEnName = (Array.isArray(b.fields.enName) ? b.fields.enName.join(" ") : String(b.fields.enName || "")).toLowerCase();
        const bHiName = (Array.isArray(b.fields.hiName) ? b.fields.hiName.join(" ") : String(b.fields.hiName || "")).toLowerCase();
        const bOther = `${b.fields.dob || ""} ${b.fields.location || ""} ${Array.isArray(b.fields.tafseel) ? b.fields.tafseel.join(" ") : String(b.fields.tafseel || "")
          }`.toLowerCase();

        // Priority scoring: takhallus=5, takhallus translations=4, name translations=3, other=1
        const getScore = (
          takhallus: string,
          enTakhallus: string,
          hiTakhallus: string,
          enName: string,
          hiName: string,
          other: string
        ) => {
          if (takhallus.includes(query)) return 5;
          if (enTakhallus.includes(query) || hiTakhallus.includes(query))
            return 4;
          if (enName.includes(query) || hiName.includes(query)) return 3;
          if (other.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(
          aTakhallus,
          aEnTakhallus,
          aHiTakhallus,
          aEnName,
          aHiName,
          aOther
        );
        const scoreB = getScore(
          bTakhallus,
          bEnTakhallus,
          bHiTakhallus,
          bEnName,
          bHiName,
          bOther
        );

        // Higher score first, then alphabetical by takhallus
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aTakhallus.localeCompare(bTakhallus);
      });
    }

    setData(sortedData);
    setLoading(isLoading);
    setNoMoreData(!hasMore);
  }, [records, isLoading, hasMore, debouncedSearchText]);

  // Removed legacy localStorage-based highlighting; likes are handled in Profilecard via Clerk

  const searchQuery = () => {
    // with debounced hook, updating searchText triggers re-fetch; nothing else needed
  };
  //search keyup handeling
  const handleSearchKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.toLowerCase();
    let xMark = document.getElementById("searchClear");
    let sMark = document.getElementById("searchIcon");
    value === ""
      ? xMark?.classList.add("hidden")
      : xMark?.classList.remove("hidden");
    value === ""
      ? sMark?.classList.add("hidden")
      : sMark?.classList.remove("hidden");
    // Cache initial list before applying first search, for reset
    if (value && initialDataItems.length === 0 && data.length > 0) {
      setInitialdDataItems(data);
    }
    setSearchText(value);
  };
  //clear search box handeling
  const clearSearch = () => {
    let input = document.getElementById("searchBox") as HTMLInputElement;
    let xMark = document.getElementById("searchClear");
    let sMark = document.getElementById("searchIcon");

    input.value ? (input.value = "") : null;
    xMark?.classList.add("hidden");
    sMark?.classList.add("hidden");
    // Clear the searched data and show all data again
    setSearchText(""); // Clear the searchText state
  };
  const resetSearch = () => {
    searchText && clearSearch();
    setData(initialDataItems);
    if (typeof window !== "undefined") {
      let section = document.getElementById("section");
      section!.scrollTo({
        top: 0,
        behavior: "smooth",
      } as ScrollToOptions);
    }
    setInitialdDataItems([]);
  };
  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error("Error loading more data:", error);
    }
  };

  return (
    <>
      {loading && <SkeletonLoader />}
      {initialDataItems.length > 0 && data.length == 0 && (
        <div className="block mx-auto text-center my-3 text-2xl">
          Nothing found in search
        </div>
      )}
      {initialDataItems.length > 0 && (
        <button
          className="bg-white text-[#984A02] hover:px-7 transition-all duration-200 ease-in-out border block mx-auto my-4 active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
          onClick={resetSearch}
          // disabled={!searchText}
        >
          Reset Search
        </button>
      )}
      {!loading && (
        <>
          <div className="flex flex-col gap-4">
            <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[90px] lg:top-[56px] border-foreground">
              <div className="filter-btn basis-[75%] text-center flex">
                <div
                  className="flex justify-center items-center basis-[100%] h-auto pt-1"
                >
                  <House
                    color="#984A02"
                    className="ml-3 cursor-pointer"
                    size={30}
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  />
                  <input
                    type="text"
                    placeholder="लिख कर खोजें.... "
                    className="text-foreground border border-foreground focus:outline-none focus:border-r-0 border-r-0 p-1 w-64 leading-7 bg-transparent"
                    id="searchBox"
                    onKeyUp={(e) => {
                      handleSearchKeyUp(e);
                      if (e.key === "Enter") {
                        if (document.activeElement === e.target) {
                          e.preventDefault();
                          searchQuery();
                        }
                      }
                    }}
                  />
                  <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border border-r-0 border-l-0 border-foreground">
                    <X
                      color="#984A02"
                      size={24}
                      onClick={clearSearch}
                      id="searchClear"
                      className="hidden text-[#984A02] cursor-pointer"
                    />
                  </div>
                  <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border-t border-b border-r border-foreground">
                    <Search
                      color="#984A02"
                      size={24}
                      onClick={searchQuery}
                      id="searchIcon"
                      className="hidden text-[#984A02] text-xl cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              id="section"
              className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-1 sticky top-[110px] lg:top-[71px] m-3`}
            >
              {data.map((item, index) => (
                <div className="relative" key={item.id || index} data-aos="fade-up">
                  <Card data={item} />
                </div>
              ))}
            </div>
          </div>
          {data.length > 0 && (
            <div className="flex justify-center text-lg m-5">
              <button
                onClick={handleLoadMore}
                disabled={noMoreData || isValidating}
                className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
              >
                {isValidating
                  ? "लोड हो रहा है..."
                  : noMoreData
                    ? "मजीद शोरा मौजूद नहीं हैं"
                    : "मजीद शूरा की तफ़सीलात लोड करें"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Page;
