"use client";
import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import ToastComponent from "../../../Components/Toast";
import CommentSection from "../../../Components/CommentSection";
import SkeletonLoader from "../../../Components/SkeletonLoader";
import DataCard from "../../../Components/DataCard";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";

interface Shaer {
  fields: {
    shaer: string;
    sher: string[];
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

const Ashaar = ({ params }: { params: { name: string } }) => {
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
  const [dataOffset, setDataOffset] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataItems, setDataItems] = useState<Shaer[]>([]);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  //comments
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  //snackbar
  const [toast, setToast] = useState<React.ReactNode | null>(null);
  const [hideAnimation, setHideAnimation] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

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
    // Clear the previous timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
      // showToast(msgtype, message);
    }
    setToast(
      <div className={`toast-container ${hideAnimation ? "hide" : ""}`}>
        <ToastComponent
          msgtype={msgtype}
          message={message}
          onHide={() => {
            setHideAnimation(true);
            setTimeout(() => {
              setHideAnimation(false);
              setToast(null);
            }, 500);
          }}
        />
      </div>
    );
    // Set a new timeout
    const newTimeoutId = setTimeout(() => {
      setHideAnimation(true);
      setTimeout(() => {
        setHideAnimation(false);
        setToast(null);
      }, 500);
    }, 6000);

