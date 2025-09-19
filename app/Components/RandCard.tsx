"use client";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import DataCard from "./DataCard";
import ToastComponent from "./Toast";

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

const RandCard: React.FC<{}> = () => {
  const [dataItems, setDataItems] = useState<Shaer[]>([]);
  const [randomData, setRandomData] = useState<number>(0);
  const [loading, setLoading] = useState(true); // New state for loading
  //comments
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
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

  const fetchData = async () => {
    try {
      const BASE_ID = "appeI2xzzyvUN5bR7";
      const TABLE_NAME = "Ashaar";

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();
      console.log("RandCard data:", result);

      const records = (await result.records) || [];

      const formattedRecords = records.map((record: any) => ({
        ...record,
        fields: {
          ...record.fields,
          ghazal: record.fields?.body.split("\n"),
          ghazalHead: record.fields?.sher.split("\n"),
          // unwan: record.fields?.unwan.split("\n"),
        },
      }));

      const randomRecord = await formattedRecords[
        Math.floor(Math.random() * formattedRecords.length)
      ];

      setDataItems(randomRecord);
      setLoading(false); // Set loading to false when fetching is done
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false); // Set loading to false when fetching is done
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    // Generate randomData only if dataItems is not empty
    if (dataItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * dataItems.length);
      setRandomData(randomIndex);
    }
  }, []);

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
  const [insideBrowser, setInsideBrowser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Code is running in a browser
      setInsideBrowser(true);
    } else {
      // Code is running on the server
      setInsideBrowser(false);
    }
  }, []);
  const [openanaween, setOpenanaween] = useState<string | null>(null);

  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  const visitSher = () => {
    // window.location.href = `/Ghazlen/${dataItems[randomData].fields.id}`;
  };
  const handleHeartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: Shaer,
    index: any,
    id: string
  ): Promise<void> => {
    toggleanaween(null);
    if (typeof window !== undefined && window.localStorage && e.detail == 1) {
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
          console.log(
            "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔ ."
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
              if (dataItems[0] && dataItems[0].fields) {
                dataItems[0].fields.likes = updatedLikes;
              }
              // setDataItems((prevDataItems) => {
              //   const updatedDataItems = [...prevDataItems];
              //   updatedDataItems[index].fields.likes = updatedLikes;

              //   // const updted = dataItems.lik;
              //   return updatedDataItems;
              // });
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
            "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          console.log("آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔");
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
              if (dataItems[0] && dataItems[0].fields) {
                dataItems[0].fields.likes = updatedLikes;
              }
              // setDataItems((prevDataItems) => {
              //   const updatedDataItems = [...prevDataItems];
              //   updatedDataItems[index].fields.likes = updatedLikes;
              //   return updatedDataItems;
              // });
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
    <div className="justify-center flex flex-col items-center m-4">
      <h4
        className="text-2xl my-4 text-gray-600 "
        // style={{ letterSpacing: "5px" }}
      >
        ایک منتخب شعر
      </h4>
      {loading && <Loader></Loader>} {/* Show loader while fetching */}
      {!loading && (
        <div className="relative">
          {/* <div className="bg-white absolute left-0 top-0 bg-opacity-10 w-screen h-[300px] z-auto"></div> */}
          <img
            src="https://jahan-numa.org/carousel/jnd.jpeg"
            className="object-cover bg-center absolute top-0 left-0 w-screen opacity-[0.07] rounded-lg overflow-clip scale-x-125 scale-y-110 translate-y-3 select-none z-0 touch-none h-[220px]"
            draggable="false"
          />
          <DataCard
            page="rand"
            download={true}
            key={4}
            shaerData={dataItems}
            index={0}
            handleCardClick={visitSher}
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleHeartClick={handleHeartClick}
            handleShareClick={handleShareClick}
            openComments={openComments}
          />
        </div>
      )}
    </div>
  );
};

export default RandCard;
