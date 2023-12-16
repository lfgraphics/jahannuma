"use client";
import React, { useEffect, useState } from "react";
// import * as data from "../Ghazlen/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faDownLong,
  faShareNodes,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import Loader from "./Loader";
import Link from "next/link";

interface Shaer {
  fields: {
    ghazal: string[];
    ghazalHead: string[];
    shaer: string;
    unwan: string[];
  };
  id: string;
  createdTime: string;
}

const RandCard: React.FC<{}> = () => {
  const [dataItems, setDataItems] = useState<Shaer[]>([]);
  const [randomData, setRandomData] = useState<Shaer | null>(null);
  const [loading, setLoading] = useState(true); // New state for loading

  const fetchData = async () => {
    try {
      const API_KEY =
        "patyHB0heKhiIC1GW.010be231355721357449b8a2ea7a11e38534e329e517722b42090e0d87fd7946";
      const BASE_ID = "appvzkf6nX376pZy6";
      const TABLE_NAME = "ghazlen";

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

      const headers = {
        Authorization: `Bearer ${API_KEY}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();

      const records = result.records || [];
      // Convert ghazal and ghazalHead fields to arrays
      const formattedRecords = records.map(
        (record: {
          fields: {
            unwan: string;
            ghazal: string;
            ghazalHead: string;
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
      setLoading(false); // Set loading to false when fetching is done

      // console.log(filteredRecord)
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
      setRandomData(dataItems[randomIndex]);
    }
  }, [dataItems]);

  // Define handleDownload and handleShareClick functions here
  const handleDownload = (elementId: string) => {
    document.querySelectorAll(".icons").forEach(function (icon) {
      icon.classList.add("hidden");
    });

    const element = document.getElementById(elementId);
    if (element) {
      const fileName = prompt("Enter file name to save");

      if (fileName !== null && fileName.trim() !== "") {
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
            title: shaerData.fields.shaer,
            text:
              shaerData.fields.ghazalHead.map((line) => line).join("\n") +
              `\nFound this on Jahan Numa website\nCheckout there webpage here>>\n `, // Join sherHead lines with line breaks

            url: window.location.href + `/${shaerData.id}`,
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
  const [openanaween, setOpenanaween] = useState<string | null>(null);

  const toggleanaween = (cardId: string) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div className="justify-center flex flex-col items-center m-4">
      <h4
        className="text-2xl mt-4 text-gray-600 "
        // style={{ letterSpacing: "5px" }}
      >
        ایک منتخب شعر
      </h4>
      {loading && <Loader></Loader>} {/* Show loader while fetching */}
      {!loading && (
        <div
          id={"sherCard"}
          className="bg-white p-4 rounded-sm w-[95vw] justify-center flex flex-col items-center"
        >
          <Link href={`/Shaer/${randomData?.fields.shaer}`}>
            <h2
              className="text-black text-3xl mb-2"
              style={{ lineHeight: "normal" }}
            >
              {randomData?.fields.shaer}
            </h2>
          </Link>
          {randomData?.fields.ghazalHead.map((line, index) => (
            <p key={index} className="text-black text-xl text-center leading-7">
              {line}
            </p>
          ))}
          <div dir="rtl" className="relative w-full flex justify-start">
            <div
              className="anaween-container flex flex-col items-center  absolute translate-y-[-7rem] overflow-y-scroll w-[90px] bg-white shadow-md transition-all duration-500 ease-in-out"
              style={{
                height: openanaween === `cardCard` ? "120px" : "0",
              }}
            >
              {randomData?.fields.unwan?.map((unwan, index) => (
                <span key={index} className="text-md text-[#984A02] p-2">
                  {unwan}
                </span>
              ))}
            </div>
            <button
              className="text-[#984A02] mt-2 justify-start flex items-end flex-row-reverse "
              onClick={() => toggleanaween(`cardCard`)}
            >
              موضوعات: {randomData?.fields.unwan?.[0]}
              {randomData?.fields.unwan!.length! > 1
                ? " ، " + (randomData?.fields.unwan!.length! - 1) + " اور "
                : ""}
              <span>
                <FontAwesomeIcon icon={faTag} className="ml-2" />
              </span>
            </button>
          </div>
          <div className="felx text-center">
            {/* Your buttons and actions here */}
            <div className="flex flex-row items-center icons gap-3">
              <button
                className="m-3 flex gap-2 items-center"
                onClick={() => handleShareClick(randomData!, "sherCard")}
              >
                <FontAwesomeIcon
                  icon={faShareNodes}
                  style={{ color: "#984A02", WebkitTextStroke: "2px white" }}
                />
                <p>شیر کریں</p>
              </button>
              <Link
                href={`/Ghazlen/${randomData?.id}`}
                className="m-3 flex gap-2 items-center"
              >
                <FontAwesomeIcon
                  icon={faArrowUp}
                  style={{ color: "#984A02" }}
                  className="rotate-45"
                />
                <p>غزل پڑھیں</p>
              </Link>
              <button
                className="m-3 flex gap-2 items-center"
                onClick={() => handleDownload("sherCard")}
              >
                <FontAwesomeIcon
                  icon={faDownLong}
                  style={{ color: "#984A02" }}
                />
                <p>ڈائنلوڈ کریں</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandCard;