    setTimeoutId(newTimeoutId);
  };

  //function ot scroll to the top
  function scrollToTop() {
    if (typeof window !== undefined) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
  // func to fetch and load more data
  const fetchData = async () => {
    try {
      const BASE_ID = "appeI2xzzyvUN5bR7";
      const TABLE_NAME = "Ashaar";
      const pageSize = 30;
      const headers = {
        //authentication with environment variable
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };
      //airtable fetch url and methods
      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({shaer}='${decodeURIComponent(
        params.name
      ).replace("_", " ")}')`;

      const response = await fetch(url, { method: "GET", headers });
      const result: ApiResponse = await response.json();
      const records = result.records || [];

      if (!result.offset && dataOffset == "") {
        // No more data, disable the button
        setLoading(false);
      }
      // formating result to match the mock data type for ease of development
      const formattedRecords = records.map((record: any) => ({
        ...record,
        fields: {
          ...record.fields,
          ghazal: record.fields?.body.split("\n"),
          ghazalHead: record.fields?.sher.split("\n"),
          unwan: record.fields?.unwan.split("\n"),
        },
      }));
      setDataItems(formattedRecords);
      setPagination({
        offset: result.offset,
        pageSize: pageSize,
      });
      // seting the loading state to false to show the data
      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
    }
  };
  // fetching more data by load more data button
  // Fetch the initial set of records
  useEffect(() => {
    fetchData();
  }, []);

  // handeling liking, adding to localstorage and updating on the server
  const handleHeartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: Shaer,
    index: any,
    id: string
  ): Promise<void> => {
    toggleanaween(null);
    if ((typeof window !== undefined && window.localStorage, e.detail == 1)) {
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
            "آپ کی پروفائل میں یہ شعر کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          console.log(
            "آپ کی پروفائل میں یہ شعر کامیابی کے ساتھ جوڑ دی گئی ہے۔ ."
          );
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
                const item = updatedDataItems[index];
                if (item && item.fields) {
                  item.fields.likes = updatedLikes;
                }
                return updatedDataItems;
              });
            } else {
              console.error(`Failed to update likes: ${updateResponse.status}`);
            }
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
            "آپ کی پروفائل سے یہ شعر کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          console.log("آپ کی پروفائل سے یہ شعر کامیابی کے ساتھ ہٹا دی گئی ہے۔");
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
                const item = updatedDataItems[index];
                if (item && item.fields) {
                  item.fields.likes = updatedLikes;
                }
                return updatedDataItems;
              });
            } else {
              console.error(`Failed to update likes: ${updateResponse.status}`);
            }
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
              const item = updatedDataItems[index];
              if (item && item.fields) {
                item.fields.shares = updatedShares;
              }
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
  //using gsap to animate ghazal opening and closing
  const animateModalOpen = (modalElement: gsap.TweenTarget) => {
    gsap.fromTo(
      modalElement,
      { y: "100vh" },
      { y: 0, duration: 0.2, ease: "power2.inOut" }
    );
  };
  const animateModalClose = (modalElement: gsap.TweenTarget) => {
    gsap.to(modalElement, { y: "100vh", duration: 0.5, ease: "power2.inOut" });
  };
  //opening and closing ghazal
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

    const modalElement = document.getElementById("modal"); // Add an ID to your modal
    if (modalElement) {
      animateModalOpen(modalElement);
      if (typeof window !== undefined) {
        document.getElementById("modlBtn")?.classList.remove("hidden");
      }
    }
  };
  const handleCloseModal = (): void => {
    if (typeof window !== undefined) {
      document.getElementById("modlBtn")?.classList.add("hidden");
    }
    // Animate modal close
    const modalElement = document.getElementById("modal");
    if (modalElement) {
      animateModalClose(modalElement);
    }
    setSelectedCard(null);
  };
  //checking while render, if the data is in the loacstorage then make it's heart red else leave it grey
  useEffect(() => {
    if (window !== undefined && window.localStorage) {
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
      const BASE_ID = "appzB656cMxO0QotZ";
      const TABLE_NAME = "Comments";
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=dataId="${dataId}"`;
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { headers });
      const result = await response.json();

      const fetchedComments = result.records.map(
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

          if (!dataItemToUpdate?.fields.comments) {
            // If the comments field is not present, add it with the value 1
            dataItemToUpdate!.fields.comments = 1;
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
                  comments: dataItemToUpdate!.fields.comments,
                },
              }),
            });

            if (updateResponse.ok) {
            } else {
              console.error(
                `Failed to update comments on the server: ${updateResponse.status}`
              );
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
  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    fetchComments(dataId);
    // setIsModleOpen(true);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
  };

  return (
    <div>
      <div
        className={`toast-container ${
          hideAnimation ? " hide " : ""
        } flex justify-center items-center absolute z-50 top-5 left-0 right-0 mx-auto`}
      >
        {toast}
      </div>
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
                ہم آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے
                استعمال کریں گے
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
      <div className="flex flex-row w-screen bg-white p-3 justify-center items-center top-14 z-10">
        {`${decodeURIComponent(params.name).replace("_", " ")} کے اشعار`}
      </div>
      {loading && <SkeletonLoader />}
      {!loading && (
        <section>
          <div
            id="section"
            dir="rtl"
            className={`
              grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3`}
          >
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up">
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
          </div>
        </section>
      )}
      {selectedCard && (
        <div
          onClick={handleCloseModal}
          id="modal"
          className="bg-black bg-opacity-50 backdrop-blur-[2px] h-[100vh] w-[100vw] fixed top-0 z-20 overflow-hidden pb-5"
        >
          <div
            dir="rtl"
            className="opacity-100 fixed bottom-0 left-0 right-0  bg-white transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0"
          >
            <div className="p-4 pr-0 relative">
              <button
                id="modlBtn"
                className="sticky top-4 right-7 z-50"
                onClick={handleCloseModal}
              >
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="text-gray-700 text-3xl hover:text-[#984A02] transition-all duration-500 ease-in-out"
                />
              </button>
              <h2 className="text-black text-4xl text-center top-0 bg-white sticky pt-3 -mt-8 pb-3 border-b-2 mb-3">
                {selectedCard.fields.shaer}
              </h2>
              {selectedCard.fields.ghazal.map((line, index) => (
                <p
                  key={index}
                  className="justif w-[320px] text-black pb-3 pr-4 text-2xl"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* //commetcard */}
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
