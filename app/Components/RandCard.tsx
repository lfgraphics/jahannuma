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
    document.querySelectorAll(".icons").forEach(function (icon) {
      icon.classList.add("hidden");
    });

    const element = document.getElementById(elementId);
    if (element) {
      const fileName = prompt("Enter file name to save");

      if (fileName !== null && fileName.trim() !== "") {
        // Check if a valid file name is provided
        html2canvas(element).then(function (canvas) {
          var anchorTag = document.createElement("a");
          document.body.appendChild(anchorTag);
          anchorTag.download = `${fileName}.png`;
          anchorTag.href = canvas.toDataURL();
          anchorTag.target = "_blank";
          anchorTag.click();
        });
      }

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
            text:
              shaerData.sherHead.map((line) => line).join("\n") +
              `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `, // Join sherHead lines with line breaks

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
        <h4
          className="text-xl m-4 font-semibold text-[#984A02] tracking-[5px]"
          // style={{ letterSpacing: "5px" }}
        >
          Random sher
        </h4>
        <div
          id={"sherCard"}
          className="bg-white p-4 rounded-sm w-[95vw] justify-center flex flex-col items-center"
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
            <div className="flex flex-row items-center icons gap-3">
              <button
                className="m-3 flex gap-2 items-center"
                onClick={() => handleShareClick(randomData, "sherCard")}
              >
                <FontAwesomeIcon icon={faShare} style={{ color: "#984A02" }} />
                <p>Share this</p>
              </button>
              <button
                className="m-3 flex gap-2 items-center"
                onClick={() => handleDownload("sherCard")}
              >
                <FontAwesomeIcon
                  icon={faDownload}
                  style={{ color: "#984A02" }}
                />
                <p>Download this</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default RandCard;
