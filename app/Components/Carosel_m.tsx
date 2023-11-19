"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const Carousel: React.FC = () => {
  const [images] = useState([
    "/carousel/jnd.jpeg",
    "/carousel/josh.jpeg",
    "/carousel/caroselcheck.png",
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [currentSlide]);

  return (
    <div className="flex flex-col items-center relative">
      <div className="carousel flex justify-center">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide transition-all  duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              width={1920}
              height={560}
              className={`${index === currentSlide ? " w-screen" : "w-0"}`}
            />
          </div>
        ))}
      </div>
      <div className="navigationsetc absolute bottom-0 mb-3 flex justify-center flex-col">
        <div className="buttons flex items-center h-full justify-between w-screen">
          <button
            className="prev-button text-left w-[40vw] h-[80px] p-4 text-white text-5xl transition-all duration-500"
            onClick={prevSlide}
          >
            &#8249;
          </button>
          <button
            className="next-button text-right w-[40vw] h-[80px] p-4 text-white text-5xl transition-all duration-500"
            onClick={nextSlide}
          >
            &#8250;
          </button>
        </div>
        <div className="indicators">
          <div className="flex justify-center">
            <div className="indicators flex flex-col mt-4">
              <div className="flex flex-row gap-2 items-center justify-center w-screen">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator transition-all duration-500 ease-in-out h-2 rounded-full ${
                      index === currentSlide
                        ? "bg-white w-3"
                        : "bg-black bg-opacity-50 w-2"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
