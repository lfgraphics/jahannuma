// @ts-nocheck
"use client";
import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { format } from "date-fns";
import CommentSection from "../../../Components/CommentSection";
import DataCard from "../../../Components/DataCard";
import AOS from "aos";
import "aos/dist/aos.css";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const SkeletonLoader = () => (
  <div className="flex flex-col items-center">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3">
      {[...Array(12)].map((_, index) => (
        <div
          key={index}
          role="status"
          className="flex items-center justify-center h-56 w-[350px] max-w-sm bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700"
        ></div>
      ))}
    </div>
  </div>
);
const Page = ({ params }) => {
  const encodedUnwan = params.unwan;
  const decodedUnwan = decodeURIComponent(encodedUnwan);
  const [selectedCommentId, setSelectedCommentId] = React.useState(null);
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [loading, setLoading] = useState(true);
  const [dataItems, setDataItems] = useState([]);
  const [openanaween, setOpenanaween] = useState(null);
  //comments
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  // hearts UI state
  const [disableHearts, setDisableHearts] = useState(false);
  const [likedMap, setLikedMap] = useState({});

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  // func to fetch and load more data
  const fetchData = async () => {
    try {
      const BASE_ID = "appvzkf6nX376pZy6";
      const TABLE_NAME = "Ghazlen";

      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=FIND('${decodedUnwan}', ARRAYJOIN({unwan}, ' '))`;
      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();
      const records = result.records || [];

      // formating result to match the mock data type for ease of development
      const formattedRecords = records.map((record) => ({
        ...record,
        fields: {
          ...record.fields,
          ghazal: record.fields?.ghazal.split("\n"),
          ghazalHead: record.fields?.ghazalHead.split("\n"),
          unwan: record.fields?.unwan.split("\n"),
        },
      }));

      setDataItems(formattedRecords);
      // init liked map from localStorage
      try {
        const existingDataJSON = localStorage.getItem("Ghazlen");
        const existingData = existingDataJSON ? JSON.parse(existingDataJSON) : [];
        const map = {};
        for (const item of formattedRecords) {
          map[item.id] = existingData.some((d) => d.id === item.id);
        }
        setLikedMap(map);
      } catch {}

      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
    }
  };

  // Fetch the initial set of records
  useEffect(() => {
    fetchData();
  }, []);
  // handeling liking, adding to localstorage and updating on the server
  const handleHeartClick = async (e, shaerData, index, id) => {
    toggleanaween(null);
    setDisableHearts(true);
    if (typeof window !== undefined && window.localStorage && e.detail === 1) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Ghazlen");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData = existingDataJSON ? JSON.parse(existingDataJSON) : [];

        // Check if the shaerData is already in the existing data
        const isDuplicate = existingData.some((data) => data.id === shaerData.id);

        if (!isDuplicate) {
          // Add the new shaerData to the existing data array
          existingData.push(shaerData);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(existingData);

          // reflect UI state
          setLikedMap((prev) => ({ ...prev, [id]: true }));

          localStorage.setItem("Ghazlen", updatedDataJSON);
          // show sonner success toast
          toast.success("آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔");
          try {
            // Make API request to update the record's "Likes" field
            const updatedLikes = shaerData.fields.likes + 1;
            const updateData = {
              records: [
                {
                  id: shaerData.id,
                  fields: {
                    likes: updatedLikes,
                  },
                },
              ],
            };

            const updateHeaders = {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
              "Content-Type": "application/json",
            };

            const updateResponse = await fetch(
              `https://api.airtable.com/v0/appvzkf6nX376pZy6/Ghazlen`,
              {
                method: "PATCH",
                headers: updateHeaders,
                body: JSON.stringify(updateData),
              }
            );

            if (updateResponse.ok) {
              // Update local state to reflect the change in likes
              setDataItems((prevDataItems) => {
                const updatedDataItems = [...prevDataItems];
                updatedDataItems[index].fields.likes = updatedLikes;
                return updatedDataItems;
              });
              setDisableHearts(false);
            } else {
              console.error(`Failed to update likes: ${updateResponse.status}`);
              setDisableHearts(false);
            }
          } catch (error) {
            console.error("Error updating likes:", error);
            setDisableHearts(false);
          }
        } else {
          // Remove the shaerData from the existing data array
          const updatedData = existingData.filter((data) => data.id !== shaerData.id);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(updatedData);

          // reflect UI state
          setLikedMap((prev) => ({ ...prev, [id]: false }));

          localStorage.setItem("Ghazlen", updatedDataJSON);

          // show sonner error/notice toast
          toast.error("آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔");
          try {
            // Make API request to update the record's "Likes" field
            const updatedLikes = shaerData.fields.likes - 1;
            const updateData = {
              records: [
                {
                  id: shaerData.id,
                  fields: {
                    likes: updatedLikes,
                  },
                },
              ],
            };

            const updateHeaders = {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
              "Content-Type": "application/json",
            };

            const updateResponse = await fetch(
              `https://api.airtable.com/v0/appvzkf6nX376pZy6/Ghazlen`,
              {
                method: "PATCH",
                headers: updateHeaders,
                body: JSON.stringify(updateData),
              }
            );

            if (updateResponse.ok) {
              // Update local state to reflect the change in likes
              setDataItems((prevDataItems) => {
                const updatedDataItems = [...prevDataItems];
                updatedDataItems[index].fields.likes = updatedLikes;
                return updatedDataItems;
              });
              setDisableHearts(false);
            } else {
              console.error(`Failed to update likes: ${updateResponse.status}`);
              setDisableHearts(false);
            }
          } catch (error) {
            console.error("Error updating likes:", error);
            setDisableHearts(false);
          }
        }
      } catch (error) {
        // Handle any errors that may occur when working with Local Storage
        console.error("Error adding/removing data to/from Local Storage:", error);
        setDisableHearts(false);
      }
    }
  };
  //handeling sahre
  const handleShareClick = async (shaerData, index) => {
    toggleanaween(null);
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.fields.shaer, // Use the shaer's name as the title
            text:
              shaerData.fields.ghazalHead.map((line) => line).join("\n") +
              `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `, // Join ghazalHead lines with line breaks
            url: `${window.location.href.split("/Ghazlen/")[0] + "/Ghazlen/" + shaerData.id}`, // Get the current page's URL
          })

          .then(() => console.info("Successful share"))
          .catch((error) => console.error("Error sharing", error));
        try {
          // Make API request to update the record's "Likes" field
          const updatedShares = shaerData.fields.shares + 1;
          const updateData = {
            records: [
              {
                id: shaerData.id,
                fields: {
                  shares: updatedShares,
                },
              },
            ],
          };

          const updateHeaders = {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
            "Content-Type": "application/json",
          };

          const updateResponse = await fetch(
            `https://api.airtable.com/v0/appvzkf6nX376pZy6/Ghazlen`,
            {
              method: "PATCH",
              headers: updateHeaders,
              body: JSON.stringify(updateData),
            }
          );

          if (updateResponse.ok) {
            // Update local state to reflect the change in likes
            setDataItems((prevDataItems) => {
              const updatedDataItems = [...prevDataItems];
              updatedDataItems[index].fields.shares = updatedShares;
              return updatedDataItems;
            });
          } else {
            console.error(`Failed to update shares: ${updateResponse.status}`);
          }
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
  //opening and closing ghazal
  const handleCardClick = (shaerData) => {
    toggleanaween(null);
    setSelectedCard({
      id: shaerData.id,
      fields: {
        shaer: shaerData.fields.shaer,
        ghazal: shaerData.fields.ghazal,
        id: shaerData.fields.id,
      },
    });

    // open modal instantly without GSAP
  };
  const handleCloseModal = () => {
    setSelectedCard(null);
  };
  // derive likedMap from localStorage on data changes 
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("Ghazlen");
      const parsed = storedData ? JSON.parse(storedData) : [];
      const map = {};
      for (const item of dataItems) {
        map[item.id] = parsed.some((d) => d.id === item.id);
      }
      setLikedMap(map);
    } catch {}
  }, [dataItems]);
  //toggling anaween box
  const toggleanaween = (cardId) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };
  const hideDialog = () => {
    setShowDialog(false);
  };
  const handleNameChange = (event) => {
    setNameInput(event.target.value);
  };
  const handleNameSubmission = () => {
    localStorage.setItem("commentorName", nameInput);
    setCommentorName(nameInput);
    hideDialog();
  };
  const fetchComments = async (dataId) => {
    const storedName = localStorage.getItem("commentorName");
    try {
      setCommentLoading(true);
      if (!commentorName && storedName === null) {
        setShowDialog(true);
      } else {
        setCommentorName(commentorName || storedName);
      }
      const BASE_ID = "appzB656cMxO0QotZ";
      const TABLE_NAME = "Comments";
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=dataId="${dataId}"`;
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { headers });
      const result = await response.json();

      const fetchedComments = result.records.map((record) => ({
        dataId: record.fields.dataId,
        commentorName: record.fields.commentorName,
        timestamp: record.fields.timestamp,
        comment: record.fields.comment,
      }));
      setCommentLoading(false);
      setComments(fetchedComments);
    } catch (error) {
      setCommentLoading(false);
      console.error(`Failed to fetch comments: ${error}`);
    }
  };
  const handleNewCommentChange = (comment) => {
    setNewComment(comment);
  };
  const handleCommentSubmit = async (dataId) => {
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
        const BASE_ID = "appzB656cMxO0QotZ";
        const TABLE_NAME = "Comments";
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
          "Content-Type": "application/json",
        };

        const timestamp = new Date().toISOString();
        const date = new Date(timestamp);

        const formattedDate = format(date, "MMMM dd, yyyy h:mm", {});

        const commentData = {
          dataId,
          commentorName,
          timestamp: formattedDate,
          comment: newComment,
        };

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ records: [{ fields: commentData }] }),
        });

        if (response.ok) {
          // Update the UI with the new comment
          setComments((prevComments) => [...prevComments, commentData]);

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

          const dataItemToUpdate = updatedDataItems.find((item) => item.id === dataId);

          if (!dataItemToUpdate?.fields.comments) {
            // If the comments field is not present, add it with the value 1
            dataItemToUpdate.fields.comments = 1;
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
            const BASE_ID = "appvzkf6nX376pZy6";
            const TABLE_NAME = "Ghazlen";
            const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${dataId}`;
            const headers = {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
              "Content-Type": "application/json",
            };

            const updateResponse = await fetch(url, {
              method: "PATCH",
              headers,
              body: JSON.stringify({
                fields: {
                  comments: dataItemToUpdate.fields.comments,
                },
              }),
            });

            if (updateResponse.ok) {
            } else {
              console.error(`Failed to update comments on the server: ${updateResponse.status}`);
            }
          } catch (error) {
            console.error("Error updating comments on the server:", error);
          }
        } else {
          console.error(`Failed to add comment: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error adding comment: ${error}`);
      }
    }
  };
  const openComments = (dataId) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    fetchComments(dataId);
    // setIsModleOpen(true);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
    setComments([]);
  };

  return (
    // Page root: dark background + light text; responsive layout preserved
    <div className="min-h-screen">
      {/* Name collection using shadcn Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
        <DialogContent className="max-w-[380px] w-full mx-auto">
          <div dir="rtl" className="p-6 rounded-md text-center">            <DialogHeader>
            <DialogTitle className="text-lg font-bold pb-3 border-b border-slate-700">
              براہ کرم اپنا نام درج کریں
            </DialogTitle>
          </DialogHeader>
            <p className="pt-2">
              ہم آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے استعمال کریں گے
            </p>
            <input
              type="text"
              id="nameInput"
              className="mt-4 p-2 border border-slate-700 w-full"
              value={nameInput}
              onChange={handleNameChange}
            />
            <div className="mt-4 flex justify-center">
              <button
                id="submitBtn"
                disabled={nameInput.length < 4}
                className="px-4 py-2 bg-[#984A02] disabled:bg-gray-500 rounded"
                onClick={handleNameSubmission}
              >
                محفوظ کریں
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-row w-full border-b border-slate-700 p-3 justify-center items-center">
        <div className="text-2xl sm:text-3xl md:text-4xl m-5">
          {`غزلیں بعنوان : ${decodedUnwan}`}
        </div>
      </div>

      {loading && <SkeletonLoader />}

      {!loading && (
        <section>
          <div
            id="section"
            dir="rtl"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3"
          >
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={shaerData.id || index}>
                <DataCard
                  page="ghazal"
                  download={false}
                  shaerData={shaerData}
                  index={index}
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleHeartClick={handleHeartClick}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
                  heartLiked={!!likedMap[shaerData.id]}
                  heartDisabled={disableHearts}
                  onHeartToggle={(e) => handleHeartClick(e, shaerData, index, `${shaerData.id}`)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selected card shown via shadcn Drawer */}
      <Drawer
        open={!!selectedCard}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DrawerContent className="p-0 bg-transparent shadow-none">
          {selectedCard && (
            <div
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
              className="opacity-100 fixed bottom-0 left-0 right-0 transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-auto z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0 border-slate-700"
            >
              <div className="p-4 pr-0 relative">
                <DrawerClose asChild>
                  <XCircle
                    id="modlBtn"
                    // onClick={handleCloseModal}
                    className="text-slate-200 sticky top-4 right-7 z-50 h-8 w-8 hover:text-[#984A02] transition-all duration-500 ease-in-out" />
                </DrawerClose>
                <h2 className=" text-2xl sm:text-3xl md:text-4xl text-center top-0 bg-slate-900 sticky pt-3 -mt-8 pb-3 border-b-2 border-slate-700 mb-3">
                  {selectedCard.fields.shaer}
                </h2>
                <div className="px-4 pb-8">
                  {selectedCard.fields.ghazal.map((line, idx) => (
                    <p
                      key={idx}
                      className="w-full  pb-3 pr-4 text-lg sm:text-xl md:text-2xl"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Comment section toggle */}
      {selectedCommentId && (
        <button
          className=" fixed bottom-24 left-7 z-50 rounded-full  h-10 w-10 pt-2 "
          id="modlBtn"
          onClick={() => closeComments()}
        >
          <XCircle className="text-slate-200 h-8 w-8 hover:text-[#984A02] transition-all duration-500 ease-in-out" />
        </button>
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
export default Page;
