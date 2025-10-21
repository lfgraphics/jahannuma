"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useCommentSystem } from "@/hooks/social/useCommentSystem";
import { useAshaarData } from "@/hooks/useAshaarData";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getEnhancedLanguageFieldValue } from "@/lib/language-field-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import { escapeAirtableFormulaValue } from "@/lib/utils";
import AOS from "aos";
import "aos/dist/aos.css";
import { House, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CommentSection from "../../Components/CommentSection";
import DataCard from "../../Components/DataCard";
import SkeletonLoader from "../../Components/SkeletonLoader";

interface Shaer {
  fields: {
    sher: string[];
    shaer: string;
    ghazalHead: string[];
    ghazal: string[];
    unwan: string[];
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}

interface AshaarProps {
  initialData?: any;
}

const AshaarComponent: React.FC<AshaarProps> = ({ initialData }) => {
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const [scrolledPosition, setScrolledPosition] = useState<number>();

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem({ contentType: "ashaar" });
  const { requireAuth } = useAuthGuard();
  const { language } = useLanguage();

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);

  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    if (msgtype === "success") return toast.success(message);
    if (msgtype === "error") return toast.error(message);
    return toast.warning(message);
  };

  // Build filter formula for language-aware search
  const filterFormula = useMemo(() => {
    const q = debouncedSearchText.trim().toLowerCase();
    if (!q) return undefined;
    const safe = escapeAirtableFormulaValue(q);

    // Search in both English and default fields with language awareness
    return `OR( 
      FIND('${safe}', LOWER({shaer})), 
      FIND('${safe}', LOWER({enShaer})), 
      FIND('${safe}', LOWER({sher})), 
      FIND('${safe}', LOWER({enSher})), 
      FIND('${safe}', LOWER({body})), 
      FIND('${safe}', LOWER({enBody})), 
      FIND('${safe}', LOWER({unwan})), 
      FIND('${safe}', LOWER({enUnwan})) 
    )`;
  }, [debouncedSearchText]);

  const { records, isLoading, isValidating, hasMore, loadMore, mutate, optimisticUpdate, isLoadingMore } = useAshaarData(
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300, initialData }
  );

  const isInitialLoading = isLoading && (!records || records.length === 0);

  const { updateRecord: updateAshaar } = useAirtableMutation("ashaar");

  // Format records with enhanced language-aware field selection
  const formattedRecords: Shaer[] = useMemo(() => {
    const formatted = (records || []).map((record: any) => {
      const fields = record.fields;

      // Use enhanced language field transformation for English with proper fallback
      const shaer = getEnhancedLanguageFieldValue(fields, 'shaer', 'EN', 'ashaar') || fields.shaer || '';
      const sher = getEnhancedLanguageFieldValue(fields, 'sher', 'EN', 'ashaar') || fields.sher || '';
      const body = getEnhancedLanguageFieldValue(fields, 'body', 'EN', 'ashaar') || fields.body || '';
      const unwan = getEnhancedLanguageFieldValue(fields, 'unwan', 'EN', 'ashaar') || fields.unwan || '';
      const description = getEnhancedLanguageFieldValue(fields, 'description', 'EN', 'ashaar') || fields.description || '';
      const takhallus = getEnhancedLanguageFieldValue(fields, 'takhallus', 'EN', 'ashaar') || fields.takhallus || '';

      return {
        ...record,
        fields: {
          ...fields,
          shaer,
          sher,
          body,
          description,
          takhallus,
          unwan: String(unwan).replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
          ghazal: String(body).replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
          ghazalHead: String(sher).replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        },
      };
    });

    // Sort by search relevance when there's a search query
    if (debouncedSearchText.trim()) {
      const query = debouncedSearchText.trim().toLowerCase();
      return formatted.sort((a, b) => {
        const aShaer = (a.fields.shaer || '').toLowerCase();
        const aSher = (Array.isArray(a.fields.sher) ? a.fields.sher.join(' ') : String(a.fields.sher || '')).toLowerCase();
        const aBody = (a.fields.body || '').toLowerCase();
        const aUnwan = (Array.isArray(a.fields.unwan) ? a.fields.unwan.join(' ') : String(a.fields.unwan || '')).toLowerCase();

        const bShaer = (b.fields.shaer || '').toLowerCase();
        const bSher = (Array.isArray(b.fields.sher) ? b.fields.sher.join(' ') : String(b.fields.sher || '')).toLowerCase();
        const bBody = (b.fields.body || '').toLowerCase();
        const bUnwan = (Array.isArray(b.fields.unwan) ? b.fields.unwan.join(' ') : String(b.fields.unwan || '')).toLowerCase();

        const getScore = (shaer: string, sher: string, body: string, unwan: string) => {
          if (shaer.includes(query)) return 4;
          if (sher.includes(query)) return 3;
          if (body.includes(query)) return 2;
          if (unwan.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(aShaer, aSher, aBody, aUnwan);
        const scoreB = getScore(bShaer, bSher, bBody, bUnwan);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aShaer.localeCompare(bShaer);
      });
    }

    return formatted;
  }, [records, debouncedSearchText]);

  const dataItems = formattedRecords;
  const loading = isInitialLoading;
  const noMoreData = !hasMore;

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error("Error loading more data:", error);
    }
  };

  const searchQuery = () => {
    if (typeof window !== "undefined") {
      setScrolledPosition(window.scrollY);
    }
  };

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

  const clearSearch = () => {
    let input = document.getElementById("searchBox") as HTMLInputElement;
    let xMark = document.getElementById("searchClear");
    let sMark = document.getElementById("searchIcon");

    input.value ? (input.value = "") : null;
    xMark?.classList.add("hidden");
    sMark?.classList.add("hidden");
    setSearchText("");
  };

  const handleShareClick = async (shaerData: Shaer, index: number): Promise<void> => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ashaar",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: shaerData.fields.ghazalHead ?? [],
        fallbackSlugText: (shaerData.fields.ghazalHead || [])[0] || (shaerData.fields.unwan || [])[0] || "",
        language,
      },
      {
        onShared: async () => {
          try {
            const updatedShares = (shaerData.fields.shares ?? 0) + 1;
            optimisticUpdate.updateRecord(shaerData.id, { shares: updatedShares });

            try {
              await updateAshaar(shaerData.id, { shares: updatedShares });
            } catch (error) {
              console.error("Error updating shares:", error);
              optimisticUpdate.revert();
            }
          } catch (error) {
            console.error("Error updating shares:", error);
          }
        },
      }
    );
  };

  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
  };

  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };

  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      setRecordId(dataId);
      await submitComment(newComment);
      const current = dataItems.find((i) => i.id === dataId);
      const nextCount = ((current?.fields.comments) || 0) + 1;

      optimisticUpdate.updateRecord(dataId, { comments: nextCount });
      setNewComment("");

      try {
        await updateAshaar(dataId, { comments: nextCount });
      } catch (err) {
        console.error("Error updating comment count:", err);
        optimisticUpdate.updateRecord(dataId, { comments: Math.max(0, nextCount - 1) });
      }
    } catch (e) {
      // errors are toasted inside hook
    }
  };

  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    setRecordId(dataId);
  };

  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };

  const resetSearch = () => {
    searchText && clearSearch();
    if (typeof window !== "undefined") {
      let section = window;
      section!.scrollTo({
        top: scrolledPosition ?? 0,
        behavior: "smooth",
      } as ScrollToOptions);
    }
  };

  return (
    <div>
      <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[90px] lg:top-[56px] border-foreground">
        <div className="filter-btn basis-[75%] justify-center text-center flex">
          <div className="flex basis-[100%] justify-center items-center h-auto pt-1">
            <House
              color="#984A02"
              className="mr-3"
              size={30}
              onClick={() => {
                window.location.href = "/EN";
              }}
            />
            <input
              type="text"
              placeholder="Search poetry..."
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
      {loading && <SkeletonLoader />}
      {debouncedSearchText && dataItems.length === 0 && !loading && (
        <div className="block mx-auto text-center my-3 text-2xl">
          No results found
        </div>
      )}
      {debouncedSearchText && (
        <button
          className="bg-white text-[#984A02] hover:px-7 transition-all duration-200 ease-in-out border block mx-auto my-4 active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
          onClick={resetSearch}
        >
          Reset Search
        </button>
      )}
      {!loading && (
        <section>
          <div
            id="section"
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sticky mt-6`}
          >
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={index + "main"}>
                <DataCard
                  page="ashaar"
                  download={true}
                  key={index}
                  shaerData={shaerData}
                  index={index}
                  handleCardClick={handleCardClick}
                  baseId={require("@/lib/airtable-client-utils").getClientBaseId("ASHAAR")}
                  table="Ashaar"
                  storageKey="Ashaar"
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
                  onLikeChange={({ id, liked, likes }) => {
                    // Analytics integration can be added here in the future
                  }}
                />
              </div>
            ))}
            {dataItems.length > 0 && (
              <div className="flex justify-center text-lg m-5">
                <button
                  onClick={handleLoadMore}
                  disabled={noMoreData || isLoadingMore}
                  className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
                >
                  {isLoadingMore
                    ? "Loading..."
                    : noMoreData
                      ? "No more poetry"
                      : "Load More Poetry"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      {selectedCommentId && (
        <CommentSection
          dataId={selectedCommentId}
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
          commentLoading={commentLoading}
          newComment={newComment}
          onNewCommentChange={handleNewCommentChange}
          onCloseComments={closeComments}
        />
      )}
    </div>
  );
};

export default AshaarComponent;