"use client";
import { House, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Card from "../Components/shaer/Profilecard";
import SkeletonLoader from "../Components/SkeletonLoader";
// aos for cards animation
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
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
interface Pagination {
  offset: string | null;
  pageSize: number;
}
const Page: React.FC<{}> = () => {
  const [data, setData] = useState<FormattedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [searchText, setSearchText] = useState("");
  const [moreloading, setMoreLoading] = useState(false);
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
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const safe = escapeAirtableFormulaValue(q);
    // Priority order: takhallus first, then names, then other fields
    return `OR( FIND('${safe}', LOWER({takhallus})), FIND('${safe}', LOWER({enTakhallus})), FIND('${safe}', LOWER({hiTakhallus})), FIND('${safe}', LOWER({name})), FIND('${safe}', LOWER({enName})), FIND('${safe}', LOWER({hiName})), FIND('${safe}', LOWER({dob})), FIND('${safe}', LOWER({location})), FIND('${safe}', LOWER({enLocation})), FIND('${safe}', LOWER({hiLocation})), FIND('${safe}', LOWER({tafseel})), FIND('${safe}', LOWER({searchKeys})) )`;
  }, [searchText]);

  const {
    data: records,
    isLoading,
    hasMore,
    loadMore,
    mutate,
  } = useAirtableList("shaer", {
    pageSize: 30,
    filterByFormula: filterFormula,
  });

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    // format records to expected local shape and sort by search relevance
    const formatted: FormattedRecord[] = (records || []).map((record: any) => ({
      ...record.data.records,
      fields: {
        ...record.fields,
        tafseel: String(record.fields?.tafseel || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        searchKeys: String(record.fields?.searchKeys || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        enTakhallus: String(record.fields?.enTakhallus || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        hiTakhallus: String(record.fields?.hiTakhallus || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        enName: String(record.fields?.enName || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        hiName: String(record.fields?.hiName || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        enLocation: String(record.fields?.enLocation || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        hiLocation: String(record.fields?.hiLocation || "")
          .replace(/\r\n?/g, "\n")
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
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      sortedData = formatted.sort((a, b) => {
        const aTakhallus = (a.fields.takhallus || "").toLowerCase();
        const aEnTakhallus = (
          a.fields.enTakhallus?.join(" ") || ""
        ).toLowerCase();
        const aHiTakhallus = (
          a.fields.hiTakhallus?.join(" ") || ""
        ).toLowerCase();
        const aEnName = (a.fields.enName?.join(" ") || "").toLowerCase();
        const aHiName = (a.fields.hiName?.join(" ") || "").toLowerCase();
        const aOther = `${a.fields.dob || ""} ${a.fields.location || ""} ${
          a.fields.tafseel?.join(" ") || ""
        }`.toLowerCase();

        const bTakhallus = (b.fields.takhallus || "").toLowerCase();
        const bEnTakhallus = (
          b.fields.enTakhallus?.join(" ") || ""
        ).toLowerCase();
        const bHiTakhallus = (
          b.fields.hiTakhallus?.join(" ") || ""
        ).toLowerCase();
        const bEnName = (b.fields.enName?.join(" ") || "").toLowerCase();
        const bHiName = (b.fields.hiName?.join(" ") || "").toLowerCase();
        const bOther = `${b.fields.dob || ""} ${b.fields.location || ""} ${
          b.fields.tafseel?.join(" ") || ""
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
    setMoreLoading(false);
  }, [records, isLoading, hasMore, searchText]);

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
    // setDataItems(data.getAllShaers()); // Restore the original data
  };
  const resetSearch = () => {
    searchText && clearSearch();
    setData(initialDataItems);
    if (typeof window !== "undefined") {
      let section = document.getElementById("section");
      section!.scrollTo({
        top: Number(scrolledPosition) || 0,
        behavior: "smooth",
      } as ScrollToOptions);
    }
    setInitialdDataItems([]);
  };
  const handleLoadMore = async () => {
    try {
      setMoreLoading(true);
      await loadMore();
    } finally {
      setMoreLoading(false);
    }
  };

  return (
    <>
      {loading && <SkeletonLoader />}
      {initialDataItems.length > 0 && data.length == 0 && (
        <div className="block mx-auto text-center my-3 text-2xl">
          سرچ میں کچھ نہیں ملا
        </div>
      )}
      {initialDataItems.length > 0 && (
        <button
          className="bg-white text-[#984A02] hover:px-7 transition-all duration-200 ease-in-out border block mx-auto my-4 active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
          onClick={resetSearch}
          // disabled={!searchText}
        >
          تلاش ریسیٹ کریں
        </button>
      )}
      {!loading && (
        <>
          <div className="flex flex-col gap-4">
            <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[90px] lg:top-[56px] border-foreground">
              <div className="filter-btn basis-[75%] text-center flex">
                <div
                  dir="rtl"
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
                    placeholder="لکھ کر تلاش کریں"
                    className="text-foreground border border-foreground focus:outline-none focus:border-l-0 border-l-0 p-1 w-64 leading-7 bg-transparent"
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
                  <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border-t border-b border-l border-foreground">
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
              dir="rtl"
              className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-1 sticky top-[110px] lg:top-[71px] m-3`}
            >
              {data.map((item) => {
                const array = Object.values(item);
                console.log(array);
                return array.map((value, index) => (
                  <div className="relative" key={index} data-aos="fade-up">
                    <Card data={value} />
                  </div>
                ));
              })}
            </div>
          </div>
          {data.length > 0 && (
            <div className="flex justify-center text-lg m-5">
              <button
                onClick={handleLoadMore}
                disabled={noMoreData || moreloading}
                className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
              >
                {moreloading
                  ? "لوڈ ہو رہا ہے۔۔۔"
                  : noMoreData
                  ? "مزید شعراء کی تفصیلات موجود نہیں ہیں"
                  : "مزید شعراء کی تفصیات لوڈ کریں"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Page;
