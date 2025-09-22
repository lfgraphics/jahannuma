"use client";
import React, { useEffect, useMemo, useState } from "react";
import * as data from "./data";
import { filterDataBySearch } from "./data"; // Adjust the import path accordingly
import { toPng } from "html-to-image";
import { Download, Heart, Share2, X } from "lucide-react";
// import { Filter } from "react-feather";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

  // Derived: show/hide clear icon
  const showClear = useMemo(() => searchText.trim() !== "", [searchText]);

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.toLowerCase();
    setSearchText(value);
    const filteredData = filterDataBySearch(value);
    setDataItems(filteredData);
  };

  // Function to clear the search input
  const clearSearch = () => {
    setSearchText("");
    setDataItems(data.getAllShaers());
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

  const [liked, setLiked] = useState<Set<string>>(new Set());

  const handleHeartClick = (shaerData: Shaer): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Ashaar");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: Shaer[] = existingDataJSON
          ? JSON.parse(existingDataJSON)
          : [];

        // Check if the shaerData is already in the existing data
        const isDuplicate = existingData.some((d) => d.shaer === shaerData.shaer);

        if (!isDuplicate) {
          // Add the new shaerData to the existing data array
          existingData.push(shaerData);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(existingData);
          localStorage.setItem("Ashaar", updatedDataJSON);
          setLiked((prev) => new Set(prev).add(shaerData.shaer));
          // Optionally, you can update the UI or show a success message
          console.log("Data added to Local Storage successfully.");
        } else {
          // Remove the shaerData from the existing data array
          const updatedData = existingData.filter((d) => d.shaer !== shaerData.shaer);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(updatedData);
          localStorage.setItem("Ashaar", updatedDataJSON);
          setLiked((prev) => {
            const next = new Set(prev);
            next.delete(shaerData.shaer);
            return next;
          });
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

  // Function to animate modal opening
  const handleCardClick = (shaerData: Shaer): void => {
    setSelectedCard(shaerData);
  };

  const handleCloseModal = (): void => {
    setSelectedCard(null);
  };

  const handleDownload = async (
    elementId: string,
    options?: {
      pixelRatio?: number;
      backgroundColor?: string;
      quality?: number; // used by jpeg, ignored by png but kept for flexibility
      width?: number;
      height?: number;
    }
  ): Promise<void> => {
    console.log("download is clicked");
    const icons = document.querySelectorAll(".icons");
    icons.forEach((icon) => icon.classList.add("hidden"));

    try {
      const element = document.getElementById(elementId) as HTMLElement | null;
      if (!element) return;


      const defaultPixelRatio =
        typeof window !== "undefined"
          ? Math.min((window.devicePixelRatio || 1) * 2, 4)
          : 2;

      const opts = {
        cacheBust: true,
        pixelRatio: defaultPixelRatio,
        ...options,
      };

      const dataUrl = await toPng(element, opts as any);

      const anchorTag = document.createElement("a");
      document.body.appendChild(anchorTag);
      const fileName = prompt("Enter file name to save") || "image";
      anchorTag.download = `${fileName}.png`;
      anchorTag.href = dataUrl;
      anchorTag.target = "_blank";
      anchorTag.click();
      anchorTag.remove();
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      icons.forEach((icon) => icon.classList.remove("hidden"));
    }
  };
  const toggleFilter = () => {
    document.getElementById("filtersListBox")?.classList.toggle("max-h-0");
  };

  const filterData = (tag: string) => {
    setSelectedFilter(tag);
  };

  useEffect(() => {
    // Initialize liked state from localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      const storedData = localStorage.getItem("Ashaar");
      if (storedData) {
        try {
          const parsed: Shaer[] = JSON.parse(storedData);
          const next = new Set<string>();
          parsed.forEach((d) => d?.shaer && next.add(d.shaer));
          setLiked(next);
        } catch {}
      } else {
        setLiked(new Set());
      }
    }
  }, [dataItems.length]);

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
              value={searchText}
              onChange={handleSearchChange}
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
                className={cn("text-[#984A02]", !showClear && "hidden")}
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
                <h2 className="text-black text-2xl font-bold mb-4">
                  {shaerData.shaer}
                </h2>
                {/* Display a snippet of the ghazal data here */}
                {shaerData.sherHead.map((lin, index) => (
                  <p
                    style={{ lineHeight: "normal" }}
                    key={index}
                    className="text-black line-normal"
                  >
                    {lin}
                  </p>
                ))}
                <div className="felx text-center icons">
                  <button
                    className={cn("m-3", liked.has(shaerData.shaer) ? "text-red-600" : "text-gray-500")}
                    onClick={() => handleHeartClick(shaerData)}
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
