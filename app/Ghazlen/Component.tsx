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
  // Build filter formula via SWR hook
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    // sanitize to avoid Airtable formula injection: escape backslashes and single quotes
    const safeQ = q.replace(/\\/g, "\\\\").replace(/'/g, "''");
    return `OR( FIND('${safeQ}', LOWER({shaer})), FIND('${safeQ}', LOWER({ghazalHead})), FIND('${safeQ}', LOWER({ghazal})), FIND('${safeQ}', LOWER({unwan})) )`;  }, [searchText]);

  const { records, isLoading, hasMore, loadMore } = useAirtableList<Shaer>(
    "appvzkf6nX376pZy6",
    "Ghazlen",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateGhazlen } = useAirtableMutation(
    "appvzkf6nX376pZy6",
    "Ghazlen"
  );
  const { createRecord: createGhazlenComment } = useAirtableCreate(
    "appzB656cMxO0QotZ",
    "Comments"
  );

  // Format records
  const formattedRecords: Shaer[] = useMemo(() => {
    return (records || []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        ghazal: String(record.fields?.ghazal || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
        ghazalHead: String(record.fields?.ghazalHead || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
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
        const existingDataJSON = localStorage.getItem("Ghazlen");

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

          localStorage.setItem("Ghazlen", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          try {
            const updatedLikes = shaerData.fields.likes + 1;
            await updateGhazlen([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
            setDataItems((prev) => {
              const copy = [...prev];
              const item = copy[index];
              if (item?.fields) item.fields.likes = updatedLikes;
              return copy;
            });
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

          localStorage.setItem("Ghazlen", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          try {
            const updatedLikes = shaerData.fields.likes - 1;
            await updateGhazlen([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
            setDataItems((prev) => {
              const copy = [...prev];
              const item = copy[index];
              if (item?.fields) item.fields.likes = updatedLikes;
              return copy;
            });
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
      } else {
        console.warn("Web Share API is not supported.");
      }
    } catch (error) {
      // Handle any errors that may occur when using the Web Share API
      console.error("Error sharing:", error);
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
  //opening and closing ghazal
  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
  };
  // Keep latest data items in a ref to avoid stale-closure in effects
  const latestDataRef = useRef<Shaer[]>(dataItems);
  useEffect(() => {
    latestDataRef.current = dataItems;
  }, [dataItems]);

  // On mount and when list length changes, mark hearts based on localStorage in a batched, efficient way
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedData = localStorage.getItem("Ghazlen");
      if (!storedData) return;
      try {
        const parsed: Array<{ id: string }> = JSON.parse(storedData);
        const likedIds = new Set(parsed.map((d) => d.id));
        const items = latestDataRef.current;

        // Batch DOM updates: loop once and update classes
        for (const item of items) {
          const el = document.getElementById(item.id);
          if (!el) continue;
          if (likedIds.has(item.id)) {
            el.classList.add("text-red-600");
            el.classList.remove("text-gray-500");
          } else {
            el.classList.remove("text-red-600");
            el.classList.add("text-gray-500");
          }
        }
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    }
  }, [dataItems.length]);
  //toggling anaween box
  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };
  // name input dialogue box (form)
  const hideDialog = () => {
    setShowDialog(false);
  };
  // name change handeling in name input filed
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };
  // handeling name save on the button click
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
        baseId: "appzB656cMxO0QotZ",
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
  await createGhazlenComment([{ fields: commentData }]);
        {
          // Update the UI with the new comment
          setComments((prevComments: Comment[]) => [
            ...prevComments,
            commentData,
          ]);

          // Clear the input field and increment comments immutably in state
          setNewComment("");
          const currentItem = dataItems.find((i) => i.id === dataId);
          const newCommentsCount = ((currentItem?.fields?.comments) || 0) + 1;
          setDataItems((prev) => prev.map((i) => (i.id === dataId ? incrementComments(i) : i)));

          try {
            await updateGhazlen([{ id: dataId, fields: { comments: newCommentsCount } }]);
            // Invalidate comments cache to ensure subsequent fetch reflects new comment
            invalidateAirtable("appzB656cMxO0QotZ", "Comments");
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
      {showDialog && (
        <div className="w-screen h-screen bg-black bg-opacity-60 flex flex-col justify-center fixed z-50">
          <div
            dir="rtl"
            className="dialog-container h-max p-9 -mt-20 w-max max-w-[380px] rounded-md text-center block mx-auto bg-white"
          >
            <div className="dialog-content">
              <p className="text-lg font-bold pb-3 border-b">
                براہ کرم اپنا نام درج کریں
              </p>
              <p className="pt-2">
                {" "}
                آپ کا نام۔صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے استعمال
                کریں گے۔
              </p>
              <input
                type="text"
                id="nameInput"
                className="mt-2 p-2 border"
                value={nameInput}
                onChange={handleNameChange}
              />
              <div className=" mt-4">
                <button
                  id="submitBtn"
                  disabled={nameInput.length < 4}
                  className="px-4 py-2 bg-[#984A02] disabled:bg-gray-500 text-white rounded"
                  onClick={handleNameSubmission}
                >
                  محفوظ کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[116px] md:top-[80px] border-foreground border-b-2">
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
