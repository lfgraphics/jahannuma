"use client";
import React, { useRef, useState } from "react";
import * as data from "./data";
import gsap from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faHeart,
  faShare,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";

interface Shaer {
  shaer: string;
  sherHead: string[];
  wholeSher: string[];
}

const Ashaar: React.FC<{}> = () => {
  // Fetch the data and assign it to the 'data' prop
  const dataItems: Shaer[] = data.getAllShaers();

  const [selectedCard, setSelectedCard] = useState<Shaer | null>(null);

  const [isAddedToLocalStorage, setIsAddedToLocalStorage] = useState(false);

  const [likedCards, setLikedCards] = useState<boolean[]>(
    new Array(dataItems.length).fill(false)
  );

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

          // Store the updated data in Local Storage

          // Set isAddedToLocalStorage to true when data is added
          setIsAddedToLocalStorage(true);

          // Toggle the color between "#984A02" and "grey" based on the current color
          document.getElementById(`${id}`)!.classList.remove("text-gray-500");
          document.getElementById(`${id}`)!.classList.add("text-[#984A02]");
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

          document.getElementById(`${id}`)!.classList.remove("text-[#984A02]");
          document.getElementById(`${id}`)!.classList.add("text-gray-500");

          localStorage.setItem("Ashaar", updatedDataJSON);
          // Set isAddedToLocalStorage to false when data is removed
          setIsAddedToLocalStorage(false);

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
    // console.log(shaerData.sherHead);
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.shaer, // Use the shaer's name as the title
            text: shaerData.sherHead.map((line) => line).join("\n"), // Join sherHead lines with line breaks
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
    }
  };

  const handleCloseModal = (): void => {
    // Animate modal close
    const modalElement = document.getElementById("modal");
    if (modalElement) {
      animateModalClose(modalElement);
    }
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
        document.querySelectorAll(".icons").forEach(function(icon) {
  icon.classList.remove("hidden");
});

      });
    }
    document.querySelectorAll(".icons").forEach(function(icon) {
  icon.classList.remove("hidden");
});

  };

  // Delay setting selectedCard to null to allow the closing animation
  // setTimeout(() => {
  //   setSelectedCard(null);
  // }, 500); // Adjust the delay to match your animation duration
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3">
        {dataItems.map((shaerData, index) => (
          <div
            key={index}
            id={`card${index}`}
            className="bg-white p-4 rounded-sm shadow-md"
            // onClick={() => handleCardClick(shaerData)}
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
                <FontAwesomeIcon icon={faHeart} />
              </button>
              <button
                className="m-3"
                onClick={() => handleShareClick(shaerData, `card${index}`)}
              >
                <FontAwesomeIcon icon={faShare} style={{ color: "#984A02" }} />
              </button>
              <button
                className="m-3"
                onClick={() => handleDownload(`card${index}`)}
              >
                <FontAwesomeIcon
                  icon={faDownload}
                  style={{ color: "#984A02" }}
                />
              </button>

              <button
                className="text-[#984A02] font-semibold m-3"
                onClick={() => handleCardClick(shaerData)}
              >
                View More
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        // <div className="justify-center w-max h-max">
        <div
          id="modal"
          className="fixed bottom-0 left-0 right-0 bg-white p-4 transform transition-all ease-in-out min-h-[50vh] max-h-[90vh] z-50 rounded-lg rounded-b-none w-[90%] mx-auto border-2 border-b-0"
        >
          <button
            className="absolute bottom-12 right-5"
            onClick={handleCloseModal}
          >
            <FontAwesomeIcon
              icon={faTimes}
              className="text-[#984A02] text-2xl"
            />
          </button>
          <h2 className="text-black font-2xl font-bold p-1 border-b-2">
            {selectedCard.shaer}
          </h2>
          {selectedCard.wholeSher.map((line, index) => (
            <p key={index} className="text-black">
              {line}
            </p>
          ))}
        </div>
        // </div>
      )}
    </div>
  );
};

export default Ashaar;
