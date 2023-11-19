"use client";
import React, { useEffect, useState } from "react";
// import * as data from "./data";
// import { filterDataBySearch } from "./data"; // Adjust the import path accordingly

import gsap from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faShare, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Search } from "react-feather";
import Image from "next/image";
import Link from "next/link";

interface Shaer {
  fields: {
    ghazal: string[];
    ghazalHead: string[];
    shaer: string;
  };
  id: string;
  createdTime: string;
}
interface Pagination {
  offset: string | null;
  pageSize: number;
}

const Ashaar: React.FC<{}> = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedCard, setSelectedCard] = useState<Shaer | null>(null);

  const [dataItems, setDataItems] = useState<Shaer[]>([]); // Specify the type explicitly as Shaer[]

  const [pagination, setPagination] = useState<Pagination>({
    offset: null,
    pageSize: 15, // Set the page size to 15
  });
  const fetchData = async (direction: "next" | "previous") => {
    try {
      const API_KEY =
        "patpWvd49NVJhHOVr.73ebeea33c6733900c098b73f0d71a60114061896d4051a451e7e24d59351cef";
      const BASE_ID = "appvzkf6nX376pZy6";
      const TABLE_NAME = "ghazlen";
      const { offset, pageSize } = pagination;

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?pageSize=${pageSize}`;
      if (direction === "next" && offset) {
        url += `&offset=${offset}`;
      } else if (direction === "previous" && offset) {
        url += `&offset=${offset}&direction=back`;
      }
      const headers = {
        Authorization: `Bearer ${API_KEY}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();

      const records = result.records || [];
      if (records.length > 0) {
        setPagination({ offset: result.offset, pageSize });
      }
      // Convert ghazal and ghazalHead fields to arrays
      const formattedRecords = records.map(
        (record: { fields: { ghazal: string; ghazalHead: string } }) => ({
          ...record,
          fields: {
            ...record.fields,
            ghazal: record.fields.ghazal.split("\n"),
            ghazalHead: record.fields.ghazalHead.split("\n"),
          },
        })
      );

      setDataItems(formattedRecords);

      // console.log(filteredRecord)
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
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

        localStorage.setItem("Ashaar", updatedDataJSON);

        // Optionally, you can update the UI or show a success message
        console.log("Data removed from Local Storage successfully.");
      }
    } catch (error) {
      // Handle any errors that may occur when working with Local Storage
      console.error("Error adding/removing data to/from Local Storage:", error);
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
    setSelectedCard(shaerData);

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



  return (
    <div>
      <div className="flex flex-row w-screen bg-white border-b-2 p-3 justify-between items-center sticky top-14 z-10">
        <div className="filter-btn flex-[90%] text-center justify-center flex">
          <div dir="rtl" className="flex justify-center basis-[95%] h-auto">
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
        dir="rtl"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
      >
        {dataItems.map((shaerData, index) => {
          if (isShaerMatch(shaerData)) {
            return (
              <div
                key={index}
                id={`card${index}`}
                className="bg-white p-4 rounded-sm border-b relative flex flex-col justify-between"
              >
                <Link
                  href={`/Shaer/${shaerData.fields.shaer.replace(" ", "-")}`}
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
                <div className="felx text-center icons">
                  <button
                    className={`m-3 text-gray-500 transition-all duration-500`}
                    onClick={() =>
                      handleHeartClick(shaerData, index, `${shaerData.id}`)
                    }
                    id={`${shaerData.id}`}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                  <button
                    className="m-3"
                    onClick={() => handleShareClick(shaerData, `card${index}`)}
                  >
                    <FontAwesomeIcon
                      icon={faShare}
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
              !pagination.offset || dataItems.length < pagination.pageSize
            }
            className="bg-white text-[#984A02] border active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
          >
            Next Page
          </button>
        </div>
      </div>

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
  );
};

export default Ashaar;
