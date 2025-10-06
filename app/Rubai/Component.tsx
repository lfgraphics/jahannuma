"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Search, X, House } from "lucide-react";
import CommentSection from "../Components/CommentSection";
import SkeletonLoader from "../Components/SkeletonLoader";
import RubaiCard from "../Components/RubaiCard";
import { useLikeButton } from "@/hooks/useLikeButton";
import AOS from "aos";
import "aos/dist/aos.css";

import type { Rubai } from "../types";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { RUBAI_COMMENTS_BASE, COMMENTS_TABLE } from "@/lib/airtable-constants";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import { useShareAction } from "@/hooks/useShareAction";

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

const Ashaar: React.FC<{}> = () => {
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  const [voffset, setOffset] = useState<string | null>("");
  const [dataOffset, setDataOffset] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [moreloading, setMoreLoading] = useState(true);
  const [dataItems, setDataItems] = useState<Rubai[]>([]);
  const [initialDataItems, setInitialdDataItems] = useState<Rubai[]>([]);
  const [noMoreData, setNoMoreData] = useState(false);
  // Comment system
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(RUBAI_COMMENTS_BASE, COMMENTS_TABLE, null);
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } = useAuthGuard();
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
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
  // Build filter formula and use unified list hook
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const escaped = q.replace(/'/g, "\\'");
    return `OR( FIND('${escaped}', LOWER({shaer})), FIND('${escaped}', LOWER({body})), FIND('${escaped}', LOWER({unwan})) )`;
  }, [searchText]);
  const { records, isLoading, hasMore, loadMore, swrKey } = useAirtableList<Rubai>(
    "appIewyeCIcAD4Y11",
    "rubai",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateRubai } = useAirtableMutation(
    "appIewyeCIcAD4Y11",
    "rubai"
  );

  useEffect(() => {
    setDataItems(records || []);
    setLoading(isLoading);
    setMoreLoading(false);
    setNoMoreData(!hasMore);
  }, [records, isLoading, hasMore]);

  const handleLoadMore = async () => {
    try {
      setMoreLoading(true);
      await loadMore();
    } finally {
      setMoreLoading(false);
    }
  };
  const searchQuery = () => {
    if (typeof window !== 'undefined') setScrolledPosition(window.scrollY);
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
    // setDataItems(data.getAllShaers()); // Restore the original data
  };
  // Update local list on like change (for instant UI feedback)
  const handleLikeChange = (args: { id: string; liked: boolean; likes: number }) => {
    setDataItems(prev => prev.map(it => it.id === args.id ? { ...it, fields: { ...it.fields, likes: args.likes } } : it));
  };

  // Per-card wrapper to bind Clerk like hook to RubaiCard
  const CardItem: React.FC<{ item: Rubai; index: number }> = ({ item, index }) => {
    const like = useLikeButton({
      baseId: "appIewyeCIcAD4Y11",
      table: "rubai",
      storageKey: "Rubai",
      recordId: item.id,
      currentLikes: item.fields?.likes ?? 0,
      swrKey,
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
        handleHeartClick={onHeartClick as any}
        openComments={openComments}
        handleShareClick={handleShareClick}
        isLiking={like.isDisabled}
      />
    );
  };
  //handeling share via centralized hook
  const handleShareClick = async (
    shaerData: Rubai,
    _index: number
  ): Promise<void> => {
    await share.handleShare({
      baseId: "appIewyeCIcAD4Y11",
      table: "rubai",
      recordId: shaerData.id,
      title: shaerData.fields.shaer,
      textLines: [String(shaerData.fields.body ?? "")],
      // Use first non-empty line of body as slug text
      fallbackSlugText: (String(shaerData.fields?.body ?? "").split("\n").find(l => l.trim().length > 0) ?? ""),
      swrKey,
      currentShares: shaerData.fields.shares ?? 0,
    });
  };

  // Removed localStorage highlighting; modern likes handled via Clerk metadata

  const fetchComments = async (dataId: string) => {
    setRecordId(dataId);
  };
  // showing the current made comment in comment box
  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      setNewComment("");
      setDataItems((prevDataItems) => {
        return prevDataItems.map((prevItem) => {
          if (prevItem.id === dataId) {
            return {
              ...prevItem,
              fields: {
                ...prevItem.fields,
                comments: (prevItem.fields.comments || 0) + 1,
              },
            };
          } else {
            return prevItem;
          }
        });
      });
      try {
        const current = dataItems.find((i) => i.id === dataId);
        const next = ((current?.fields.comments) || 0) + 1;
        await updateRubai([{ id: dataId, fields: { comments: next } }]);
      } catch (error) {
        // Rollback optimistic comment increment
        setDataItems((prevDataItems) => prevDataItems.map((prevItem) => (
          prevItem.id === dataId
            ? { ...prevItem, fields: { ...prevItem.fields, comments: Math.max(0, (prevItem.fields.comments || 1) - 1) } }
            : prevItem
        )));
        console.error("Error updating comments on the server:", error);
      }
    } catch (error) {
      // toast handled inside hook
    }
  };
  const openComments = (dataId: string) => {
    setSelectedCommentId(dataId);
    fetchComments(dataId);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };
  // reseting  search
  const resetSearch = () => {
    setDataOffset(voffset);
    searchText && clearSearch();
    setDataItems(initialDataItems);
    if (typeof window !== 'undefined') {
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
      {loading && <SkeletonLoader />}
      {initialDataItems.length > 0 && dataItems.length == 0 && (
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
        <section>
          <div id="section" dir="rtl" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sticky mt-6`}>
            {dataItems.map((data, index) => (
              <div data-aos="fade-up" key={data.id}>
                <CardItem item={data} index={index} />
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
                      ? "مزید رباعی نہیں ہیں"
                      : "مزید رباعی لوڈ کریں"}
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

export default Ashaar;
