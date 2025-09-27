"use client";
import React, { useEffect, useMemo, useState } from "react";
import { House, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CommentSection from "../Components/CommentSection";
import SkeletonLoader from "../Components/SkeletonLoader";
import DataCard from "../Components/DataCard";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import { Home, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import { airtableFetchJson, TTL, invalidateAirtable } from "@/lib/airtable-fetcher";

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
  const [selectedCard, setSelectedCard] = React.useState<{
    id: string;
    fields: { shaer: string; ghazal: string[]; id: string };
  } | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    offset: null,
    pageSize: 30,
  });
  const [voffset, setOffset] = useState<string | null>("");
  const [dataOffset, setDataOffset] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [moreloading, setMoreLoading] = useState(true);
  const [dataItems, setDataItems] = useState<Shaer[]>([]);
  const [initialDataItems, setInitialdDataItems] = useState<Shaer[]>([]);
  const [noMoreData, setNoMoreData] = useState(false);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  //comments
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  // toast via sonner

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);

  // simple toast helper
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
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    // Escape single quotes and other special characters for Airtable formula
    const escapedQ = q.replace(/'/g, "\\'");
    return `OR( FIND('${escapedQ}', LOWER({shaer})), FIND('${escapedQ}', LOWER({displayLine})), FIND('${escapedQ}', LOWER({nazm})), FIND('${escapedQ}', LOWER({unwan})) )`;
  }, [searchText]);
  const { records, isLoading, hasMore, loadMore, swrKey } = useAirtableList<Shaer>(
    "app5Y2OsuDgpXeQdz",
    "nazmen",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateNazmen } = useAirtableMutation(
    "app5Y2OsuDgpXeQdz",
    "nazmen"
  );
  const { createRecord: createNazmenComment } = useAirtableCreate(
    "appjF9QvJeKAM9c9F",
    "Comments"
  );

  const formattedRecords: Shaer[] = useMemo(() => {
    return (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        ghazal: String(record.fields?.nazm || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        ghazalHead: String(record.fields?.displayLine || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        unwan: String(record.fields?.unwan || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
      },
    }));
  }, [records]);

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
    if (typeof window !== 'undefined') {
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
    // setDataItems(data.getAllShaers()); // Restore the original data
  };
  // Likes handled inside DataCard; legacy no-op removed
  //handeling sahre
  const handleShareClick = async (
    shaerData: Shaer,
    index: number
  ): Promise<void> => {
    toggleanaween(null);
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.fields.shaer, // Use the shaer's name as the title
            text:
              shaerData.fields.ghazalHead.map((line) => line).join("\n") +
              `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `, // Join ghazalHead lines with line breaks
            url: `${window.location.href + "/" + shaerData.id}`, // Get the current page's URL
          })

          .then(() => console.info("Successful share"))
          .catch((error) => console.error("Error sharing", error));
        try {
          const updatedShares = shaerData.fields.shares + 1;
          await updateNazmen([{ id: shaerData.id, fields: { shares: updatedShares } }]);
          setDataItems((prev) => {
            const copy = [...prev];
            const item = copy[index];
            if (item?.fields) item.fields.shares = updatedShares;
            return copy;
          });
        } catch (error) {
          console.error("Error updating shres:", error);
        }
      } else {
        console.warn("Web Share API is not supported.");
      }
    } catch (error) {
      // Handle any errors that may occur when using the Web Share API
      console.error("Error sharing:", error);
    }
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
  const hideDialog = () => {
    setShowDialog(false);
  };
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };
  const handleNameSubmission = () => {
    localStorage.setItem("commentorName", nameInput);
    setCommentorName(nameInput);
    hideDialog();
  };
  const fetchComments = async (dataId: string) => {
    const storedName = localStorage.getItem("commentorName");
    try {
      setCommentLoading(true);
      if (!commentorName && storedName === null) {
        setShowDialog(true);
      } else {
        setCommentorName(commentorName || storedName);
      }
      const result = await airtableFetchJson({
        kind: "list",
        baseId: "appjF9QvJeKAM9c9F",
        table: "Comments",
        params: { filterByFormula: `dataId="${dataId}"` },
        ttl: TTL.fast,
      });

      const fetchedComments = (result.records || []).map(
        (record: {
          fields: {
            dataId: string;
            commentorName: string | null;
            timestamp: string | Date;
            comment: string;
          };
        }) => ({
          dataId: record.fields.dataId,
          commentorName: record.fields.commentorName,
          timestamp: record.fields.timestamp,
          comment: record.fields.comment,
        })
      );
      setCommentLoading(false);
      setComments(fetchedComments);
    } catch (error) {
      setCommentLoading(false);
      console.error(`Failed to fetch comments: ${error}`);
    }
  };
  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };
  const handleCommentSubmit = async (dataId: string) => {
    // Check if the user has provided a name
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("commentorName");
      if (!commentorName && storedName === null) {
        setShowDialog(true);
      } else {
        setCommentorName(commentorName || storedName);
      }
    }
    if (newComment !== "") {
      try {
        const timestamp = new Date().toISOString();
        const date = new Date(timestamp);

        const formattedDate = format(date, "MMMM dd, yyyy h:mm", {});

        const commentData = {
          dataId,
          commentorName,
          timestamp: formattedDate,
          comment: newComment,
        };
        await createNazmenComment([{ fields: commentData }]);
        // Update the UI with the new comment
        setComments((prevComments: Comment[]) => [
          ...prevComments,
          commentData,
        ]);

        // Clear the input field
        setNewComment("");
        const updatedDataItems = dataItems.map((dataItem) => {
          if (dataItem.id === dataId) {
            // If the dataItem has the matching id, update comments field
            const currentComments = dataItem.fields.comments || 0;
            return {
              ...dataItem,
              fields: {
                ...dataItem.fields,
                comments: currentComments + 1,
              },
            };
          }
          return dataItem;
        });

        const dataItemToUpdate = updatedDataItems.find(
          (item) => item.id === dataId
        );

        if (dataItemToUpdate && dataItemToUpdate.fields) {
          if (!dataItemToUpdate.fields.comments) {
            // If the comments field is not present, add it with the value 1
            dataItemToUpdate.fields.comments = 1;
          }
        }
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
          await updateNazmen([{ id: dataId, fields: { comments: dataItemToUpdate!.fields.comments } }]);
          // Invalidate comments cache to ensure subsequent fetch reflects new comment
          invalidateAirtable("appjF9QvJeKAM9c9F", "Comments");
        } catch (error) {
          console.error("Error updating comments on the server:", error);
        }
      } catch (error) {
        console.error(`Error adding comment: ${error}`);
      }
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
  };
  const resetSearch = () => {
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
      {/* Sonner Toaster is provided globally in providers.tsx */}
      <Dialog open={showDialog} onOpenChange={hideDialog}>
        <DialogContent dir="rtl" className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold pb-3 border-b text-center">
              براہ کرم اپنا نام درج کریں
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              ہم آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے
              استعمال کریں گے
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4"
          >
            <Input
              id="nameInput"
              value={nameInput}
              onChange={handleNameChange}
              className="mt-2"
            />
            <Button
              id="submitBtn"
              disabled={nameInput.length < 4}
              onClick={handleNameSubmission}
              className="bg-[#984A02] disabled:bg-gray-500 text-white hover:bg-[#984A02]/90"
            >
              محفوظ کریں
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
          <div
            id="section"
            dir="rtl"
            className={`
              grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:pt-4`}
          >
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={(shaerData as any)?.id ?? (shaerData as any)?.ID ?? index}>
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

export default Ashaar;
