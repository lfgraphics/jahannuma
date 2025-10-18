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
import { useAshaarData } from "@/hooks/useAshaarData";
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

interface AshaarProps {
  initialData?: any;
}

const Ashaar: React.FC<AshaarProps> = ({ initialData }) => {
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  // Removed modal state; comments use a Drawer inside CommentSection
  const [searchText, setSearchText] = useState("");
  const [moreloading, setMoreLoading] = useState(false);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  // Comment system
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem({ contentType: "ashaar" });
  const { requireAuth } = useAuthGuard();
  const { language } = useLanguage();
  // toast via sonner (global Toaster is mounted in providers.tsx)

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);
  // simple toast wrapper
  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    if (msgtype === "success") return toast.success(message);
    if (msgtype === "error") return toast.error(message);
    return toast.warning(message);
  };

  // Build filter formula used by SWR hook - prioritize shaer (poet name)
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const safe = escapeAirtableFormulaValue(q);
    // Priority order: shaer (poet name), then sher, body, unwan
    return `OR( FIND('${safe}', LOWER({shaer})), FIND('${safe}', LOWER({sher})), FIND('${safe}', LOWER({body})), FIND('${safe}', LOWER({unwan})) )`;
  }, [searchText]);

  const { records, isLoading, isValidating, hasMore, loadMore, mutate, optimisticUpdate } = useAshaarData(
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300, initialData }
  );

  // Differentiate between initial loading and loading more data
  const isInitialLoading = isLoading && (!records || records.length === 0);
  const isLoadingMore = isValidating && !isLoading && records && records.length > 0;

  const { updateRecord: updateAshaar } = useAirtableMutation("ashaar");
  // Removed deprecated createAshaarComment; comment creation uses useCommentSystem

  // Format records and sort by search relevance
  const formattedRecords: Shaer[] = useMemo(() => {
    const formatted = (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        ghazal: String(record.fields?.body || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        ghazalHead: String(record.fields?.sher || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        unwan: String(record.fields?.unwan || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
      },
    }));

    // Sort by search relevance when there's a search query
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      return formatted.sort((a, b) => {
        const aShaer = (a.fields.shaer || '').toLowerCase();
        const aSher = (a.fields.sher?.join(' ') || '').toLowerCase();
        const aBody = (a.fields.body || '').toLowerCase();
        const aUnwan = (a.fields.unwan?.join(' ') || '').toLowerCase();
        
        const bShaer = (b.fields.shaer || '').toLowerCase();
        const bSher = (b.fields.sher?.join(' ') || '').toLowerCase();
        const bBody = (b.fields.body || '').toLowerCase();
        const bUnwan = (b.fields.unwan?.join(' ') || '').toLowerCase();

        // Priority scoring: shaer=4, sher=3, body=2, unwan=1
        const getScore = (shaer: string, sher: string, body: string, unwan: string) => {
          if (shaer.includes(query)) return 4;
          if (sher.includes(query)) return 3;
          if (body.includes(query)) return 2;
          if (unwan.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(aShaer, aSher, aBody, aUnwan);
        const scoreB = getScore(bShaer, bSher, bBody, bUnwan);
        
        // Higher score first, then alphabetical by shaer name
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aShaer.localeCompare(bShaer);
      });
    }

    return formatted;
  }, [records, searchText]);

  const dataItems = formattedRecords;
  const loading = isInitialLoading;
  const noMoreData = !hasMore;

  // fetching more data by load more data button
  const handleLoadMore = async () => {
    try {
      setMoreLoading(true);
      await loadMore();
    } finally {
      setMoreLoading(false);
    }
  };
  // re-run when search clicked
  const searchQuery = () => {
    // no-op: filterFormula derives from searchText
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
  // Likes handled within DataCard; legacy no-op removed
  // handle share via centralized helper; increment only on confirmed OS share
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

            // Optimistically update the UI first
            optimisticUpdate.updateRecord(shaerData.id, { shares: updatedShares });

            // Then persist to server
            try {
              await updateAshaar(shaerData.id, { shares: updatedShares });
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
  // Opening card currently just collapses any open 'anaween'; modal removed
  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
  };

  // Removed legacy localStorage-driven heart coloring; like state is owned by card
  //toggling anaween box
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
        await updateAshaar(dataId, { comments: nextCount });
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
    // setIsModleOpen(true);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };
  // Legacy search reset removed; filtering is derived from searchText

  return (
    <div>
      {/* Sonner Toaster is global; no per-page toast container needed */}
      {/* Removed legacy name dialog; comments rely on authenticated user */}
      {/* top-[118px] */}
      <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[90px] lg:top-[56px] border-foreground">
        <div className="filter-btn basis-[75%] justify-center text-center flex">
          <div
            dir="rtl"
            className="flex basis-[100%] justify-center items-center h-auto pt-1"
          >
            <House
              color="#984A02"
              className="ml-3"
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
      {loading && <SkeletonLoader />}
      {!loading && (
        <section>
          <div
            id="section"
            dir="rtl"
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
                  baseId="appeI2xzzyvUN5bR7"
                  table="Ashaar"
                  storageKey="Ashaar"
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
                  onLikeChange={({ id, liked, likes }) => {
                    // placeholder analytics hook
                    // console.info("Ashaar like changed", { id, liked, likes });
                  }}
                />
              </div>
            ))}
            {dataItems.length > 0 && (
              <div className="flex justify-center text-lg m-5">
                <button
                  onClick={handleLoadMore}
                  disabled={noMoreData || moreloading}
                  className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
                >
                  {moreloading
                    ? "لوڈ ہو رہا ہے۔۔۔"
                    : noMoreData
                      ? "مزید اشعار نہیں ہیں"
                      : "مزید اشعار لوڈ کریں"}
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

export default Ashaar;
