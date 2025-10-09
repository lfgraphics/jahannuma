"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Home, Search, XCircle, X, House } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CommentSection from "../Components/CommentSection";
import SkeletonLoader from "../Components/SkeletonLoader";
import DataCard from "../Components/DataCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { airtableFetchJson, TTL, invalidateAirtable } from "@/lib/airtable-fetcher";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { GHAZLEN_COMMENTS_BASE, COMMENTS_TABLE } from "@/lib/airtable-constants";
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
interface Pagination {
  offset: string | null;
  pageSize: number;
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
  const [pagination, setPagination] = useState<Pagination>({
    offset: null,
    pageSize: 30,
  });
  const [dataOffset, setDataOffset] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showIcons, setShowIcons] = useState(false);
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [moreloading, setMoreLoading] = useState(true);
  const [dataItems, setDataItems] = useState<Shaer[]>([]);
  const [initialDataItems, setInitialdDataItems] = useState<Shaer[]>([]);
  const [noMoreData, setNoMoreData] = useState(false);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  // Comment system
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(GHAZLEN_COMMENTS_BASE, COMMENTS_TABLE, null);
  const { requireAuth } = useAuthGuard();
  const { language } = useLanguage();
  // toast via sonner
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
  //function ot scroll to the top
  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
  // Build filter formula via SWR hook - prioritize shaer (poet name)
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    // sanitize to avoid Airtable formula injection: escape backslashes and single quotes
    const safeQ = q.replace(/\\/g, "\\\\").replace(/'/g, "''");
    // Priority order: shaer (poet name), then ghazalHead, ghazal, unwan
    return `OR( FIND('${safeQ}', LOWER({shaer})), FIND('${safeQ}', LOWER({ghazalHead})), FIND('${safeQ}', LOWER({ghazal})), FIND('${safeQ}', LOWER({unwan})) )`;  }, [searchText]);

  const { records, isLoading, hasMore, loadMore, swrKey } = useAirtableList<Shaer>(
    "appvzkf6nX376pZy6",
    "Ghazlen",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateGhazlen } = useAirtableMutation(
    "appvzkf6nX376pZy6",
    "Ghazlen"
  );
  // Removed deprecated createGhazlenComment; handled by useCommentSystem

  // Format records and sort by search relevance
  const formattedRecords: Shaer[] = useMemo(() => {
    const formatted = (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        ghazal: String(record.fields?.ghazal || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        ghazalHead: String(record.fields?.ghazalHead || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        unwan: String(record.fields?.unwan || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
      },
    }));

    // Sort by search relevance when there's a search query
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      return formatted.sort((a, b) => {
        const aShaer = (a.fields.shaer || '').toLowerCase();
        const aGhazalHead = (a.fields.ghazalHead?.join(' ') || '').toLowerCase();
        const aGhazal = (a.fields.ghazal?.join(' ') || '').toLowerCase();
        const aUnwan = (a.fields.unwan?.join(' ') || '').toLowerCase();
        
        const bShaer = (b.fields.shaer || '').toLowerCase();
        const bGhazalHead = (b.fields.ghazalHead?.join(' ') || '').toLowerCase();
        const bGhazal = (b.fields.ghazal?.join(' ') || '').toLowerCase();
        const bUnwan = (b.fields.unwan?.join(' ') || '').toLowerCase();

        // Priority scoring: shaer=4, ghazalHead=3, ghazal=2, unwan=1
        const getScore = (shaer: string, ghazalHead: string, ghazal: string, unwan: string) => {
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
  }, [records, searchText]);

  useEffect(() => {
    setDataItems(formattedRecords);
    setLoading(isLoading);
    setMoreLoading(false);
    setNoMoreData(!hasMore);
  }, [formattedRecords, isLoading, hasMore]);

  const handleLoadMore = async () => {
    try {
      setMoreLoading(true);
      await loadMore();
    } finally {
      setMoreLoading(false);
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
  //clear search box handeling
  const clearSearch = () => {
    setSearchText("");
    setShowIcons(false);
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
        section: "Ghazlen",
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
            await updateGhazlen([{ id: shaerData.id, fields: { shares: updatedShares } }]);
            setDataItems((prev) => {
              const copy = [...prev];
              const item = copy[index];
              if (item?.fields) item.fields.shares = updatedShares;
              return copy;
            });
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
  // Keep latest data items in a ref to avoid stale-closure in effects
  const latestDataRef = useRef<Shaer[]>(dataItems);
  useEffect(() => {
    latestDataRef.current = dataItems;
  }, [dataItems]);

  // Removed legacy localStorage-driven heart coloring; like state is owned by card
  //toggling anaween box
  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };
  const fetchComments = async (dataId: string) => {
    setRecordId(dataId);
  };
  // showing the current made comment in comment box
  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };
  // Pure helper to increment comments immutably
  const incrementComments = (item: Shaer): Shaer => ({
    ...item,
    fields: {
      ...item.fields,
      comments: (item.fields?.comments || 0) + 1,
    },
  });
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      // Clear input and optimistically increment comments count in local state
      setNewComment("");
      const currentItem = dataItems.find((i) => i.id === dataId);
      const newCommentsCount = ((currentItem?.fields?.comments) || 0) + 1;
      // Optimistically increment
      setDataItems((prev) => prev.map((i) => (i.id === dataId ? incrementComments(i) : i)));
      try {
        await updateGhazlen([{ id: dataId, fields: { comments: newCommentsCount } }]);
      } catch (error) {
        // Rollback optimistic count on failure
        setDataItems((prev) => prev.map((i) => (i.id === dataId ? ({ ...i, fields: { ...i.fields, comments: Math.max(0, (i.fields?.comments || 1) - 1) } }) : i)));
        console.error("Error updating comments on the server:", error);
      }
    } catch (error) {
      // errors are handled via toasts inside the hook
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
  // reseting  search
  const resetSearch = () => {
    setDataOffset(pagination.offset);
    searchText && clearSearch();
    setDataItems(initialDataItems);
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
      {/* Sonner Toaster is global; no local toast container */}
      {/* Removed legacy name dialog; comments rely on authenticated user */}
      <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[95px] lg:top-[56px] border-foreground">
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
          <div id="section" dir="rtl" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sticky m-3`}>
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={index + "aosdiv"}>
                <DataCard
                  page="ghazal"
                  download={false}
                  key={index}
                  shaerData={shaerData}
                  index={index}
                  handleCardClick={handleCardClick}
                  baseId="appvzkf6nX376pZy6"
                  table="Ghazlen"
                  storageKey="Ghazlen"
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
                  swrKey={swrKey}
                  onLikeChange={({ id, liked, likes }) => {
                    // placeholder analytics
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
                      ? "مزید غزلیں نہیں ہیں"
                      : "مزید غزلیں لوڈ کریں"}
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

export default Ashaar;
