"use client";
import React, { useEffect, useState } from "react";
import * as data from "../Ashaar/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faShare } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";

interface Shaer {
  shaer: string;
  sherHead: string[];
  wholeSher: string[];
}

const RandCard: React.FC<{}> = () => {
  const dataItems: Shaer[] = data.getAllShaers();
  const randomIndex = Math.floor(Math.random() * dataItems.length);
  const randomData = dataItems[randomIndex];

  // Define handleDownload and handleShareClick functions here
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
      });
      document.querySelectorAll(".icons").forEach(function (icon) {
        icon.classList.remove("hidden");
      });
    }
    document.querySelectorAll(".icons").forEach(function (icon) {
      icon.classList.remove("hidden");
    });
  };

  const handleShareClick = (shaerData: Shaer, id: string): void => {
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.shaer,
            text: shaerData.sherHead.map((line) => line).join("\n"),
            url: window.location.href + `/#${id}`,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        console.log("Web Share API is not supported.");
      }
    } catch (error) {
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

  return (
    insideBrowser && (
      <div className="justify-center flex flex-col items-center m-4">
        <h4 className="text-xl m-4 font-semibold text-[#984A02]">
          Random sher
        </h4>
        <div
          id={"sherCard"}
          className="bg-white p-4 rounded-sm shadow-md w-[95vw] justify-center flex flex-col items-center"
        >
          <h2 className="text-black text-2xl font-bold mb-2">
            {randomData.shaer}
          </h2>
          {randomData.sherHead.map((line, index) => (
            <p key={index} className="text-black">
              {line}
            </p>
          ))}
          <div className="felx text-center">
            {/* Your buttons and actions here */}
            <div className="felx text-center icons">
              <button
                className="m-3"
                onClick={() => handleShareClick(randomData, "sherCard")}
              >
                <FontAwesomeIcon icon={faShare} style={{ color: "#984A02" }} />
              </button>
              <button
                className="m-3"
                onClick={() => handleDownload("sherCard")}
              >
                <FontAwesomeIcon
                  icon={faDownload}
                  style={{ color: "#984A02" }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default RandCard;
