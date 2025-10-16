"use client";
import { House, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Card from "../Components/BookCard";
import SkeletonLoader from "../Components/SkeletonLoader";
// aos for cards animation
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import AOS from "aos";
import "aos/dist/aos.css";

interface Book {
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

interface EBooksType {
  fields: {
    bookName: string;
    enBookName: string;
    hiBookName: string;
    publishingDate: string;
    writer: string;
    enWriter: string;
    hiWriter: string;
    desc: string;
    enDesc: string;
    hiDesc: string;
    book: Book[];
    likes: number;
  };
  id: string;
  createdTime: string;
}
interface Pagination {
  offset: string | null;
  pageSize: number;
}
const Page: React.FC<{}> = () => {
  const [data, setData] = useState<EBooksType[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [searchText, setSearchText] = useState("");
  const [moreloading, setMoreLoading] = useState(true);
  const [initialDataItems, setInitialdDataItems] = useState<EBooksType[]>([]);
  const [noMoreData, setNoMoreData] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    offset: null,
    pageSize: 30,
  });
  const [voffset, setOffset] = useState<string | null>("");
  const [dataOffset, setDataOffset] = useState<string | null>(null);
  // toast via sonner

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);
  // Build filter formula - prioritize writer (author name) and book names
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    // Escape single quotes to prevent formula injection
    const escaped = q.replace(/'/g, "\\'");
    // Priority order: writer names first, then book names, then descriptions and dates
    return `OR( FIND('${escaped}', LOWER({writer})), FIND('${escaped}', LOWER({enWriter})), FIND('${escaped}', LOWER({hiWriter})), FIND('${escaped}', LOWER({bookName})), FIND('${escaped}', LOWER({enBookName})), FIND('${escaped}', LOWER({hiBookName})), FIND('${escaped}', LOWER({desc})), FIND('${escaped}', LOWER({enDesc})), FIND('${escaped}', LOWER({hiDesc})), FIND('${escaped}', LOWER({publishingDate})) )`;
  }, [searchText]);
  const { records, isLoading, hasMore, loadMore } = useAirtableList<EBooksType>(
    "ebooks",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateBooks } = useAirtableMutation("ebooks");

  const formattedRecords: EBooksType[] = useMemo(() => {
    const formatted = (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        bookName: record.fields?.bookName,
        writer: record.fields?.writer,
        publishingData: record.fields?.publishingData,
        tafseel: record.fields?.desc,
        book: record.fields?.book,
        likes: record.fields?.likes,
      },
    }));

    // Sort by search relevance when there's a search query
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      return formatted.sort((a, b) => {
        const aWriter = (a.fields.writer || "").toLowerCase();
        const aEnWriter = (a.fields.enWriter || "").toLowerCase();
        const aHiWriter = (a.fields.hiWriter || "").toLowerCase();
        const aBookName = (a.fields.bookName || "").toLowerCase();
        const aEnBookName = (a.fields.enBookName || "").toLowerCase();
        const aHiBookName = (a.fields.hiBookName || "").toLowerCase();
        const aOther = `${a.fields.desc || ""} ${a.fields.enDesc || ""} ${
          a.fields.hiDesc || ""
        } ${a.fields.publishingDate || ""}`.toLowerCase();

        const bWriter = (b.fields.writer || "").toLowerCase();
        const bEnWriter = (b.fields.enWriter || "").toLowerCase();
        const bHiWriter = (b.fields.hiWriter || "").toLowerCase();
        const bBookName = (b.fields.bookName || "").toLowerCase();
        const bEnBookName = (b.fields.enBookName || "").toLowerCase();
        const bHiBookName = (b.fields.hiBookName || "").toLowerCase();
        const bOther = `${b.fields.desc || ""} ${b.fields.enDesc || ""} ${
          b.fields.hiDesc || ""
        } ${b.fields.publishingDate || ""}`.toLowerCase();

        // Priority scoring: writer=5, writer translations=4, book names=3, book name translations=2, other=1
        const getScore = (
          writer: string,
          enWriter: string,
          hiWriter: string,
          bookName: string,
          enBookName: string,
          hiBookName: string,
          other: string
        ) => {
          if (writer.includes(query)) return 5;
          if (enWriter.includes(query) || hiWriter.includes(query)) return 4;
          if (bookName.includes(query)) return 3;
          if (enBookName.includes(query) || hiBookName.includes(query))
            return 2;
          if (other.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(
          aWriter,
          aEnWriter,
          aHiWriter,
          aBookName,
          aEnBookName,
          aHiBookName,
          aOther
        );
        const scoreB = getScore(
          bWriter,
          bEnWriter,
          bHiWriter,
          bBookName,
          bEnBookName,
          bHiBookName,
          bOther
        );

        // Higher score first, then alphabetical by writer name
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aWriter.localeCompare(bWriter);
      });
    }

    return formatted;
  }, [records, searchText]);

  useEffect(() => {
    setData(formattedRecords);
    setLoading(isLoading);
    setMoreLoading(false);
    setNoMoreData(!hasMore);
  }, [formattedRecords, isLoading, hasMore]);
  // likes handled inside BookCard

  const searchQuery = () => {
    if (typeof window !== "undefined") {
      setScrolledPosition(document!.getElementById("section")!.scrollTop);
    }
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
      const section = document.getElementById("section");
      section?.scrollTo({
        top: scrolledPosition ?? 0,
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
        <div>
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
            className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2 sticky m-3 md:mt-4`}
          >
            {data.map((item, index) => (
              <div className="relative" key={index} data-aos="fade-up">
                <Card
                  data={item}
                  showLikeButton
                  baseId="appXcBoNMGdIaSUyA"
                  table="E-Books"
                  storageKey="Books"
                  onLikeChange={({ id, liked, likes }) => {
                    // placeholder for analytics
                    // console.info("Book like changed", { id, liked, likes });
                  }}
                />
              </div>
            ))}
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
                  ? "مزید کتابیں موجود نہیں ہیں"
                  : "مزید کتابیں لوڈ کریں"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Page;
