"use client";
import React, { useEffect, useMemo, useState } from "react";
// FontAwesome removed; using Lucide icons instead
import { format } from "date-fns";
import { toast } from "sonner";
import CommentSection from "../Components/CommentSection";
import SkeletonLoader from "../Components/SkeletonLoader";
import DataCard from "../Components/DataCard";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import { House, Search, X } from "lucide-react";
// Removed deprecated Dialog UI imports
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { airtableFetchJson, TTL, invalidateAirtable } from "@/lib/airtable-fetcher";
import { escapeAirtableFormulaValue } from "@/lib/utils";
// createSlug no longer needed here; using centralized share helper
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { ASHAAR_COMMENTS_BASE, COMMENTS_TABLE } from "@/lib/airtable-constants";
import useAuthGuard from "@/hooks/useAuthGuard";
import { shareRecordWithCount } from "@/lib/social-utils";
import { useLanguage } from "@/contexts/LanguageContext";

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

const Ashaar: React.FC<{}> = () => {
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  // Removed modal state; comments use a Drawer inside CommentSection
  const [searchText, setSearchText] = useState("");
  const [moreloading, setMoreLoading] = useState(false);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  // Comment system
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(ASHAAR_COMMENTS_BASE, COMMENTS_TABLE, null);
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

  // Build filter formula used by SWR hook
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const safe = escapeAirtableFormulaValue(q);
    return `OR( FIND('${safe}', LOWER({shaer})), FIND('${safe}', LOWER({sher})), FIND('${safe}', LOWER({body})), FIND('${safe}', LOWER({unwan})) )`;
  }, [searchText]);

  const { records, isLoading, hasMore, loadMore, mutate, swrKey } = useAirtableList<Shaer>(
    "appeI2xzzyvUN5bR7",
    "Ashaar",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateAshaar } = useAirtableMutation(
    "appeI2xzzyvUN5bR7",
    "Ashaar"
  );
  // Removed deprecated createAshaarComment; comment creation uses useCommentSystem

  // Format records as before
  const formattedRecords: Shaer[] = useMemo(() => {
    return (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        ghazal: String(record.fields?.body || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        ghazalHead: String(record.fields?.sher || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        unwan: String(record.fields?.unwan || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
      },
    }));
  }, [records]);

  const dataItems = formattedRecords;
  const loading = isLoading;
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
            await updateAshaar([{ id: shaerData.id, fields: { shares: updatedShares } }]);
            // Optimistically update SWR cache pages
            await mutate(
              (pages: any[] | undefined) => {
                if (!pages) return pages;
                return pages.map((p: any) => ({
                  ...p,
                  records: (p.records || []).map((r: any) =>
                    r.id === shaerData.id
                      ? { ...r, fields: { ...r.fields, shares: updatedShares } }
                      : r
                  ),
                }));
              },
              { revalidate: false }
            );
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
  const fetchComments = async (dataId: string) => {
    setRecordId(dataId);
  };
  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      // Optimistically bump the comments count in current SWR cache
      const current = dataItems.find((i) => i.id === dataId);
      const nextCount = ((current?.fields.comments) || 0) + 1;
      await mutate(
        (pages: any[] | undefined) => {
          if (!pages) return pages;
          return pages.map((p: any) => ({
            ...p,
            records: (p.records || []).map((r: any) =>
              r.id === dataId
                ? { ...r, fields: { ...r.fields, comments: nextCount } }
                : r
            ),
          }));
        },
        { revalidate: false }
      );
      setNewComment("");
      // Persist comments count; rollback the optimistic bump if it fails
      try {
        await updateAshaar([{ id: dataId, fields: { comments: nextCount } }]);
      } catch (err) {
        await mutate(
          (pages: any[] | undefined) => {
            if (!pages) return pages;
            return pages.map((p: any) => ({
              ...p,
              records: (p.records || []).map((r: any) =>
                r.id === dataId
                  ? { ...r, fields: { ...r.fields, comments: Math.max(0, (nextCount || 1) - 1) } }
                  : r
              ),
            }));
          },
          { revalidate: false }
        );
      }
    } catch (e) {
      // errors are toasted inside hook
    }
  };
  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    fetchComments(dataId);
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
      <div className="w-full z-10 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[116px] md:top-[80px]">
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
                  swrKey={swrKey}
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
