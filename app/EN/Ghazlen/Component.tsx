"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useCommentSystem } from "@/hooks/social/useCommentSystem";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGhazlenData } from "@/hooks/useGhazlenData";
import { getEnhancedLanguageFieldValue } from "@/lib/language-field-utils";
import { uiTexts } from "@/lib/multilingual-texts";
import { shareRecordWithCount } from "@/lib/social-utils";
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
    // English fields
    enShaer?: string;
    enGhazalHead?: string[];
    enGhazal?: string[];
    enUnwan?: string[];
  };
  id: string;
  createdTime: string;
}

interface GhazlenProps {
  initialData?: any[];
  language: "EN";
}

const GhazlenComponent: React.FC<GhazlenProps> = ({ initialData = [], language }) => {
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const [showIcons, setShowIcons] = useState(false);
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [initialDataItems, setInitialdDataItems] = useState<Shaer[]>([]);
  const [openanaween, setOpenanaween] = useState<string | null>(null);

  // Comment system
  const [newComment, setNewComment] = useState("");
  const {
    comments,
    isLoading: commentLoading,
    submitComment,
    setRecordId,
  } = useCommentSystem({ contentType: "ghazlen" });
  const { requireAuth } = useAuthGuard();
  const { language: contextLanguage, setLanguage } = useLanguage();

  // Set language context to English
  useEffect(() => {
    if (contextLanguage !== "EN") {
      setLanguage("EN");
    }
  }, [contextLanguage, setLanguage]);

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

  //function to scroll to the top
  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  // Build filter formula via SWR hook - prioritize shaer (poet name) with English fields
  const filterFormula = useMemo(() => {
    const q = debouncedSearchText.trim().toLowerCase();
    if (!q) return undefined;
    // sanitize to avoid Airtable formula injection: escape backslashes and single quotes
    const safeQ = q.replace(/\\/g, "\\\\").replace(/'/g, "''");
    // Priority order: English fields first, then fallback to Urdu fields
    return `OR( FIND('${safeQ}', LOWER({enShaer})), FIND('${safeQ}', LOWER({shaer})), FIND('${safeQ}', LOWER({enGhazalHead})), FIND('${safeQ}', LOWER({ghazalHead})), FIND('${safeQ}', LOWER({enGhazal})), FIND('${safeQ}', LOWER({ghazal})), FIND('${safeQ}', LOWER({enUnwan})), FIND('${safeQ}', LOWER({unwan})) )`;
  }, [debouncedSearchText]);

  const { records, isLoading, hasMore, loadMore, isLoadingMore, optimisticUpdate } = useGhazlenData(
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300, initialData }
  );

  const { updateRecord: updateGhazlen } = useAirtableMutation("ghazlen");

  // Format records and sort by search relevance with enhanced language-aware field selection
  const formattedRecords: Shaer[] = useMemo(() => {
    const formatted = (records || []).map((record: any) => {
      // Use enhanced language-aware field selection for English with proper fallback
      const shaerName = getEnhancedLanguageFieldValue(record.fields, 'shaer', 'EN', 'ghazlen') || record.fields.shaer;
      const ghazalHead = getEnhancedLanguageFieldValue(record.fields, 'ghazalHead', 'EN', 'ghazlen') || record.fields.ghazalHead;
      const ghazal = getEnhancedLanguageFieldValue(record.fields, 'ghazal', 'EN', 'ghazlen') || record.fields.ghazal;
      const unwan = getEnhancedLanguageFieldValue(record.fields, 'unwan', 'EN', 'ghazlen') || record.fields.unwan;
      const description = getEnhancedLanguageFieldValue(record.fields, 'description', 'EN', 'ghazlen') || record.fields.enDescription;
      const takhallus = getEnhancedLanguageFieldValue(record.fields, 'takhallus', 'EN', 'ghazlen') || record.fields.enTakhallus;

      return {
        ...record,
        fields: {
          ...record.fields,
          shaer: shaerName,
          description,
          takhallus,
          ghazalHead: Array.isArray(ghazalHead) ? ghazalHead : [ghazalHead].filter(Boolean),
          ghazal: String(ghazal || "")
            .replace(/\r\n?/g, "\n")
            .split("\n")
            .filter(Boolean),
          unwan: Array.isArray(unwan) ? unwan : [unwan].filter(Boolean),
        },
      };
    });

    // Sort by search relevance when there's a search query
    if (debouncedSearchText.trim()) {
      const query = debouncedSearchText.trim().toLowerCase();
      return formatted.sort((a, b) => {
        const aShaer = (a.fields.shaer || "").toLowerCase();
        const aGhazalHead = (
          Array.isArray(a.fields.ghazalHead) ? a.fields.ghazalHead.join(" ") : String(a.fields.ghazalHead || "")
        ).toLowerCase();
        const aGhazal = (Array.isArray(a.fields.ghazal) ? a.fields.ghazal.join(" ") : String(a.fields.ghazal || "")).toLowerCase();
        const aUnwan = (Array.isArray(a.fields.unwan) ? a.fields.unwan.join(" ") : String(a.fields.unwan || "")).toLowerCase();

        const bShaer = (b.fields.shaer || "").toLowerCase();
        const bGhazalHead = (
          Array.isArray(b.fields.ghazalHead) ? b.fields.ghazalHead.join(" ") : String(b.fields.ghazalHead || "")
        ).toLowerCase();
        const bGhazal = (Array.isArray(b.fields.ghazal) ? b.fields.ghazal.join(" ") : String(b.fields.ghazal || "")).toLowerCase();
        const bUnwan = (Array.isArray(b.fields.unwan) ? b.fields.unwan.join(" ") : String(b.fields.unwan || "")).toLowerCase();

        // Priority scoring: shaer=4, ghazalHead=3, ghazal=2, unwan=1
        const getScore = (
          shaer: string,
          ghazalHead: string,
          ghazal: string,
          unwan: string
        ) => {
          if (shaer.includes(query)) return 4;
          if (ghazalHead.includes(query)) return 3;
          if (ghazal.includes(query)) return 2;
          if (unwan.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(aShaer, aGhazalHead, aGhazal, aUnwan);
        const scoreB = getScore(bShaer, bGhazalHead, bGhazal, bUnwan);

        // Higher score first, then alphabetical by shaer name
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aShaer.localeCompare(bShaer);
      });
    }

    return formatted;
  }, [records, debouncedSearchText]);

  // Use the hook values directly instead of copying to state
  const dataItems = formattedRecords;
  const loading = isLoading;
  const noMoreData = !hasMore;

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error("Error loading more data:", error);
    }
  };

  const searchQuery = () => {
    // filterFormula derives from searchText
    if (typeof window !== "undefined") setScrolledPosition(window.scrollY);
  };

  // search input change handling (state-driven visibility)
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.toLowerCase();
    setSearchText(value);
    setShowIcons(value.trim() !== "");
  };

  //clear search box handling
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

  //handling share
  const handleShareClick = async (
    shaerData: Shaer,
    index: number
  ): Promise<void> => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ghazlen",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: shaerData.fields.ghazalHead ?? [],
        fallbackSlugText:
          (shaerData.fields.ghazalHead || [])[0] ||
          (shaerData.fields.unwan || [])[0] ||
          "",
        language: "EN",
      },
      {
        onShared: async () => {
          try {
            const updatedShares = (shaerData.fields.shares ?? 0) + 1;

            // Optimistically update the UI first
            optimisticUpdate.updateRecord(shaerData.id, { shares: updatedShares });

            // Then persist to server
            try {
              await updateGhazlen(shaerData.id, { shares: updatedShares });
            } catch (error) {
              console.error("Error updating shares:", error);
              // Revert optimistic update on failure
              optimisticUpdate.revert();
            }
          } catch (error) {
            console.error("Error updating shares:", error);
          }
        },
      }
    );
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

  //opening and closing ghazal
  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
  };

  //toggling anaween box
  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  // showing the current made comment in comment box
  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };

  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      setRecordId(dataId); // Set the record ID first
      await submitComment(newComment);
      // Optimistically bump the comments count
      const current = dataItems.find((i) => i.id === dataId);
      const nextCount = ((current?.fields.comments) || 0) + 1;

      // Update UI optimistically
      optimisticUpdate.updateRecord(dataId, { comments: nextCount });
      setNewComment("");

      // Persist comments count; rollback the optimistic update if it fails
      try {
        await updateGhazlen(dataId, { comments: nextCount });
      } catch (err) {
        console.error("Error updating comment count:", err);
        // Revert the optimistic update
        optimisticUpdate.updateRecord(dataId, { comments: Math.max(0, nextCount - 1) });
      }
    } catch (e) {
      // errors are toasted inside hook
    }
  };

  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    setRecordId(dataId); // This will trigger comment fetching
  };

  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };

  // resetting search
  const resetSearch = () => {
    searchText && clearSearch();
    // Clear the search text which will trigger the hook to reload data
    setSearchText("");
    if (typeof window !== "undefined") {
      let section = window;
      section!.scrollTo({
        top: scrolledPosition ?? 0,
        behavior: "smooth",
      } as ScrollToOptions);
    }
    setInitialdDataItems([]);
  };

  return (
    <div>
      <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[90px] lg:top-[56px] border-foreground">
        <div className="filter-btn basis-[75%] text-center flex">
          <div className="flex justify-center items-center basis-[100%] h-auto pt-1">
            <House
              color="#984A02"
              className="mr-3 cursor-pointer"
              size={30}
              onClick={() => {
                window.location.href = "/EN";
              }}
            />
            <input
              type="text"
              placeholder={uiTexts.placeholders.search.EN}
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
      {loading && <SkeletonLoader />}
      {initialDataItems.length > 0 && dataItems.length == 0 && (
        <div className="block mx-auto text-center my-3 text-2xl">
          {uiTexts.messages.noData.EN}
        </div>
      )}
      {initialDataItems.length > 0 && (
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
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sticky m-3`}
          >
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={index + "aosdiv"}>
                <DataCard
                  page="ghazal"
                  download={false}
                  key={index}
                  shaerData={shaerData}
                  index={index}
                  handleCardClick={handleCardClick}
                  baseId={require("@/lib/airtable-client-utils").getClientBaseId("GHAZLEN")}
                  table="Ghazlen"
                  storageKey="Ghazlen"
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
                    ? uiTexts.messages.loading.EN
                    : noMoreData
                      ? "No more ghazals available"
                      : uiTexts.buttons.loadMore.EN + " Ghazals"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      {/* Comment section using shadcn Drawer */}
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

export default GhazlenComponent;