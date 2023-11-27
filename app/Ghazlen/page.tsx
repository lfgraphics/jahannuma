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
import Loader from "../Components/Loader";
import AOS from "aos";
import "aos/dist/aos.css";
import CommentSection from "../Components/CommentSection";

interface Shaer {
  fields: {
    ghazal: string[];
    ghazalHead: string[];
    shaer: string;
    unwan: string[];
    id: string;
  };
  id: string;
  createdTime: string;
}
interface ApiResponse {
  records: any[]; // Replace 'any[]' with the actual type of your records
  offset: string | null; // Adjust the type based on what your API returns for offset
}
interface Pagination {
  offset: string | null;
  pageSize: number;
}
type Offsets = {
  previous: string | null;
  next: string | null;
};

const SkeletonLoader = () => (
  <div className="flex flex-col items-center">
    <div className="w-80 h-12 bg-gray-300 mb-8 rounded-md mt-4"></div>{" "}
    {/* Search Bar Skeleton */}
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
  const [searchText, setSearchText] = useState("");
  const [commentCard, setCommentCard] = React.useState<{ id: string } | null>(
    null
  );

  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);

  const [selectedCard, setSelectedCard] = React.useState<{
    id: string;
    fields: { shaer: string; ghazal: string[]; id: string };
  } | null>(null);

  const [loading, setLoading] = useState(true); // New state for loading

  const [dataItems, setDataItems] = useState<Shaer[]>([]); // Specify the type explicitly as Shaer[]

  const [pagination, setPagination] = useState<Pagination>({
    offset: null,
    pageSize: 100,
  });
  const openComments = (dataId: string) => {
    // Toggle the selectedCard state to show/hide the comment section
    setCommentCard((prevSelectedCard) =>
      prevSelectedCard && prevSelectedCard.id === dataId ? null : { id: dataId }
    );
  };
  const closeComments = () => {
    setCommentCard(null);
  };

  useEffect(() => {
    AOS.init({
      offset: 200, // offset (in px) from the original trigger point
      delay: 0, // values from 0 to 3000, with step 50ms
      duration: 500,
    });
  });
  function scrollToTop() {
    if (typeof window !== undefined) {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Optional: adds smooth scrolling effect
      });
    }
  }

  let offsets: Offsets = {
    previous: null,
    next: null,
  };

  const fetchData = async (direction: "next" | "previous") => {
    try {
      const BASE_ID = "appvzkf6nX376pZy6";
      const TABLE_NAME = "Ghazlen";
      const { offset, pageSize } = pagination;

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?pageSize=${pageSize}`;
      if (direction === "next" && offset) {
        url += `&offset=${offset}`;
      } else if (direction === "previous" && offset) {
        url += `&offset=${offset}&direction=back`;
      }
      console.log(offset);
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result: ApiResponse = await response.json();
      offsets = {
        previous: direction === "next" ? offsets.next : result.offset,
        next: direction === "next" ? result.offset : offsets.previous,
      };
      console.log(result);
      const records = result.records || [];
      if (records.length > 0) {
        setPagination({ offset: result.offset, pageSize });
      }
      // Convert ghazal and ghazalHead fields to arrays
      const formattedRecords = records.map(
        (record: {
          fields: {
            ghazal: string;
            ghazalHead: string;
            shaer: string;
            unwan: string;
            id: string;
          };
        }) => ({
          ...record,
          fields: {
            ...record.fields,
            ghazal: record.fields.ghazal.split("\n"),
            ghazalHead: record.fields.ghazalHead.split("\n"),
            unwan: record.fields.unwan.split("\n"),
          },
        })
      );

      setDataItems(formattedRecords);
      scrollToTop();
      setLoading(false);
      // console.log(filteredRecord)
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData("next");
  }, []); // Fetch data only once when the component mounts

  // Function to handle search input change
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

  // Function to clear the search input
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

  // Function to check if a Shaer matches the selected filter and search text
  const isShaerMatch = (shaerData: Shaer) => {
    return (
      shaerData.fields.shaer.toLowerCase().includes(searchText) ||
      shaerData.fields.ghazalHead.some((line) =>
        line.toLowerCase().includes(searchText)
      ) ||
      shaerData.fields.ghazal.some((line) =>
        line.toLowerCase().includes(searchText)
      )
    );
  };

  const handleHeartClick = (shaerData: Shaer, index: any, id: string): void => {
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
          console.log("Data added to Local Storage successfully.");
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
          console.log("Data removed from Local Storage successfully.");
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

  const handleShareClick = (shaerData: Shaer, id: String): void => {
    // console.log(shaerData.ghazalHead);
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

          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        console.log("Web Share API is not supported.");
      }
    } catch (error) {
      // Handle any errors that may occur when using the Web Share API
      console.error("Error sharing:", error);
    }
  };

  // Function to animate modal opening
  const animateModalOpen = (modalElement: gsap.TweenTarget) => {
    gsap.fromTo(
      modalElement,
      { y: "100vh" },
      { y: 0, duration: 0.2, ease: "power2.inOut" }
    );
  };

  // Function to animate modal closing
  const animateModalClose = (modalElement: gsap.TweenTarget) => {
    gsap.to(modalElement, { y: "100vh", duration: 0.5, ease: "power2.inOut" });
  };

  const handleCardClick = (shaerData: Shaer): void => {
    setSelectedCard({
      id: shaerData.id,
      fields: {
        shaer: shaerData.fields.shaer,
        ghazal: shaerData.fields.ghazal,
        id: shaerData.fields.id,
      },
    });

    // Animate modal open
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

  const [openanaween, setOpenanaween] = useState<string | null>(null);

  const toggleanaween = (cardId: string) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div>
      {loading && <SkeletonLoader />}
      {!loading && (
        <div>
          <div>
            <div className="flex flex-row w-screen bg-white border-b-2 p-3 justify-between items-center sticky top-14 z-10">
              <div className="filter-btn flex-[90%] text-center justify-center flex">
                <div
                  dir="rtl"
                  className="flex justify-center basis-[95%] h-auto"
                >
                  <input
                    type="text"
                    placeholder="لکه ک تلاش کرین"
                    className="text-black border border-black focus:outline-none focus:border-l-0 border-l-0 p-2 w-64 leading-7"
                    id="searchBox"
                    onKeyUp={handleSearchKeyUp}
                  />
                  <div className="justify-center bg-white h-[100%] items-center flex w-11 border-t border-b border-black">
                    <Search id="searchIcon" className="hidden"></Search>
                  </div>
                  <div
                    className="justify-center bg-white h-[100%] items-center flex w-11 border border-r-0 border-black"
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
                </div>
              </div>
            </div>
            <div
              // onClick={() => closeComments()}
              dir="rtl"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
            >
              {dataItems.map((shaerData, index) => {
                if (isShaerMatch(shaerData)) {
                  return (
                    <div
                      data-aos={`${
                        index % 2 == 0 ? "fade-right" : "fade-left"
                      }`}
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
                          {shaerData.fields.unwan.length > 1
                            ? " ، " +
                              (shaerData.fields.unwan.length - 1) +
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
                          <FontAwesomeIcon icon={faHeart} />
                        </button>
                        <button
                          className="text-[#984A02] font-semibold m-3"
                          onClick={() => openComments(shaerData.id)}
                        >
                          <FontAwesomeIcon
                            icon={faCommentAlt}
                            className="ml-2"
                          />
                        </button>
                        <button
                          className="m-3"
                          onClick={() =>
                            handleShareClick(shaerData, `card${index}`)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faShareNodes}
                            style={{ color: "#984A02" }}
                          />
                        </button>
                        <button
                          className="text-[#984A02] font-semibold m-3"
                          onClick={() => handleCardClick(shaerData)}
                        >
                          غزل دیکهین
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  return null; // Skip rendering this Shaer
                }
              })}
            </div>
            {pagination.offset && (
              <div dir="ltr" className="w-[300px] block mx-auto">
                <div className="flex justify-between m-4">
                  <button
                    onClick={() => fetchData("previous")}
                    disabled={!pagination.offset}
                    className="bg-white text-[#984A02] border active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
                  >
                    Previous Page
                  </button>
                  <button
                    onClick={() => fetchData("next")}
                    disabled={
                      !pagination.offset ||
                      dataItems.length < pagination.pageSize
                    }
                    className="bg-white text-[#984A02] border active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
                  >
                    Next Page
                  </button>
                </div>
              </div>
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

            {commentCard && (
              <div
                className="button text-white bg-[#984A02] w-20 text-right p-5 pb-4 text-4xl fixed rounded-lg bottom-16 -left-2 z-50"
                onClick={() => closeComments()}
              >
                <button className="text-white">X</button>
              </div>
            )}
            {commentCard && commentCard.id && (
              <CommentSection dataId={selectedCommentId || commentCard.id} />
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
                  className="opacity-100 fixed bottom-0 left-0 right-0 bg-white transition-all ease-in-out min-h-[75svh] max-h-[80svh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Ashaar;
