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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import { airtableFetchJson, TTL, invalidateAirtable } from "@/lib/airtable-fetcher";
import { escapeAirtableFormulaValue } from "@/lib/utils";

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
  //comments
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
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

  const { records, isLoading, hasMore, loadMore, mutate } = useAirtableList<Shaer>(
    "appeI2xzzyvUN5bR7",
    "Ashaar",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateAshaar } = useAirtableMutation(
    "appeI2xzzyvUN5bR7",
    "Ashaar"
  );
  const { createRecord: createAshaarComment } = useAirtableCreate(
    "appkb5lm483FiRD54",
    "comments"
  );

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
  // handeling liking, adding to localstorage and updating on the server
  const handleHeartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: Shaer,
    index: any,
    id: string
  ): Promise<void> => {
    toggleanaween(null);
  if (typeof window !== 'undefined' && window.localStorage && e.detail === 1) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Ashaar");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: Shaer[] = existingDataJSON
          ? JSON.parse(existingDataJSON)
          : [];

        // Check if the shaerData is already in the existing data
        const isDuplicate = existingData.some(
          (data) => data.id === shaerData.id
        );

        if (!isDuplicate) {
          // Add the new shaerData to the existing data array
          existingData.push(shaerData);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(existingData);

          // Toggle the color between "#984A02" and "grey" based on the current color
          document.getElementById(`${id}`)!.classList.remove("text-gray-500");
          document.getElementById(`${id}`)!.classList.add("text-red-600");

          localStorage.setItem("Ashaar", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ شعر کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          try {
            const updatedLikes = shaerData.fields.likes + 1;
            await updateAshaar([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
          } catch (error) {
            console.error("Error updating likes:", error);
          }
        } else {
          // Remove the shaerData from the existing data array
          const updatedData = existingData.filter(
            (data) => data.id !== shaerData.id
          );

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(updatedData);

          // Toggle the color between "#984A02" and "grey" based on the current color
          document.getElementById(`${id}`)!.classList.remove("text-red-600");
          document.getElementById(`${id}`)!.classList.add("text-gray-500");

          localStorage.setItem("Ashaar", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ شعر کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          try {
            const updatedLikes = shaerData.fields.likes - 1;
            await updateAshaar([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
          } catch (error) {
            console.error("Error updating likes:", error);
          }
        }
      } catch (error) {
        // Handle any errors that may occur when working with Local Storage
        console.error(
          "Error adding/removing data to/from Local Storage:",
          error
        );
      }
    }
  };
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
      } else {
        console.warn("Web Share API is not supported.");
      }
    } catch (error) {
      // Handle any errors that may occur when using the Web Share API
      console.error("Error sharing:", error);
    }
  };
  // Opening card currently just collapses any open 'anaween'; modal removed
  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
  };

  //checking while render, if the data is in the loacstorage then make it's heart red else leave it grey
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedData = localStorage.getItem("Ashaar");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          dataItems.forEach((shaerData, index) => {
            const shaerId = shaerData.id; // Get the id of the current shaerData

            // Check if the shaerId exists in the stored data
            const storedShaer = parsedData.find(
              (data: { id: string }) => data.id === shaerId
            );

            if (storedShaer) {
              // If shaerId exists in the stored data, update the card's appearance
              const cardElement = document.getElementById(shaerId);
              if (cardElement) {
                cardElement.classList.add("text-red-600");
              }
            }
          });
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      }
    }
  }, [dataItems]);
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
        baseId: "appkb5lm483FiRD54",
        table: "comments",
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
  await createAshaarComment([{ fields: commentData }]);
        {
          // Update the UI with the new comment
          setComments((prevComments: Comment[]) => [
            ...prevComments,
            commentData,
          ]);

          // Clear the input field
          setNewComment("");
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

          try {
            await updateAshaar([{ id: dataId, fields: { comments: nextCount } }]);
            // Invalidate comments cache to ensure subsequent fetch reflects new comment
            invalidateAirtable("appkb5lm483FiRD54", "comments");
          } catch (error) {
            console.error("Error updating comments on the server:", error);
          }
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
  // Legacy search reset removed; filtering is derived from searchText

  return (
    <div>
      {/* Sonner Toaster is global; no per-page toast container needed */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl" className="sm:max-w-[400px] bg-background text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold pb-1 text-center">
              براہ کرم اپنا نام درج کریں
            </DialogTitle>
            <DialogDescription className="pt-1">
              ہم آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے استعمال کریں گے
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <input
              type="text"
              id="nameInput"
              className="mt-2 w-full p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={nameInput}
              onChange={handleNameChange}
            />
          </div>
          <DialogFooter className="mt-4">
            <button
              id="submitBtn"
              disabled={nameInput.length < 4}
              className="px-4 py-2 bg-[#984A02] hover:bg-[#8a4202] disabled:bg-gray-500 text-white rounded"
              onClick={handleNameSubmission}
            >
              محفوظ کریں
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* top-[118px] */}
      <div className="w-full z-10 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[116px] md:top-[64px]">
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
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleHeartClick={handleHeartClick}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
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
