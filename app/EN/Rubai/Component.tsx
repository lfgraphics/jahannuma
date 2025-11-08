"use client";
import { useLikeButton } from "@/hooks/useLikeButton";
import AOS from "aos";
import "aos/dist/aos.css";
import { House, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import CommentSection from "../Components/CommentSection";
import RubaiCard from "../Components/RubaiCard";
import SkeletonLoader from "../Components/SkeletonLoader";

import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useCommentSystem } from "@/hooks/social/useCommentSystem";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRubaiData } from "@/hooks/useRubaiData";
import { useShareAction } from "@/hooks/useShareAction";
import type { Rubai } from "../types";

const { getClientBaseId } = require("@/lib/airtable-client-utils");

interface ApiResponse {
  records: Rubai[];
  offset: string | null;
}
interface Comment {
  dataId: string | null;
  commentorName: string | null;
  timestamp: string;
  comment: string;
}

interface RubaiComponentProps {
  initialData?: string | null;
  fallbackData?: any;
}

const RubaiComponent: React.FC<RubaiComponentProps> = ({
  initialData,
  fallbackData
}) => {
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [initialDataItems, setInitialdDataItems] = useState<Rubai[]>([]);
  // Comment system
  const [newComment, setNewComment] = useState("");
  const {
    comments,
    isLoading: commentLoading,
    submitComment,
    setRecordId,
  } = useCommentSystem({ contentType: "rubai" });
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } =
    useAuthGuard();
  const share = useShareAction({ section: "Rubai", title: "" });
  // notifications handled by global Sonner Toaster
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  //function ot scroll to the top
  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
  // Parse initial data from server
  const hydratedInitialData = useMemo(() => {
    if (initialData) {
      try {
        return JSON.parse(initialData);
      } catch (error) {
        console.error("Error parsing Rubai initial data:", error);
        return fallbackData;
      }
    }
    return fallbackData;
  }, [initialData, fallbackData]);

  // Build filter formula and use new Rubai data hook
  const filterFormula = useMemo(() => {
    const q = debouncedSearchText.trim().toLowerCase();
    if (!q) return undefined;
    const escaped = q.replace(/'/g, "\\'");
    // Priority order: shaer (poet name), then body, unwan
    return `OR( FIND('${escaped}', LOWER({shaer})), FIND('${escaped}', LOWER({body})), FIND('${escaped}', LOWER({unwan})) )`;
  }, [debouncedSearchText]);

  const {
    records,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    optimisticUpdate
  } = useRubaiData(
    { pageSize: 30, filterByFormula: filterFormula },
    {
      debounceMs: 300,
      initialData: hydratedInitialData
    }
  );

  const { updateRecord: updateRubai } = useAirtableMutation("rubai");

  // Sort by search relevance when there's a search query
  const dataItems = useMemo(() => {
    let sortedData = records || [];
    if (debouncedSearchText.trim()) {
      const query = debouncedSearchText.trim().toLowerCase();
      sortedData = (records || []).slice().sort((a: Rubai, b: Rubai) => {
        const aShaer = (a.fields.shaer || "").toLowerCase();
        const aBody = (a.fields.body || "").toLowerCase();
        const aUnwan = (a.fields.unwan || "").toLowerCase();

        const bShaer = (b.fields.shaer || "").toLowerCase();
        const bBody = (b.fields.body || "").toLowerCase();
        const bUnwan = (b.fields.unwan || "").toLowerCase();

        // Priority scoring: shaer=3, body=2, unwan=1
        const getScore = (shaer: string, body: string, unwan: string) => {
          if (shaer.includes(query)) return 3;
          if (body.includes(query)) return 2;
          if (unwan.includes(query)) return 1;
          return 0;
        };

        const scoreA = getScore(aShaer, aBody, aUnwan);
        const scoreB = getScore(bShaer, bBody, bUnwan);

        // Higher score first, then alphabetical by shaer name
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return aShaer.localeCompare(bShaer);
      });
    }
    return sortedData;
  }, [records, debouncedSearchText]);

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error("Error loading more Rubai:", error);
    }
  };
  const searchQuery = () => {
    if (typeof window !== "undefined") setScrolledPosition(window.scrollY);
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

    input?.value ? (input.value = "") : null;
    xMark?.classList.add("hidden");
    sMark?.classList.add("hidden");
    // Clear the searched data and show all data again
    setSearchText(""); // Clear the searchText state
  };
  // Update local list on like change (for instant UI feedback)
  const handleLikeChange = (args: {
    id: string;
    liked: boolean;
    likes: number;
  }) => {
    optimisticUpdate.updateRecord(args.id, { likes: args.likes });
  };

  // Per-card wrapper to bind Clerk like hook to RubaiCard
  const CardItem: React.FC<{ item: Rubai; index: number }> = ({
    item,
    index,
  }) => {
    const like = useLikeButton({
      baseId: getClientBaseId("RUBAI"),
      table: "rubai",
      storageKey: "Rubai",
      recordId: item.id,
      currentLikes: item.fields?.likes ?? 0,
      onChange: handleLikeChange,
    });
    const onHeartClick = async (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (!requireAuth("like")) return;
      await like.handleLikeClick();
    };
    return (
      <RubaiCard
        RubaiData={item}
        index={index}
        handleHeartClick={onHeartClick}
        openComments={openComments}
        handleShareClick={handleShareClick}
        isLiking={like.isDisabled}
        isLiked={like.isLiked}
        likesCount={like.likesCount}
      />
    );
  };
  //handeling share via centralized hook
  const handleShareClick = async (
    shaerData: Rubai,
    _index: number
  ): Promise<void> => {
    await share.handleShare({
      baseId: getClientBaseId("RUBAI"),
      table: "rubai",
      recordId: shaerData.id,
      title: (shaerData.fields as any).enShaer || shaerData.fields.shaer,
      textLines: [(shaerData.fields as any).enBody || String(shaerData.fields.body ?? "")],
      // Use first non-empty line of body as slug text
      fallbackSlugText:
        String(shaerData.fields?.body ?? "")
          .split("\n")
          .find((l) => l.trim().length > 0) ?? "",
      currentShares: shaerData.fields.shares ?? 0,
    });
  };

  // Removed localStorage highlighting; modern likes handled via Clerk metadata

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
      setNewComment("");
      // Optimistically update comment count
      const currentRecord = dataItems.find((i: Rubai) => i.id === dataId);
      const newCommentCount = (currentRecord?.fields.comments || 0) + 1;
      optimisticUpdate.updateRecord(dataId, { comments: newCommentCount });
      try {
        const current = dataItems.find((i: Rubai) => i.id === dataId);
        const next = (current?.fields.comments || 0) + 1;
        await updateRubai(dataId, { comments: next });
      } catch (error) {
        // Rollback optimistic comment increment
        const currentRecord = dataItems.find((i: Rubai) => i.id === dataId);
        const rollbackCount = Math.max(0, (currentRecord?.fields.comments || 1) - 1);
        optimisticUpdate.updateRecord(dataId, { comments: rollbackCount });
        console.error("Error updating comments on the server:", error);
      }
    } catch (error) {
      // toast handled inside hook
    }
  };
  const openComments = (dataId: string) => {
    setSelectedCommentId(dataId);
    setRecordId(dataId); // This will trigger comment fetching
  };
  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };
  // reseting search
  const resetSearch = () => {
    searchText && clearSearch();
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
      {/* Toast handled globally by Sonner Toaster; share no longer requires login */}
      {/* Removed legacy name dialog; comments rely on authenticated user */}
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
              placeholder="Search by typing"
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
      {isLoading && <SkeletonLoader />}
      {initialDataItems.length > 0 && dataItems.length == 0 && (
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
      {!isLoading && (
        <section>
          <div
            id="section"
            dir="ltr"
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sticky mt-6`}
          >
            {dataItems.map((data: Rubai, index: number) => (
              <div data-aos="fade-up" key={data.id}>
                <CardItem item={data} index={index} />
              </div>
            ))}
            {dataItems.length > 0 && (
              <div className="flex justify-center text-lg m-5">
                <button
                  onClick={handleLoadMore}
                  disabled={!hasMore || isLoadingMore}
                  className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
                >
                  {isLoadingMore
                    ? "Loading..."
                    : !hasMore
                      ? "No more rubai available"
                      : "Load more rubai"}
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

export default RubaiComponent;
