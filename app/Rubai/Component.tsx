"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Search, X, House } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CommentSection from "../Components/CommentSection";
import SkeletonLoader from "../Components/SkeletonLoader";
import RubaiCard from "../Components/RubaiCard";
import AOS from "aos";
import "aos/dist/aos.css";

import type { Rubai } from "../types";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import { airtableFetchJson, TTL, invalidateAirtable } from "@/lib/airtable-fetcher";

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
  //comments
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  // notifications handled by global Sonner Toaster
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  //function ot show toast
  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    if (msgtype === "success") toast.success(message);
    else if (msgtype === "error") toast.error(message);
    else toast.warning(message);
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
  // Build filter formula and use unified list hook
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    const escaped = q.replace(/'/g, "\\'");
    return `OR( FIND('${escaped}', LOWER({shaer})), FIND('${escaped}', LOWER({body})), FIND('${escaped}', LOWER({unwan})) )`;
  }, [searchText]);
  const { records, isLoading, hasMore, loadMore } = useAirtableList<Rubai>(
    "appIewyeCIcAD4Y11",
    "rubai",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateRubai } = useAirtableMutation(
    "appIewyeCIcAD4Y11",
    "rubai"
  );

  const { createRecord: createRubaiComment } = useAirtableCreate(
    "appseIUI98pdLBT1K",
    "comments"
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
  // handeling liking, adding to localstorage and updating on the server
  const handleHeartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: Rubai,
    index: any,
    id: string
  ): Promise<void> => {
  if (typeof window !== 'undefined' && window.localStorage && e.detail === 1) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Rubai");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: Rubai[] = existingDataJSON
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

          localStorage.setItem("Rubai", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          try {
            const currentLikes = Number(shaerData?.fields?.likes ?? 0);
            const updatedLikes = currentLikes + 1;
            await updateRubai([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
            setDataItems((prev) =>
              prev.map((item) =>
                item.id !== shaerData.id
                  ? item
                  : { ...item, fields: { ...item.fields, likes: updatedLikes } }
              )
            );
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

          localStorage.setItem("Rubai", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          try {
            const currentLikes = Number(shaerData?.fields?.likes ?? 0);
            const updatedLikes = Math.max(0, currentLikes - 1);
            await updateRubai([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
            setDataItems((prev) =>
              prev.map((item) =>
                item.id !== shaerData.id
                  ? item
                  : { ...item, fields: { ...item.fields, likes: updatedLikes } }
              )
            );
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
    shaerData: Rubai,
    index: number
  ): Promise<void> => {
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.fields.shaer, // Use the shaer's name as the title
            text:
              shaerData.fields.body +
              `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `, // Join ghazalHead lines with line breaks
            url: `${window.location.href + "/" + shaerData.id}`, // Get the current page's URL
          })

          .then(() => console.info("Successful share"))
          .catch((error) => console.error("Error sharing", error));
        try {
          const updatedShares = shaerData.fields.shares + 1;
          await updateRubai([{ id: shaerData.id, fields: { shares: updatedShares } }]);
          setDataItems((prev) =>
            prev.map((item) =>
              item.id !== shaerData.id
                ? item
                : { ...item, fields: { ...item.fields, shares: updatedShares } }
            )
          );
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

  //checking while render, if the data is in the loacstorage then make it's heart red else leave it grey
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedData = localStorage.getItem("Rubai");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          dataItems.forEach((shaerData, index) => {
            const shaerId = shaerData.fields.id; // Get the id of the current shaerData

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

  // name change handeling in name input filed
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };
  // handeling name save on the button click
  const handleNameSubmission = () => {
    localStorage.setItem("commentorName", nameInput);
    setCommentorName(nameInput);
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
        baseId: "appseIUI98pdLBT1K",
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
  // showing the current made comment in comment box
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
  await createRubaiComment([{ fields: commentData }]);
        {
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
            if (dataItemToUpdate?.fields?.comments !== undefined) {
              await updateRubai([{ id: dataId, fields: { comments: dataItemToUpdate.fields.comments } }]);
            }            // Invalidate comments cache so the next fetch includes the new comment
            invalidateAirtable("appseIUI98pdLBT1K", "comments");
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
    setSelectedCommentId(dataId);
    fetchComments(dataId);
    // setIsModleOpen(true);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
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
      {/* Toast handled globally by Sonner Toaster */}
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
                <RubaiCard
                  RubaiData={data}
                  index={index}
                  handleHeartClick={handleHeartClick}
                  openComments={openComments}
                  handleShareClick={handleShareClick}
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
