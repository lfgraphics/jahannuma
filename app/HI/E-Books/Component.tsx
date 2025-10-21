"use client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useEbooksData, type EBooksType } from "@/hooks/useEbooksData";
import { getLanguageFieldValue } from "@/lib/language-field-utils";
import AOS from "aos";
import "aos/dist/aos.css";
import { House, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Card from "../../Components/BookCard";
import SkeletonLoader from "../../Components/SkeletonLoader";

interface Pagination {
  offset: string | null;
  pageSize: number;
}

interface PageProps {
  initialData?: EBooksType[];
}

const Page: React.FC<PageProps> = ({ initialData = [] }) => {
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const [pagination, setPagination] = useState<Pagination>({
    offset: null,
    pageSize: 30,
  });
  const [voffset, setOffset] = useState<string | null>("");
  const [dataOffset, setDataOffset] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);

  // Build filter formula - prioritize Hindi fields first, then fallback
  const filterFormula = useMemo(() => {
    const q = debouncedSearchText.trim().toLowerCase();
    if (!q) return undefined;
    // Escape single quotes to prevent formula injection
    const escaped = q.replace(/'/g, "\\'");
    // Priority order: Hindi fields first, then other languages
    return `OR( FIND('${escaped}', LOWER({hiWriter})), FIND('${escaped}', LOWER({writer})), FIND('${escaped}', LOWER({enWriter})), FIND('${escaped}', LOWER({hiBookName})), FIND('${escaped}', LOWER({bookName})), FIND('${escaped}', LOWER({enBookName})), FIND('${escaped}', LOWER({hiDesc})), FIND('${escaped}', LOWER({desc})), FIND('${escaped}', LOWER({enDesc})), FIND('${escaped}', LOWER({publishingDate})) )`;
  }, [debouncedSearchText]);

  const { records, isLoading, isValidating, hasMore, loadMore, optimisticUpdate, trackDownload } = useEbooksData(
    { pageSize: 30, filterByFormula: filterFormula },
    {
      debounceMs: 300,
      initialData: initialData,
      enabled: true
    }
  );

  // Differentiate between initial loading and loading more data
  const isInitialLoading = isLoading && (!records || records.length === 0);
  const isLoadingMore = isValidating && !isLoading && records && records.length > 0;

  const { updateRecord: updateBooks } = useAirtableMutation("appXcBoNMGdIaSUyA", "E-Books");

  const formattedRecords: EBooksType[] = useMemo(() => {
    // Use initial data if client-side records are not yet available
    const dataToUse = records && records.length > 0 ? records : initialData;
    const formatted = (dataToUse || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        // Use Hindi fields with fallback for display
        bookName: getLanguageFieldValue(record.fields, 'bookName', 'HI', ['HI', 'UR', 'EN']) || record.fields?.bookName,
        writer: getLanguageFieldValue(record.fields, 'writer', 'HI', ['HI', 'UR', 'EN']) || record.fields?.writer,
        publishingData: record.fields?.publishingData,
        tafseel: getLanguageFieldValue(record.fields, 'desc', 'HI', ['HI', 'UR', 'EN']) || record.fields?.desc,
        book: record.fields?.book,
        likes: record.fields?.likes,
      },
    }));

    // Sort by search relevance when there's a search query
    if (debouncedSearchText.trim()) {
      const query = debouncedSearchText.trim().toLowerCase();
      return formatted.sort((a, b) => {
        // Get Hindi fields with fallback
        const aWriter = (getLanguageFieldValue(a.fields, 'writer', 'HI', ['HI', 'UR', 'EN']) || "").toLowerCase();
        const aBookName = (getLanguageFieldValue(a.fields, 'bookName', 'HI', ['HI', 'UR', 'EN']) || "").toLowerCase();
        const aDesc = (getLanguageFieldValue(a.fields, 'desc', 'HI', ['HI', 'UR', 'EN']) || "").toLowerCase();
        const aOther = `${a.fields.publishingDate || ""}`.toLowerCase();

        const bWriter = (getLanguageFieldValue(b.fields, 'writer', 'HI', ['HI', 'UR', 'EN']) || "").toLowerCase();
        const bBookName = (getLanguageFieldValue(b.fields, 'bookName', 'HI', ['HI', 'UR', 'EN']) || "").toLowerCase();
        const bDesc = (getLanguageFieldValue(b.fields, 'desc', 'HI', ['HI', 'UR', 'EN']) || "").toLowerCase();
        const bOther = `${b.fields.publishingDate || ""}`.toLowerCase();

        // Priority scoring: writer=4, book names=3, descriptions=2, other=1
        const getScore = (
          writer: string,
          bookName: string,
          desc: string,
          other: string
        ) => {
          if (writer.includes(query)) return 4;
          if (bookName.includes(query)) return 3;
          if (desc.includes(query)) return 2;
          if (other.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(aWriter, aBookName, aDesc, aOther);
        const scoreB = getScore(bWriter, bBookName, bDesc, bOther);

        // Higher score first, then alphabetical by writer name
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aWriter.localeCompare(bWriter);
      });
    }

    return formatted;
  }, [records, initialData, debouncedSearchText]);

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
  };

  const resetSearch = () => {
    searchText && clearSearch();
    // Data will automatically update through formattedRecords memoization
    if (typeof window !== "undefined") {
      const section = document.getElementById("section");
      section?.scrollTo({
        top: scrolledPosition ?? 0,
        behavior: "smooth",
      } as ScrollToOptions);
    }
    // State cleanup no longer needed
  };

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more:', error);
    }
  };

  return (
    <LanguageProvider>
      <div dir="ltr">
        {isInitialLoading && <SkeletonLoader />}
        {initialData.length > 0 && formattedRecords.length == 0 && (
          <div className="block mx-auto text-center my-3 text-2xl">
            खोज में कुछ नहीं मिला
          </div>
        )}
        {initialData.length > 0 && (
          <button
            className="bg-white text-[#984A02] hover:px-7 transition-all duration-200 ease-in-out border block mx-auto my-4 active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            onClick={resetSearch}
          >
            खोज रीसेट करें
          </button>
        )}
        <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[90px] lg:top-[56px] border-foreground">
          <div className="filter-btn basis-[75%] text-center flex">
            <div
              dir="ltr"
              className="flex justify-center items-center basis-[100%] h-auto pt-1"
            >
              <House
                color="#984A02"
                className="mr-3 cursor-pointer"
                size={30}
                onClick={() => {
                  window.location.href = "/HI";
                }}
              />
              <input
                type="text"
                placeholder="पुस्तकें और लेखक खोजें"
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
              <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border border-l-0 border-r-0 border-foreground">
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
        {!isLoading && (
          <div>
            <div
              id="section"
              dir="ltr"
              className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2 sticky m-3 md:mt-4`}
            >
              {formattedRecords.map((item, index) => (
                <div className="relative" key={index} data-aos="fade-up">
                  <Card
                    data={item}
                    showLikeButton
                    baseId="appXcBoNMGdIaSUyA"
                    table="E-Books"
                    storageKey="Books"
                    onLikeChange={({ id, liked, likes }) => {
                      // Update likes count optimistically
                      optimisticUpdate.updateLikes(id, likes);

                      // Analytics tracking
                      console.info("Book like changed", { id, liked, likes });
                    }}
                    onDownload={(bookId: string, bookUrl: string) => {
                      // Track download with error handling
                      trackDownload.trackBookDownload(bookId, bookUrl);
                    }}
                    onDownloadError={(bookId: string, error: Error) => {
                      // Handle download failures
                      trackDownload.handleDownloadError(bookId, error);
                    }}
                  />
                </div>
              ))}
            </div>
            {formattedRecords.length > 0 && (
              <div className="flex justify-center text-lg m-5">
                <button
                  onClick={handleLoadMore}
                  disabled={!hasMore || isLoadingMore}
                  className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
                >
                  {isLoadingMore
                    ? "लोड हो रहा है..."
                    : !hasMore
                      ? "और पुस्तकें उपलब्ध नहीं हैं"
                      : "और पुस्तकें लोड करें"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </LanguageProvider>
  );
};

export default Page;