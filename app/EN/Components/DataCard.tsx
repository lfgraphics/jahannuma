import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCommentAlt,
  faShareNodes,
  faTag,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import DynamicDownloadHandler from "./Download";

interface Shaer {
  fields: {
    sher: string[];
    shaer: string;
    enShaer: string;
    ghazalHead: string | string[];
    ghazal: string[];
    unwan: string | string[];
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}

interface ShaerCardProps {
  page: string;
  shaerData: Shaer; // Replace Shaer with the actual type of shaerData
  index: number;
  download: boolean;
  handleCardClick: (shaerData: Shaer) => void; // Replace Shaer with the actual type
  toggleanaween: (cardId: string | null) => void;
  openanaween: string | null; // Updated type
  handleHeartClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: Shaer,
    index: number,
    id: string
  ) => void; // Replace Shaer with the actual type
  handleShareClick: (shaerData: Shaer, index: number) => void; // Replace Shaer with the actual type
  openComments: (id: string) => void;
}

const GhazalCard: React.FC<ShaerCardProps> = ({
  page,
  shaerData,
  index,
  download,
  handleCardClick,
  toggleanaween,
  openanaween,
  handleHeartClick,
  handleShareClick,
  openComments,
}) => {
  const [selectedShaer, setSelectedShaer] = useState<Shaer | null>(null);

  const cancelDownload = () => {
    // Reset the selectedShaer state to null
    setSelectedShaer(null);
  };

  return (
    <>
      {page == "nazm" && (
        <div
          key={index}
          id={`card${index}`}
          className={`${
            index % 2 === 1 ? "bg-gray-50" : ""
          } p-4 rounded-sm relative flex flex-col justify-between min-h-[180px] max-h-[200px]`}
        >
          <>
            <div className="flex justify-between items-end">
              <p className="text-3xl mb-4 text-[#984A02]">
                {shaerData?.fields?.unwan?.[0]}
              </p>
              <Link
                href={`/EN/Shaer/${shaerData?.fields?.shaer.replace(" ", "-")}?tab=تعارف`}
              >
                <h2 className="text-black text-xl font-italic">
                  {shaerData?.fields?.shaer}
                </h2>
              </Link>
            </div>
            <div className="flex items-center justify-center text-center icons">
              {shaerData?.fields?.ghazalHead.map((lin, index) => (
                <p
                  key={index}
                  className="justif w-full px-10 text-black pb-3 text-lg [&]:text-[length:clamp(1rem,2vw,1.5rem)] break-words"
                  onClick={() => handleCardClick(shaerData)}
                >
                  {lin} <span>۔۔۔</span>
                </p>
              ))}
              <button className="text-[#984A02] font-semibold m-3">
                <Link href={"/EN/Nazmen/" + shaerData.id}>Parhen</Link>
              </button>
              <button
                className={`m-3 text-gray-500 transition-all duration-500`}
                onClick={(e) =>
                  handleHeartClick(e, shaerData, index, `${shaerData?.id}`)
                }
                id={`${shaerData?.id}`}
              >
                <FontAwesomeIcon icon={faHeart} />{" "}
                <span id="likescount" className="text-gray-500 text-sm">
                  {shaerData?.fields?.likes}
                </span>
              </button>
              <button
                className="m-3"
                onClick={() => openComments(shaerData?.id)}
              >
                <FontAwesomeIcon
                  icon={faCommentAlt}
                  style={{ color: "#984A02" }}
                  className="ml-2"
                />{" "}
                <span className="text-gray-500 text-sm">
                  {shaerData?.fields?.comments}
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
                  {shaerData?.fields?.shares}
                </span>
              </button>
            </div>
          </>
        </div>
      )}
      {page !== "nazm" && (
        <div
          dir="ltr"
          key={index}
          id={`card${index}`}
          className={`${
            index % 2 === 1 ? "bg-gray-50" : ""
          } p-4 rounded-sm relative flex flex-col justify-between max-h-[450px]`}
        >
          <Link href={`/EN/Shaer/${shaerData?.fields?.enShaer?.replace(" ", "-")}?tab=تعارف`}>
            <h2 className="text-black text-lg font-light mb-4">
              {shaerData?.fields?.shaer}
            </h2>
          </Link>
          <div className="unwan flex flex-col w-[90%] items-center mb-2">
            {shaerData?.fields?.ghazalHead?.includes("\n")
              ? shaerData.fields.ghazalHead?.split("\n").map((lin, index) => (
                  <p
                    key={index}
                    className="justif w-full  text-black pb-3 text-lg [&]:text-[length:clamp(1rem,2vw,1.5rem)] break-normal"
                    onClick={() => handleCardClick(shaerData)}
                  >
                    {lin}
                  </p>
                ))
              : shaerData.fields?.ghazalHead?.map((lin, index) => (
                  <p
                    key={index}
                    className="text-sm w-full text-center  [&]:text-[length:clamp(1rem,2vw,1.5rem)] break-normal"
                    onClick={() => handleCardClick(shaerData)}
                  >
                    {lin}
                  </p>
                ))}
          </div>
          <div className="relative">
            <div
              className="anaween-container flex flex-col items-center  absolute translate-y-[-7rem] overflow-y-scroll w-[100px] bg-white shadow-md transition-all duration-500 ease-in-out"
              style={{
                height: openanaween === `card${index}` ? "120px" : "0",
              }}
            >
              {page !== "rand" &&
                shaerData?.fields?.unwan?.map((unwaan, index) => (
                  <span
                    key={index}
                    className="text-md text-blue-500 underline p-2"
                  >
                    <Link href={`/EN/Ghazlen/mozu/${unwaan}`}>{unwaan}</Link>
                  </span>
                ))}
              {page == "rand" &&
                shaerData?.fields?.unwan?.split("\n").map((unwaan, index) => (
                  <span
                    key={index}
                    className="text-md text-blue-500 underline p-2"
                  >
                    <Link href={`/EN/Ashaar/mozu/${unwaan}`}>{unwaan}</Link>
                  </span>
                ))}
            </div>
            <button
              dir="rtl"
              className="text-[#984A02] cursor-auto mt-2 justify-start flex items-end flex-row-reverse border rounded-full px-2 py-1 shadow active:shadow-lg transition-all duration-500 ease-in-out"
              onClick={() => toggleanaween(`card${index}`)}
            >
              <span>
                  :Mauzoo'at {" "}
                <FontAwesomeIcon
                  icon={faTag}
                  className="ml-2 text-yellow-400 cursor-pointer"
                />
              </span>
              {page !== "rand" && (
                <Link
                  className="text-blue-500 underline"
                  href={`/EN/${download ? "Ashaar" : "Ghazlen"}/mozu/${
                    shaerData?.fields?.unwan?.[0]
                  }`}
                >
                  {shaerData?.fields?.unwan?.[0]}
                </Link>
              )}
              {page == "rand" && (
                <Link
                  className="text-blue-500 underline"
                  href={`/EN/${download ? "Ashaar" : "Ghazlen"}/mozu/${
                    shaerData?.fields?.unwan?.split("\n")[0]
                  }`}
                >
                  {shaerData?.fields?.unwan?.split("\n")[0]}
                </Link>
              )}
              <span dir="ltr" className="cursor-auto">
                {page !== "rand" && shaerData?.fields?.unwan?.length > 1
                  ? " , " + (shaerData?.fields?.unwan?.length - 1) + " aur "
                  : ""}
                {page == "rand" &&
                shaerData?.fields?.unwan?.split("\n").length > 1
                  ? " , " +
                    (shaerData?.fields?.unwan?.split("\n").length - 1) +
                    " aur "
                  : ""}
              </span>
            </button>
          </div>
          <div className="felx text-center icons">
            <button
              className={`m-3 text-gray-500 transition-all duration-500`}
              onClick={(e) =>
                handleHeartClick(e, shaerData, index, `${shaerData?.id}`)
              }
              id={`${shaerData?.id}`}
            >
              <FontAwesomeIcon icon={faHeart} />{" "}
              <span id="likescount" className="text-gray-500 text-sm">
                {shaerData?.fields?.likes}
              </span>
            </button>
            <button className="m-3" onClick={() => openComments(shaerData?.id)}>
              <FontAwesomeIcon
                icon={faCommentAlt}
                style={{ color: "#984A02" }}
                className="ml-2"
              />{" "}
              <span className="text-gray-500 text-sm">
                {shaerData?.fields?.comments}
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
                {shaerData?.fields?.shares}
              </span>
            </button>
            <button
              className="text-[#984A02] font-semibold m-3"
              onClick={() => handleCardClick(shaerData)}
            >
              <Link
                href={`/EN/${download ? "Ashaar/" : "Ghazlen/"}` + shaerData.id}
              >
                Ghazal Parhen
              </Link>
            </button>
            {download && (
              <button
                className="m-3"
                onClick={() => setSelectedShaer(shaerData)}
              >
                <FontAwesomeIcon
                  icon={faDownload}
                  style={{ color: "#984A02" }}
                />
              </button>
            )}
          </div>
          {/* openDownloadHandler && */}
          {download && selectedShaer && (
            <div className="fixed z-50 ">
              <DynamicDownloadHandler
                data={shaerData}
                onCancel={cancelDownload}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default GhazalCard;
