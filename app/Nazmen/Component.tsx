"use client";
import React, { useEffect, useMemo, useState } from "react";
// FontAwesome removed; using Lucide icons instead
import { toast } from "sonner";
import CommentSection from "../Components/CommentSection";
import DataCard from "../Components/DataCard";
import SkeletonLoader from "../Components/SkeletonLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import { House, Search, X } from "lucide-react";
// Removed deprecated Dialog UI imports
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useNazmenData } from "@/hooks/useNazmenData";
import { escapeAirtableFormulaValue } from "@/lib/utils";
// createSlug no longer needed here; using centralized share helper
import { useLanguage } from "@/contexts/LanguageContext";
import { useCommentSystem } from "@/hooks/social/useCommentSystem";
import useAuthGuard from "@/hooks/useAuthGuard";
import { shareRecordWithCount } from "@/lib/social-utils";

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
interface ApiResponse {
  records: any[];
  offset: string | null;
}
interface Comment {
  dataId: string | null;
  commentorName: string | null;
  timestamp: string;
  comment: string;
}

interface NazmenProps {
  initialData?: any;
}

const Nazmen: React.FC<NazmenProps> = ({ initialData }) => {
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  const [selectedCard, setSelectedCard] = React.useState<{
    id: string;
    fields: { shaer: string; ghazal: string[]; id: string };
  } | null>(null);
  const [searchText, setSearchText] = useState("");
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  // Comment system
  const [newComment, setNewComment] = useState("");
  const {
    comments,
    isLoading: commentLoading,
    submitComment,
    setRecordId,
  } = useCommentSystem({ contentType: "nazmen" });
  const { requireAuth } = useAuthGuard();
  const { language } = useLanguage();

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);

  // List records with SWR and filter - prioritize shaer (poet name)
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const escapedQ = escapeAirtableFormulaValue(q);
    // Priority order: shaer (poet name), then displayLine, nazm, unwan
    return `OR( FIND('${escapedQ}', LOWER({shaer})), FIND('${escapedQ}', LOWER({displayLine})), FIND('${escapedQ}', LOWER({nazm})), FIND('${escapedQ}', LOWER({unwan})) )`;
  }, [searchText]);

  const { 
    records, 
    isLoading, 
    hasMore, 
    loadMore,
    optimisticUpdate 
  } = useNazmenData(
    { 
      pageSize: 30, 
      filterByFormula: filterFormula,
      search: searchText 
    },
    { 
      debounceMs: 300,
      initialData: initialData
    }
  );
  const { updateRecord: updateNazmen } = useAirtableMutation("nazmen");

  const formattedRecords: Shaer[] = useMemo(() => {
    const formatted = (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        ghazal: String(record.fields?.nazm || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        ghazalHead: String(record.fields?.ghazalLines?.[0] || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
        unwan: String(record.fields?.unwan || "")
          .replace(/\r\n?/g, "\n")
          .split("\n")
          .filter(Boolean),
      },
    }));

    // Sort by search relevance when there's a search query
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      return formatted.sort((a: any, b: any) => {
        const aShaer = (a.fields.shaer || "").toLowerCase();
        const aDisplayLine = (
          Array.isArray(a.fields.ghazalHead) ? a.fields.ghazalHead.join(" ") : a.fields.ghazalHead || ""
        ).toLowerCase(); // ghazalHead is from displayLine
        const aNazm = (a.fields.ghazal?.join(" ") || "").toLowerCase(); // ghazal is from nazm
        const aUnwan = (a.fields.unwan?.join(" ") || "").toLowerCase();

        const bShaer = (b.fields.shaer || "").toLowerCase();
        const bDisplayLine = (
          Array.isArray(b.fields.ghazalHead) ? b.fields.ghazalHead.join(" ") : b.fields.ghazalHead || ""
        ).toLowerCase();
        const bNazm = (b.fields.ghazal?.join(" ") || "").toLowerCase();
        const bUnwan = (b.fields.unwan?.join(" ") || "").toLowerCase();

        // Priority scoring: shaer=4, displayLine=3, nazm=2, unwan=1
        const getScore = (
          shaer: string,
          displayLine: string,
          nazm: string,
          unwan: string
        ) => {
          if (shaer.includes(query)) return 4;
          if (displayLine.includes(query)) return 3;
          if (nazm.includes(query)) return 2;
          if (unwan.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(aShaer, aDisplayLine, aNazm, aUnwan);
        const scoreB = getScore(bShaer, bDisplayLine, bNazm, bUnwan);

        // Higher score first, then alphabetical by shaer name
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aShaer.localeCompare(bShaer);
      });
    }

    return formatted;
  }, [records, searchText]);

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error("Error loading more data:", error);
      toast.error("مزید ڈیٹا لوڈ کرنے میں خرابی");
    }
  };
  const searchQuery = () => {
    if (typeof window !== "undefined") {
      setScrolledPosition(window.scrollY);
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
  // Likes handled inside DataCard; legacy no-op removed
  //handeling sahre
  const handleShareClick = async (
    shaerData: Shaer,
    index: number
  ): Promise<void> => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Nazmen",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: shaerData.fields.ghazalHead || [],
        fallbackSlugText:
          (shaerData.fields.ghazalHead?.[0]) ||
          (shaerData.fields.unwan?.[0]) ||
          "",
        language,
      },
      {
        onShared: async () => {
          try {
            const updatedShares = (shaerData.fields.shares ?? 0) + 1;
            // Optimistic update
            optimisticUpdate.updateRecord(shaerData.id, { shares: updatedShares });
            // Update on server
            await updateNazmen(shaerData.id, { shares: updatedShares });
          } catch (error) {
            console.error("Error updating shares:", error);
            // Revert optimistic update on error
            optimisticUpdate.revert();
            toast.error("شیئر کرنے میں خرابی");
          }
        },
      }
    );
  };
  // Opening card now uses shadcn Drawer instead of manual modal/GSAP
  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
    setSelectedCard({
      id: shaerData.id,
      fields: {
        shaer: shaerData.fields.shaer,
        ghazal: shaerData.fields.ghazal,
        id: shaerData.fields.id,
      },
    });
  };

  // Removed legacy localStorage-driven heart coloring; like state is owned by card
  //toggling anaween box
  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };
  // removed legacy name dialog and manual fetchComments
  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      setRecordId(dataId); // Set the record ID first
      await submitComment(newComment);
      setNewComment("");
      
      // Optimistic update for comments
      const currentRecord = formattedRecords.find((i) => i.id === dataId);
      const nextCommentCount = (currentRecord?.fields.comments || 0) + 1;
      optimisticUpdate.updateRecord(dataId, { comments: nextCommentCount });
      
      try {
        await updateNazmen(dataId, { comments: nextCommentCount });
      } catch (error) {
        // Rollback optimistic update on failure
        optimisticUpdate.revert();
        console.error("Error updating comments on the server:", error);
        toast.error("کمنٹ اپ ڈیٹ کرنے میں خرابی");
      }
    } catch (error) {
      // toast handled inside hook
    }
  };
  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    setRecordId(dataId); // This will trigger comment fetching
    // setIsModleOpen(true);
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
      {/* Sonner Toaster is provided globally in providers.tsx */}
      {/* Removed legacy name dialog; comments rely on authenticated user */}
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
      {isLoading && <SkeletonLoader />}
      {searchText && formattedRecords.length === 0 && !isLoading && (
        <div className="block mx-auto text-center my-3 text-2xl">
          سرچ میں کچھ نہیں ملا
        </div>
      )}
      {searchText && (
        <button
          className="bg-white text-[#984A02] hover:px-7 transition-all duration-200 ease-in-out border block mx-auto my-4 active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
          onClick={resetSearch}
        >
          تلاش ریسیٹ کریں
        </button>
      )}
      {!isLoading && (
        <section>
          <div
            id="section"
            dir="rtl"
            className={`
              grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:pt-4`}
          >
            {formattedRecords.map((shaerData, index) => (
              <div
                data-aos="fade-up"
                key={shaerData?.id ?? index}
              >
                <DataCard
                  page="nazm"
                  download={false}
                  shaerData={shaerData}
                  index={index}
                  handleCardClick={handleCardClick}
                  baseId="app5Y2OsuDgpXeQdz"
                  table="nazmen"
                  storageKey="Nazmen"
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
                  onLikeChange={({ id, liked, likes }) => {
                    // Optimistic update for likes
                    optimisticUpdate.updateRecord(id, { likes });
                  }}
                />
              </div>
            ))}
            {formattedRecords.length > 0 && (
              <div className="flex justify-center text-lg m-5">
                <button
                  onClick={handleLoadMore}
                  disabled={!hasMore || isLoading}
                  className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
                >
                  {isLoading
                    ? "لوڈ ہو رہا ہے۔۔۔"
                    : !hasMore
                    ? "مزید نظمیں نہیں ہیں"
                    : "اور نظمیں لوڈ کریں"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      {/* //commetcard */}
      {/* Removed external close button as it's included in the Drawer component */}
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

export default Nazmen;
