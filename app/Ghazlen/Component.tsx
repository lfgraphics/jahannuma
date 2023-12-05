"use client";
import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentAlt,
  faHeart,
  faShareNodes,
  faTag,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Search } from "react-feather";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { format, formatDistanceToNow } from "date-fns";
import ToastComponent from "../Components/Toast";

interface Shaer {
  fields: {
    shaer: string;
    ghazalHead: string[];
    ghazal: string[];
    unwan: string[];
    listenable: boolean;
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
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [moreloading, setMoreLoading] = useState(true);
  const [dataItems, setDataItems] = useState<Shaer[]>([]);
  const [noMoreData, setNoMoreData] = useState(false);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  //comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
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
  //AOS initialization
  useEffect(() => {
    AOS.init({
      offset: 75, // offset (in px) from the original trigger point
      delay: 0, // values from 0 to 3000, with step 50ms
      duration: 500,
    });
  });
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
  const fetchData = async (offset: string | null) => {
    try {
      const BASE_ID = "appvzkf6nX376pZy6";
      const TABLE_NAME = "Ghazlen";
      const pageSize = 30;
      const headers = {
        //authentication with environment variable
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };
      //airtable fetch url and methods
      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?pageSize=${pageSize}`;
      if (offset) {
        url += `&offset=${offset}`;
      }
      const response = await fetch(url, { method: "GET", headers });
      const result: ApiResponse = await response.json();
      const records = result.records || [];

      if (!result.offset) {
        // No more data, disable the button
        setNoMoreData(true);
        setLoading(false);
        setMoreLoading(false);
      }
      // formating result to match the mock data type for ease of development
      const formattedRecords = records.map((record: any) => ({
        ...record,
        fields: {
          ...record.fields,
          ghazal: record.fields?.ghazal.split("\n"),
          ghazalHead: record.fields?.ghazalHead.split("\n"),
          unwan: record.fields?.unwan.split("\n"),
        },
      }));
      // seting the data in variable and updating the variable by checking if it's fetched first or not
      !offset
        ? setDataItems(formattedRecords)
        : setDataItems((prevDataItems) => [
            ...prevDataItems,
            ...formattedRecords,
          ]);
      !offset ? scrollToTop() : null;
      // seting pagination depending on the response
      setPagination({
        offset: result.offset,
        pageSize: pageSize,
      });
      // seting the loading state to false to show the data
      setLoading(false);
      setMoreLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
      setMoreLoading(false);
    }
  };
  // fetching more data by load more data button
  const handleLoadMore = () => {
    setMoreLoading(true);
    fetchData(pagination.offset);
  };
  // Fetch the initial set of records
  useEffect(() => {
    fetchData(null);
  }, []);
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

    input.value = "";
    xMark?.classList.add("hidden");
    sMark?.classList.add("hidden");

    // Clear the searched data and show all data again
    setSearchText(""); // Clear the searchText state
    // setDataItems(data.getAllShaers()); // Restore the original data
  };

  // a part of search match
  // const isShaerMatch = (shaerData: Shaer) => {
  //   return (
  //     shaerData?.fields?.shaer?.toLowerCase().includes(searchText) ||
  //     shaerData?.fields?.ghazalHead?.some((line) =>
  //       line.toLowerCase().includes(searchText)
  //     ) ||
  //     shaerData?.fields?.ghazal?.some((line) =>
  //       line.toLowerCase().includes(searchText)
  //     )
  //   );
  // };

  // handeling liking, adding to localstorage and updating on the server
  const handleHeartClick = async (
    shaerData: Shaer,
    index: any,
    id: string
  ): Promise<void> => {
    toggleanaween(null);
    if (typeof window !== undefined && window.localStorage) {
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
          showToast("success", "Data added to Local Storage successfully");
          console.log("Data added to Local Storage successfully.");
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
          showToast("invalid", "Data removed from Local Storage successfully.");
          console.log("Data removed from Local Storage successfully.");
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
  };
  //checking while render, if the data is in the loacstorage then make it's heart red else leave it grey
  useEffect(() => {
    if (window !== undefined && window.localStorage) {
      const storedData = localStorage.getItem("Ghazlen");
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
  
  const fetchComments = async (dataId: string) => {
    const storedName = localStorage.getItem("commentorName");
    try {
      setCommentLoading(true);
      if (!commentorName && storedName === null) {
        // Prompt the user for their name
        const name = prompt(
          `براہ کرم اپنا نام درج کریں\nہم ےہ نام صرف آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سع دکھانے کے لیے کریں ے`
        );

        if (name !== null) {
          // Save the name to localStorage first
          localStorage.setItem("commentorName", name);

          // Then set the state
          setCommentorName(name);
        } else if (name === null) {
          alert(
            "آپ کا نام آپ کے آلے میں ہی محفوظ رہے گا، ہم اسکا استعمال نہیں کریں گے"
          );
          return;
        }
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
  const handleCommentSubmit = async (dataId: string) => {
    // Check if the user has provided a name
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("commentorName");

      if (!commentorName && storedName === null) {
        // Prompt the user for their name
        const name = prompt(
          `براہ کرم اپنا نام درج کریں\nہم ےہ نام صرف آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سع دکھانے کے لیے کریں ے`
        );

        if (name !== null) {
          // Save the name to localStorage first
          localStorage.setItem("commentorName", name);

          // Then set the state
          setCommentorName(name);
        } else if (name === null) {
          alert(
            "آپ کا نام آپ کے آلے میں ہی محفوظ رہے گا، ہم اسکا استعمال نہیں کریں گے"
          );
          return;
        }
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
    // setIsModleOpen(false);
    setSelectedCommentId(null);
  };

  return (
    <div>
      <div>
        <div>
          <div
            className={`toast-container ${
              hideAnimation ? " hide " : ""
            } flex justify-center items-center absolute z-50 top-5 left-0 right-0 mx-auto`}
          >
            {toast}
          </div>
          <div className="flex flex-row w-screen bg-white border-b-2 p-3 justify-between items-center sticky top-14 z-10">
            <div className="filter-btn flex-[90%] text-center justify-center flex">
              <div
                dir="rtl"
                className="flex justify-center basis-[95%] h-auto pt-2"
              >
                <input
                  type="text"
                  placeholder="لکه ک تلاش کرین"
                  className="text-black border border-black focus:outline-none focus:border-l-0 border-l-0 p-2 w-64 leading-7"
                  id="searchBox"
                  onKeyUp={handleSearchKeyUp}
                />
                <div
                  className="justify-center bg-white h-[100%] items-center flex w-11 border border-r-0 border-l-0 border-black"
                  onClick={clearSearch}
                >
                  <Image
                    id="searchClear"
                    src="/icons/x.svg"
                    alt="x icon"
                    width="20"
                    height="20"
                    className="hidden text-[#984A02]"
                  ></Image>
                </div>
                <div className="justify-center bg-white h-[100%] items-center flex w-11 border-t border-b border-l border-black">
                  <Search id="searchIcon" className="hidden"></Search>
                </div>
              </div>
            </div>
          </div>
          {loading && <SkeletonLoader />}
          {!loading && (
            <section>
              <div
                //   ${isModleOpen ? "pointer-events-none " : "pointer-events-auto "}
                dir="rtl"
                className={`
              grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3`}
              >
                {dataItems.map((shaerData, index) => {
                  // if (isShaerMatch(shaerData)) {
                  return (
                    <div
                      data-aos={"fade-up"}
                      key={index}
                      id={`card${index}`}
                      className="bg-white p-4 rounded-sm border-b relative flex flex-col justify-between"
                    >
                      <Link
                        href={`/Shaer/${shaerData.fields.shaer.replace(
                          " ",
                          "-"
                        )}`}
                      >
                        <h2 className="text-black text-3xl mb-4">
                          {shaerData.fields.shaer}
                        </h2>
                      </Link>
                      {/* Display a snippet of the ghazal data here */}
                      {shaerData.fields.ghazalHead.map((lin, index) => (
                        <p
                          style={{ lineHeight: "normal" }}
                          key={index}
                          className="text-black line-normal text-xl"
                          onClick={() => handleCardClick(shaerData)}
                        >
                          {lin}
                        </p>
                      ))}

                      <div className="relative">
                        <div
                          className="anaween-container flex flex-col items-center  absolute translate-y-[-7rem] overflow-y-scroll w-[90px] bg-white shadow-md transition-all duration-500 ease-in-out"
                          style={{
                            height:
                              openanaween === `card${index}` ? "120px" : "0",
                          }}
                        >
                          {shaerData.fields.unwan?.map((unwaan, index) => (
                            <span
                              key={index}
                              className="text-md text-[#984A02] p-2"
                            >
                              {unwaan}
                            </span>
                          ))}
                        </div>
                        <button
                          className="text-[#984A02] mt-2 justify-start flex items-end flex-row-reverse "
                          onClick={() => toggleanaween(`card${index}`)}
                        >
                          موضوعات: {shaerData.fields.unwan?.[0]}
                          {shaerData.fields.unwan?.length > 1
                            ? " ، " +
                              (shaerData.fields.unwan?.length - 1) +
                              " اور "
                            : ""}
                          <span>
                            <FontAwesomeIcon
                              icon={faTag}
                              className="ml-2 text-yellow-400"
                            />
                          </span>
                        </button>
                      </div>

                      <div className="felx text-center icons">
                        <button
                          className={`m-3 text-gray-500 transition-all duration-500`}
                          onClick={() =>
                            handleHeartClick(
                              shaerData,
                              index,
                              `${shaerData.id}`
                            )
                          }
                          id={`${shaerData.id}`}
                        >
                          <FontAwesomeIcon icon={faHeart} />{" "}
                          <span className="text-gray-500 text-sm">
                            {shaerData.fields.likes}
                          </span>
                        </button>
                        <button
                          className="m-3"
                          onClick={() => openComments(shaerData.id)}
                        >
                          <FontAwesomeIcon
                            icon={faCommentAlt}
                            style={{ color: "#984A02" }}
                            className="ml-2"
                          />{" "}
                          <span className="text-gray-500 text-sm">
                            {shaerData.fields.comments}
                          </span>
                        </button>
                        <button
                          className="m-3"
                          onClick={() => handleShareClick(shaerData, index)}
                        >
                          <FontAwesomeIcon
                            icon={faShareNodes}
                            style={{ color: "#984A02" }}
                          />{" "}
                          <span className="text-gray-500 text-sm">
                            {shaerData.fields.shares}
                          </span>
                        </button>
                        <button
                          className="text-[#984A02] font-semibold m-3"
                          onClick={() => handleCardClick(shaerData)}
                        >
                          غزل پڑھیں
                        </button>
                      </div>
                    </div>
                  );
                  // } else {
                  //   return null; // Skip rendering this Shaer
                  // }
                })}
              </div>
              <div className="flex justify-center text-lg m-5">
                <button
                  onClick={handleLoadMore}
                  disabled={noMoreData}
                  className="text-[#984A02] disabled:text-gray-500 cursor-pointer"
                >
                  {moreloading
                    ? "Loading..."
                    : noMoreData
                    ? "No More Data"
                    : "Load More"}
                </button>
              </div>
            </section>
          )}
          {selectedCard && (
            <button
              style={{ overflow: "hidden" }}
              id="modlBtn"
              className="transition-all duration-500 ease-in-out fixed bottom-12 left-7 z-50 rounded-full border h-10 w-10 pt-2 hover:bg-[#984A02] hover:text-white"
              onClick={handleCloseModal}
            >
              <FontAwesomeIcon
                icon={faTimes}
                className="text-[#984A02] text-2xl hover:text-white"
              />
            </button>
          )}
          {selectedCard && (
            // <div className="justify-center w-max h-max">
            <div
              onClick={handleCloseModal}
              id="modal"
              className="bg-black bg-opacity-50 backdrop-blur-[2px] h-[100vh] w-[100vw] fixed top-0 z-20 overflow-hidden pb-5"
            >
              <div
                dir="rtl"
                className="opacity-100 fixed bottom-0 left-0 right-0  bg-white transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0"
              >
                <div className="p-4">
                  <h2 className="text-black text-4xl top-0 bg-white sticky p-3 border-b-2 mb-3">
                    {selectedCard.fields.shaer}
                  </h2>
                  {selectedCard.fields.ghazal.map((line, index) => (
                    <p key={index} className="text-black pb-3 text-2xl">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* //commetcard */}
          {selectedCommentId && (
            <button
              style={{ overflow: "hidden" }}
              id="modlBtn"
              className="transition-all duration-500 ease-in-out fixed bottom-16 left-7 z-50 rounded-full border h-10 w-10 pt-2 hover:bg-[#984A02] hover:text-white"
              onClick={() => closeComments()}
            >
              <FontAwesomeIcon
                icon={faTimes}
                className="text-[#984A02] text-2xl hover:text-white"
              />
            </button>
          )}
          {selectedCommentId && (
            <div
              dir="rtl"
              className="sticky w-screen bottom-0 z-10 shadow-lg min-h-[60svh] max-h-[70svh] overflow-y-scroll border-spacing-1 border-t-4 mt-4 pb-7 p-4 bg-white text-lg"
              style={{ borderTop: "6px groove" }}
            >
              {commentLoading && (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-t-4 border-[#984A02] m-3 rounded-full animate-spin"></div>
                  <div className="ml-2 text-lg text-[#984A02]">Loading</div>
                </div>
              )}

              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="mb-8"
                  onClick={() => closeComments()}
                >
                  <div className="flex items-center justify-start gap-3 m-3">
                    <span className="font-semibold">
                      {comment.commentorName}
                    </span>
                    <span className="text-gray-500 text-md">
                      {formatDistanceToNow(new Date(comment.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p>{comment.comment}</p>
                  <div className="border-b my-2"></div>
                </div>
              ))}

              <div className="fixed justify-around bottom-0 pb-3 bg-white text-black flex w-[100vw] px-5">
                <input
                  type="text"
                  placeholder="آپکا تبصرہ۔۔۔"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-[70%] border-b-2 p-2 focus:outline-none text-right"
                />
                <button
                  //newComment !== "" &&
                  disabled={newComment.length < 4}
                  onClick={async () => handleCommentSubmit(selectedCommentId)}
                  className="bg-[#984A02] text-white p-2 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  تبصرہ کریں
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ashaar;