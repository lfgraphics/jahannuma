"use client";
import React, { useState } from "react";
import { data } from "./data";
import Link from "next/link";
import Image from "next/image";

const DoYouKnow: React.FC = () => {
  const [cards, setCards] = useState(data.cards);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollLeft = () => {
    if (scrollPosition > 0) {
      setScrollPosition(scrollPosition - 1);
    }
  };

  const scrollRight = () => {
    if (scrollPosition < cards.length - 1) {
      setScrollPosition(scrollPosition + 1);
    }
  };

  const card = cards[scrollPosition];

  return (
    <div className="flex justify-center mt-3 mb-5">
      <div className="flex  items-center justify-center gap-3 lg:w-[70vw] md:w-[70vw] sm:w-[60vw] w-[95vw]">
        <div
          className={`transition-all duration-500 ease-in-out rounded-full border-2 border-solid border-grey-300 text-[#984A02] bg-grey-300 hover:text-white hover:bg-[#984A02] p-2 flex cursor-pointer${
            scrollPosition == 0 ? " opacity-0" : ""
          }`}
          onClick={scrollLeft}
        >
          {/* <ChevronLeft size={20} /> */}
        </div>
        <div
          className="flex basis-[90%] justify-center overflow-hidden rounded-lg shadow-md h-[30rem] overflow-y-auto"
          style={{ background: card?.bgGradient }}
        >
          <div className="card w-full min-h-[100%] h-max">
            <div className="py-6 px-8 text-white text-center">
              <h2 className="text-2xl md:text-4xl font-semibold mb-3">
                DID YOU KNOW ?
              </h2>
              {card && card.img !== "" && (
                <div className="flex justify-center">
                  <div className="w-[150px] h-[150px] rounded-full shadow-lg mb-3 overflow-hidden bg-cover flex items-center justify-center">
                    <Image
                      src={card.img}
                      alt=""
                      width={100}
                      height={100}
                    ></Image>
                  </div>
                </div>
              )}
              <p className="text-base text-black">{card?.content}</p>
              {card && (
                <Link href={{ pathname: card.link }} className="text-blue-500 mt-4 block">
                  {card.link}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div
          className={`transition-all duration-500 ease-in-out rounded-full border-2 border-solid border-grey-300 text-[#984A02] bg-grey-300 hover:text-white hover:bg-[#984A02] p-2 flex cursor-pointer${
            scrollPosition == cards.length - 1 ? " opacity-0" : ""
          }`}
          onClick={scrollRight}
        >
          {/* <ChevronRight size={20} /> */}
        </div>
      </div>
    </div>
  );
};

export default DoYouKnow;
