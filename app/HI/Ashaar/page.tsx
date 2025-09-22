"use client";
import React, { useEffect, useState } from "react";
import * as data from "./data";
import { filterDataBySearch } from "./data"; // Adjust the import path accordingly

import { Download, Heart, Share2, X } from "lucide-react";
import html2canvas from "html2canvas";
// import { Filter } from "react-feather";
import Image from "next/image";

interface Shaer {
  shaer: string;
  sherHead: string[];
  wholeSher: string[];
  tag: string[];
}

const Ashaar: React.FC<{}> = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [dataItems, setDataItems] = useState<Shaer[]>([]); // Specify the type explicitly as Shaer[]

  useEffect(() => {
    // This effect runs when the component mounts
    const shuffledData = shuffleArray(data.getAllShaers());
    setDataItems(shuffledData);
  }, []);

  function shuffleArray(array: Shaer[]) {
    // Shuffle the array as before
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j]!;
      array[j] = temp!;
    }
    return array;
  }

  // Fetch the data and assign it to the 'data' prop

  const [selectedCard, setSelectedCard] = useState<Shaer | null>(null);

  // Get all unique tags from the data
  const allTags = data.getAllUniqueTags();

  // Function to handle search input change
  const handleSearchKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.toLowerCase();
    let xMark = document.getElementById("searchClear");
    value === ""
      ? xMark?.classList.add("hidden")
      : xMark?.classList.remove("hidden");
    setSearchText(value);

    // Call the filterDataBySearch function to filter the data
    const filteredData = filterDataBySearch(value);
    setDataItems(filteredData);
  };

  // Function to clear the search input
  const clearSearch = () => {
    let input = document.getElementById("searchBox") as HTMLInputElement;
    let xMark = document.getElementById("searchClear");
    input.value = "";
    xMark?.classList.add("hidden");

    // Clear the searched data and show all data again
    setSearchText(""); // Clear the searchText state
    setDataItems(data.getAllShaers()); // Restore the original data
  };

  // Function to check if a Shaer matches the selected filter and search text
  const isShaerMatch = (shaerData: Shaer) => {
    return (
      (selectedFilter === "" || shaerData.tag.includes(selectedFilter)) &&
      (shaerData.shaer.toLowerCase().includes(searchText) ||
        shaerData.sherHead.some((line) =>
          line.toLowerCase().includes(searchText)
        ) ||
        shaerData.wholeSher.some((line) =>
          line.toLowerCase().includes(searchText)
        ) ||
        shaerData.tag.some((tag) => tag.toLowerCase().includes(searchText)))
    );
  };

  const handleHeartClick = (shaerData: Shaer, index: any, id: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Ashaar");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: Shaer[] = existingDataJSON
          ? JSON.parse(existingDataJSON)
          : [];

        // Check if the shaerData is already in the existing data
        const isDuplicate = existingData.some(
          (data) => data.shaer === shaerData.shaer
        );

        if (!isDuplicate) {
          // Add the new shaerData to the existing data array
          existingData.push(shaerData);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(existingData);

          // Toggle the color between "#984A02" and "grey" based on the current color
          document.getElementById(`${id}`)!.classList.remove("text-gray-500");
          document.getElementById(`${id}`)!.classList.add("text-red-600");
          // document.getElementById(`${id}`)!.style.color = "#984A02";

          localStorage.setItem("Ashaar", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          console.log("Data added to Local Storage successfully.");
        } else {
          // Remove the shaerData from the existing data array
          const updatedData = existingData.filter(
            (data) => data.shaer !== shaerData.shaer
          );

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(updatedData);

          // Store the updated data in Local Storage

          document.getElementById(`${id}`)!.classList.remove("text-red-600");
          document.getElementById(`${id}`)!.classList.add("text-gray-500");

          localStorage.setItem("Ashaar", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          document.getElementById(`${id}`)?.classList.remove("text-red-600");
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
    // console.log(shaerData.sherHead);
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.shaer, // Use the shaer's name as the title
            text:
              shaerData.sherHead.map((line) => line).join("\n") +
              `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `, // Join sherHead lines with line breaks
            url: window.location.href, // Get the current page's URL
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

  const handleCardClick = (shaerData: Shaer): void => {
    setSelectedCard(shaerData);
  };

  const handleCloseModal = (): void => {
    setSelectedCard(null);
  };

  const handleDownload = (elementId: string) => {
    console.log("download is clicked");
    document.querySelectorAll(".icons").forEach(function (icon) {
      icon.classList.add("hidden");
    });

    const element = document.getElementById(elementId);
    if (element) {
      html2canvas(element).then(function (canvas) {
        var anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        anchorTag.download = `${prompt("Enter file name to save")}.png`;
        anchorTag.href = canvas.toDataURL();
        anchorTag.target = "_blank";
        anchorTag.click();
        document.querySelectorAll(".icons").forEach(function (icon) {
          icon.classList.remove("hidden");
        });
      });
    }
    document.querySelectorAll(".icons").forEach(function (icon) {
      icon.classList.remove("hidden");
    });
  };
  const toggleFilter = () => {
    document.getElementById("filtersListBox")?.classList.toggle("max-h-0");
  };

  const filterData = (tag: string) => {
    setSelectedFilter(tag);
  };

  useEffect(() => {
    // Check if the cardData is in localStorage
    if (window !== undefined && window.localStorage) {
      const storedData = localStorage.getItem("Ashaar");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        dataItems.forEach((shaerData, index) => {
          const cardData = shaerData.wholeSher.map((line) => line).join("|"); // Serialize the card data

          if (
            parsedData.some(
              (data: { wholeSher: any[] }) =>
                data.wholeSher.join("|") === cardData
            )
          ) {
            // If card data exists in the stored data, update the card's appearance
            const cardElement = document.getElementById(`heart-icon-${index}`);
            if (cardElement) {
              cardElement.classList.add("text-red-600");
            }
          }
        });
      }
    }
  }, [dataItems]);

  return (
    <div>
      <div className="flex flex-row w-screen bg-white border-b-2 p-3 justify-between items-center relative">
        <div
          onClick={toggleFilter}
          className="cursor-pointer filter-btn flex-[20%] flex justify-center text-[#984A02]"
        >
          {/* <Filter></Filter> */}
        </div>
        <div className="filter-btn flex-[90%] text-center justify-center flex">
          <div className="flex justify-center basis-[95%] h-auto">
            <input
              type="text"
              placeholder="Search what you want"
              className="text-black border border-black focus:outline-none focus:border-r-0 border-r-0 p-2 w-64"
              id="searchBox"
              onKeyUp={handleSearchKeyUp}
            />
            <div
              className="justify-center bg-white h-[100%] pr-3 items-center flex w-11 border border-l-0 border-black"
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
        id="filtersListBox"
        className="flex flex-col w-[max] max-h-0 overflow-hidden bg-white absolute transition-all left-8 shadow-md border-t-0 z-50"
      >
        <ul className="p-2 text-black select-none" onClick={toggleFilter}>
          <li
            className={`border-b-2 m-2 cursor-pointer ${
              selectedFilter === "" ? "font-bold text-[#984A02]" : ""
            }`}
            onClick={() => filterData("")}
          >
            All
          </li>
          {allTags.map((tag) => (
            <li
              key={tag}
              className={`border-b-2 m-2 cursor-pointer ${
                tag === selectedFilter ? "font-bold text-[#984A02]" : ""
              }`}
              onClick={() => filterData(tag)}
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3">
        {dataItems.map((shaerData, index) => {
          if (isShaerMatch(shaerData)) {
            return (
              <div
                key={index}
                id={`card${index}`}
                className="bg-white p-4 rounded-sm border-b relative flex flex-col justify-between"
              >
                <h2 className="text-black text-2xl font-bold mb-2">
                  {shaerData.shaer}
                </h2>
                {/* Display a snippet of the ghazal data here */}
                {shaerData.sherHead.map((line, index) => (
                  <p key={index} className="text-black">
                    {line}
                  </p>
                ))}
                <div className="felx text-center icons">
                  <button
                    className={`m-3 text-gray-500`}
                    onClick={() =>
                      handleHeartClick(shaerData, index, `heart-icon-${index}`)
                    }
                    id={`heart-icon-${index}`}
                  >
                    <Heart className="inline" fill="currentColor" size={16} />
                  </button>
                  <button
                    className="m-3"
                    onClick={() => handleShareClick(shaerData, `card${index}`)}
                  >
                    <Share2 color="#984A02" />
                  </button>
                  <button
                    className="m-3"
                    onClick={() => handleDownload(`card${index}`)}
                  >
                    <Download color="#984A02" />
                  </button>

                  <button
                    className="text-[#984A02] font-semibold m-3"
                    onClick={() => handleCardClick(shaerData)}
                  >
                    View More
                  </button>
                </div>
              </div>
            );
          } else {
            return null; // Skip rendering this Shaer
          }
        })}
      </div>

      {selectedCard && (
        // <div className="justify-center w-max h-max">
        <div
          onClick={handleCloseModal}
          id="modal"
          className="bg-black bg-opacity-50 h-[100vh] w-[100vw] fixed top-0 z-50 overflow-hidden"
        >
          <div
            style={{ lineHeight: "normal" }}
            dir="rtl"
            className="opacity-100 fixed bottom-0 left-0 right-0 bg-white p-4 transition-all ease-in-out min-h-[50vh] max-h-[70vh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0"
          >
            <button
              className="absolute bottom-12 left-5 z-50"
              onClick={handleCloseModal}
            >
              <X className="text-[#984A02] text-2xl" />
            </button>
            <h2 className="text-black font-2xl font-bold p-1 border-b-2">
              {selectedCard.shaer}
            </h2>
            {selectedCard.wholeSher.map((line, index) => (
              <p
                style={{ lineHeight: "normal" }}
                key={index}
                className="text-black"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ashaar;
