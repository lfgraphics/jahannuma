// ShaerCard.tsx
import React from "react";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import type { Rubai } from "../types";

interface RubaiCardProps {
  RubaiData: Rubai; // Replace Shaer with the actual type of shaerData
  index: number;
  handleShareClick: (shaerData: Rubai, index: number) => void | Promise<void>; // Allow async
  handleHeartClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: Rubai,
    index: number,
    id: string
  ) => void | Promise<void>; // Allow async
  openComments: (id: string) => void;
  isLiking?: boolean;
}

const RubaiCard: React.FC<RubaiCardProps> = ({
  RubaiData,
  index,
  handleShareClick,
  handleHeartClick,
  openComments,
  isLiking,
}) => {
  return (
    <>
      <div
        dir="rtl"
        key={index}
        id={`card${index}`}
        className={`${index % 2 === 1 ? 'bg-gray-50 dark:bg-[#2d2d2f]' : 'bg-background'} p-4 rounded-sm  relative flex flex-col items-center justify-between`}
      >
        <div className="unwan text-center text-[#984A02] text-2xl mb-2">
          <p>{RubaiData.fields.unwan}</p>
        </div>
        <div className="unwan flex flex-col w-[90%] justify-center mb-2">
          {RubaiData?.fields?.body.split("\n").map((lin: any, index: number) => (
            <p key={index} className="justif text-foreground text-xl">
              {lin}
            </p>
          ))}
        </div>
        <Link
          href={{ pathname: `/Shaer/${RubaiData.fields?.shaer?.replace(" ", "-") ?? ""}` }}
          className="text-center"
        >
          <h2 className="text-foreground text-lg mb-4">{RubaiData.fields?.shaer}</h2>
        </Link>
        <div className="flex text-center icons">
          <button
            disabled={!!isLiking}
            className={`m-3 text-gray-500 transition-all duration-500 ${isLiking ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={(e) =>
              handleHeartClick(e, RubaiData, index, `${RubaiData?.id}`)
            }
            id={`${RubaiData.id}`}
          >
            <Heart className="inline-block" />{" "}
            <span id="likescount" className="text-gray-500 text-sm">
              {RubaiData.fields?.likes}
            </span>
          </button>
          <button
            className="m-3"
            onClick={() => openComments(RubaiData.fields?.id)}
          >
            <MessageSquare color="#984A02" className="ml-2 inline-block" />{" "}
            <span className="text-gray-500 text-sm">
              {RubaiData.fields?.comments}
            </span>
          </button>
          <button
            className="m-3"
            onClick={() => handleShareClick(RubaiData, index)}
          >
            <Share2 color="#984A02" className="inline-block" />{" "}
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
