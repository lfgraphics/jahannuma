import React, { useEffect, useState } from "react";
import SkeletonLoader from "../../Components/SkeletonLoader";
import RubaiCard from "../../Components/RubaiCard";
import AOS from "aos";
import "aos/dist/aos.css";

const Rubai = ({ takhallus }) => {
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [dataItems, setDataItems] = useState([]); // Specify the type explicitly as Shaer[]
  const [loading, setLoading] = useState(true);

  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState("");
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  //snackbar
  const [toast, setToast] = useState(null);
  const [hideAnimation, setHideAnimation] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  //function ot show toast
  const showToast = (msgtype, message) => {
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE_ID = "appIewyeCIcAD4Y11";
      const TABLE_NAME = "rubai";

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({shaer}='${takhallus}')`;
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();

      const records = result.records || [];
      // Convert ghazal and ghazalHead fields to arrays
      setDataItems(records);
      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
    }
  };
  const handleNameChange = (event) => {
    setNameInput(event.target.value);
  };
  // handeling name save on the button click
  const handleNameSubmission = () => {
    localStorage.setItem("commentorName", nameInput);
    setCommentorName(nameInput);
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
      const BASE_ID = "appseIUI98pdLBT1K";
      const TABLE_NAME = "comments";
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
        const BASE_ID = "appseIUI98pdLBT1K";
        const TABLE_NAME = "comments";
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

          const dataItemToUpdate = updatedDataItems.find(
            (item) => item.id === dataId
          );

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
            const BASE_ID = "appIewyeCIcAD4Y11";
            const TABLE_NAME = "Rubai";
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
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (window !== undefined && window.localStorage) {
      const storedData = localStorage.getItem("Rubai");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          dataItems.forEach((shaerData, index) => {
            const shaerId = shaerData.id; // Get the id of the current shaerData

            // Check if the shaerId exists in the stored data
            const storedShaer = parsedData.find((data) => data.id === shaerId);

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

  const handleHeartClick = async (e, shaerData, index, id) => {
    if (typeof window !== undefined && window.localStorage && e.detail == 1) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Rubai");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData = existingDataJSON
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
          document.getElementById(`${id}`).classList.remove("text-gray-500");
          document.getElementById(`${id}`).classList.add("text-red-600");

          localStorage.setItem("Rubai", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
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
              `https://api.airtable.com/v0/appIewyeCIcAD4Y11/rubai`,
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
          document.getElementById(`${id}`).classList.remove("text-red-600");
          document.getElementById(`${id}`).classList.add("text-gray-500");

          localStorage.setItem("Rubai", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
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
              `https://api.airtable.com/v0/appIewyeCIcAD4Y11/rubai`,
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
  const openComments = (dataId) => {
    setSelectedCommentId(dataId);
    fetchComments(dataId);
  };
  //handeling sahre
  const handleShareClick = async (shaerData, index) => {
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
            `https://api.airtable.com/v0/appIewyeCIcAD4Y11/rubai`,
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

  return (
    <>
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
      {loading && <SkeletonLoader />}
      {!loading && (
        <section>
          <div
            id="section"
            dir="rtl"
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}
          >
            {dataItems.map((data, index) => (
              <div data-aos="fade-up">
                <RubaiCard
                  RubaiData={data}
                  index={index}
                  handleHeartClick={handleHeartClick}
                  openComments={openComments}
                  handleShareClick={handleShareClick}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      {/* //commetcard */}
      {selectedCommentId && (
        <button
          // style={{ overflow: "hidden" }}
          className=" fixed  bottom-[48svh] right-3 z-50 rounded-full  h-10 w-10 pt-2 "
          id="modlBtn"
          onClick={() => closeComments()}
        >
          <FontAwesomeIcon
            icon={faTimesCircle}
            className="text-gray-700 text-3xl hover:text-[#984A02] transition-all duration-500 ease-in-out"
          />
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
    </>
  );
};

export default Rubai;
