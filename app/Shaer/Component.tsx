"use client";
import React, { useState, useEffect, useMemo } from "react";
import Card from "../Components/shaer/Profilecard";
import { Heart, House, Search, X } from "lucide-react";
import { toast } from "sonner";
import SkeletonLoader from "../Components/SkeletonLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { escapeAirtableFormulaValue } from "@/lib/utils";
import { TTL } from "@/lib/airtable-fetcher";

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

  // Build search filter formula safely
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const safe = escapeAirtableFormulaValue(q);
    return `OR( FIND('${safe}', LOWER({takhallus})), FIND('${safe}', LOWER({name})), FIND('${safe}', LOWER({dob})), FIND('${safe}', LOWER({location})), FIND('${safe}', LOWER({tafseel})), FIND('${safe}', LOWER({searchKeys})), FIND('${safe}', LOWER({enTakhallus})), FIND('${safe}', LOWER({hiTakhallus})), FIND('${safe}', LOWER({enName})), FIND('${safe}', LOWER({hiName})), FIND('${safe}', LOWER({enLocation})), FIND('${safe}', LOWER({hiLocation})) )`;
  }, [searchText]);

  const { records, isLoading, hasMore, loadMore, mutate } = useAirtableList<FormattedRecord>(
    "appgWv81tu4RT3uRB",
    "Intro",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 1200, ttl: TTL.list }
  );

  // const { updateRecord } = useAirtableMutation("appgWv81tu4RT3uRB", "Intro");

  function scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    // format records to expected local shape
    const formatted: FormattedRecord[] = (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        tafseel: String(record.fields?.tafseel || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        searchKeys: String(record.fields?.searchKeys || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        enTakhallus: String(record.fields?.enTakhallus || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        hiTakhallus: String(record.fields?.hiTakhallus || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        enName: String(record.fields?.enName || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        hiName: String(record.fields?.hiName || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        enLocation: String(record.fields?.enLocation || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        hiLocation: String(record.fields?.hiLocation || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        ghazal: Boolean(record.fields?.ghazal),
        eBooks: Boolean(record.fields?.eBooks),
        nazmen: Boolean(record.fields?.nazmen),
        likes: Number(record.fields?.likes || 0),
      },
    }));
    setData(formatted);
    setLoading(isLoading);
    setNoMoreData(!hasMore);
    setMoreLoading(false);
  }, [records, isLoading, hasMore]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedData = localStorage.getItem("Shura");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          data.forEach((shaerData, index) => {
            const shaerId = shaerData.id; // Get the id of the current shaerData

            // Check if the shaerId exists in the stored data
            const storedShaer = parsedData.find(
              (data: { id: string }) => data.id === shaerId
            );

            if (storedShaer) {
              // If shaerId exists in the stored data, update the card's appearance
              const cardElement = document.getElementById(shaerId);
              if (cardElement) {
                cardElement.classList.add("text-red-600");
              }
            }
          });
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      }
    }
  }, [data]);

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
    if (typeof window !== 'undefined') {
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
            <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[116px] md:top-[80px] border-foreground">
              <div className="filter-btn basis-[75%] text-center flex">
                <div dir="rtl" className="flex justify-center items-center basis-[100%] h-auto pt-1">
                  <House color="#984A02" className="ml-3 cursor-pointer" size={30} onClick={() => { window.location.href = "/"; }} />
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
                    <X color="#984A02" size={24} onClick={clearSearch} id="searchClear" className="hidden text-[#984A02] cursor-pointer" />
                  </div>
                  <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border-t border-b border-l border-foreground">
                    <Search color="#984A02" size={24} onClick={searchQuery} id="searchIcon" className="hidden text-[#984A02] text-xl cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
            <div id="section" dir="rtl" className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-1 sticky top-[128px] m-3`}>
              {data.map((item, index) => (
                <div className="relative" key={index} data-aos="fade-up">
                  {/* <div
                    className="heart scale-75 cursor-pointer text-gray-500 pr-3 absolute -top-[9px] -right-3 rounded-tr-sm w-[80px] max-w-[120px] h-10 flex items-center justify-center border rounded-t-none rounded-b-xl m-2 backdrop-blur-sm z-10"
                    onClick={(e) =>
                      handleHeartClick(e, item, index, `${item.id}`)
                    }
                    id={`${item.id}`}
                  >
                    <Heart className="text-xl ml-3" fill="#6b7280" />
                    <span className="text-foreground">{`${item.fields?.likes}`}</span>
                  </div> */}
                  <Card data={item} />
                </div>
              ))}
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
