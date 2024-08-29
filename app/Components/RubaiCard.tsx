// ShaerCard.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCommentAlt,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export interface Rubai {
  fields: {
    shaer: string;
    unwan: String;
    body: String;
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: String;
  createdTime: String;
}

interface RubaiCardProps {
  RubaiData: Rubai; // Replace Shaer with the actual type of shaerData
  index: number;
  handleShareClick: (shaerData: Rubai, index: number) => void; // Replace Shaer with the actual type
  handleHeartClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: Rubai,
    index: number,
    id: string
  ) => void; // Replace Shaer with the actual type // Replace Shaer with the actual type
  openComments: (id: string) => void;
}

const RubaiCard: React.FC<RubaiCardProps> = ({
  RubaiData,
  index,
  handleShareClick,
  handleHeartClick,
  openComments,
}) => {
  return (
    <>
      <div
        dir="rtl"
        key={index}
        id={`card${index}`}
        className={`${ index % 2 === 1 ? 'bg-gray-50' : 'bg-white' } p-4 rounded-sm  relative flex flex-col items-center justify-between`}
      >
        <div className="unwan text-center text-[#984A02] text-2xl mb-2">
          <p>{RubaiData.fields.unwan}</p>
        </div>
        <div className="unwan flex flex-col w-[90%] justify-center mb-2">
          {RubaiData?.fields?.body.split("\n").map((lin, index) => (
            <p key={index} className="justif text-black text-xl">
              {lin}
            </p>
          ))}
        </div>
        <Link
          href={`/Shaer/${RubaiData.fields?.shaer?.replace(" ", "-")}`}
          className="text-center"
        >
          <h2 className="text-black text-lg mb-4">{RubaiData.fields?.shaer}</h2>
        </Link>
        <div className="felx text-center icons">
          <button
            className={`m-3 text-gray-500 transition-all duration-500`}
            onClick={(e) =>
              handleHeartClick(e, RubaiData, index, `${RubaiData?.id}`)
            }
            id={`${RubaiData.id}`}
          >
            <FontAwesomeIcon icon={faHeart} />{" "}
            <span id="likescount" className="text-gray-500 text-sm">
              {RubaiData.fields?.likes}
            </span>
          </button>
          <button
            className="m-3"
            onClick={() => openComments(RubaiData.fields?.id)}
          >
            <FontAwesomeIcon
              icon={faCommentAlt}
              style={{ color: "#984A02" }}
              className="ml-2"
            />{" "}
            <span className="text-gray-500 text-sm">
              {RubaiData.fields?.comments}
            </span>
          </button>
          <button
            className="m-3"
            onClick={() => handleShareClick(RubaiData, index)}
          >
            <FontAwesomeIcon icon={faShareNodes} style={{ color: "#984A02" }} />{" "}
            <span className="text-gray-500 text-sm">
              {RubaiData.fields?.shares}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default RubaiCard;
