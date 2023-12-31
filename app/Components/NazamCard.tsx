// ShaerCard.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCommentAlt,
  faShareNodes,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
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
interface ShaerCardProps {
  shaerData: Shaer; // Replace Shaer with the actual type of shaerData
  index: number;
  handleCardClick: (shaerData: Shaer) => void; // Replace Shaer with the actual type
  toggleanaween: (cardId: string | null) => void;
  openanaween: string | null; // Updated type
  handleHeartClick: (shaerData: Shaer, index: number, id: string) => void; // Replace Shaer with the actual type
  handleShareClick: (shaerData: Shaer, index: number) => void; // Replace Shaer with the actual type
  openComments: (id: string) => void;
}

const NazamCard: React.FC<ShaerCardProps> = ({
  shaerData,
  index,
  handleCardClick,
  toggleanaween,
  openanaween,
  handleHeartClick,
  handleShareClick,
  openComments,
}) => {
  return (
    <div
      key={index}
      id={`card${index}`}
      className="bg-white p-4 rounded-sm border-b relative flex flex-col justify-between max-h-[150px]"
    >
      <div className="flex justify-between mx-7 items-end">
        <p className="text-4xl mb-4 text-[#984A02]">
          {shaerData.fields.unwan?.[0]}
        </p>
        <Link href={`/Shaer/${shaerData.fields.shaer.replace(" ", "-")}`}>
          <h2 className="text-black text-xl">{shaerData.fields.shaer}</h2>
        </Link>
      </div>
      {/* ghzl ki phli line starts */}

      {/* ghzl ki phli line ends */}
      {/* Anaween/ mozooaat starts */}
      {/* <div className="relative">
        <div
          className="anaween-container flex flex-col items-center  absolute translate-y-[-7rem] overflow-y-scroll w-[90px] bg-white shadow-md transition-all duration-500 ease-in-out"
          style={{
            height: openanaween === `card${index}` ? "120px" : "0",
          }}
        >
          {shaerData.fields.unwan?.map((unwaan, index) => (
            <span key={index} className="text-md text-blue-500 underline p-2">
              <Link href={`/Nazmen/mozu/${unwaan}`}>{unwaan}</Link>
            </span>
          ))}
        </div>
        <button
          dir="ltr"
          className="text-[#984A02] cursor-auto mt-2 justify-start flex items-end flex-row-reverse "
          onClick={() => toggleanaween(`card${index}`)}
        >
          <span>
            :موضوعات{" "}
            <FontAwesomeIcon
              icon={faTag}
              className="ml-2 text-yellow-400 cursor-pointer"
            />
          </span>
          {
            <Link
              className="text-blue-500 underline"
              href={`/Nazmen/mozu/${shaerData.fields.unwan?.[0]}`}
            >
              {shaerData.fields.unwan?.[0]}
            </Link>
          }
          <span dir="rtl" className="cursor-auto">
            {shaerData.fields.unwan?.length > 1
              ? " ، " + (shaerData.fields.unwan?.length - 1) + " اور "
              : ""}
          </span>
        </button>
      </div> */}
      {/* Anaween/ mozooaat ends */}
      <div className="flex items-center justify-center text-center icons">
        {shaerData.fields.ghazalHead.map((lin, index) => (
          <p
            key={index}
            className="text-black  text-lg cursor-default"
            onClick={() => handleCardClick(shaerData)}
          >
            {lin} <span>۔۔۔</span>
          </p>
        ))}
        <button
          className="text-[#984A02] font-semibold m-3"
          onClick={() => handleCardClick(shaerData)}
        >
          پڑھیں۔۔۔
        </button>
        <button
          className={`m-3 text-gray-500 transition-all duration-500`}
          onClick={() => handleHeartClick(shaerData, index, `${shaerData.id}`)}
          id={`${shaerData.id}`}
        >
          <FontAwesomeIcon icon={faHeart} />{" "}
          <span className="text-gray-500 text-sm">
            {shaerData.fields.likes}
          </span>
        </button>
        <button className="m-3" onClick={() => openComments(shaerData.id)}>
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
          <FontAwesomeIcon icon={faShareNodes} style={{ color: "#984A02" }} />{" "}
          <span className="text-gray-500 text-sm">
            {shaerData.fields.shares}
          </span>
        </button>
      </div>
    </div>
  );
};

export default NazamCard;
