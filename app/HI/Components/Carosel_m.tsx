"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const Carousel1: React.FC = () => {
  const [images] = useState([
    { src: "/carousel/josh.jpeg", link: "/" },
    { src: "/carousel/jnd.jpeg", link: "/" },
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);

    return () => {
      clearInterval(carouselInterval);
    };
  }, [images]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
  };

  const renderCarouselItems = () => {
    return images.map((image, index) => (
      <div
        key={index}
        className={`duration-700 ease-in-out ${
          index === currentSlide ? "" : "hidden"
        }`}
        data-carousel-item
      >
  <Link href={{ pathname: image.link }}>
          <img
            src={image.src}
            className="absolute block w-full h-auto -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            alt={`Carousel Item ${index + 1}`}
          />
        </Link>
      </div>
    ));
  };

  return (
    <div
      id="default-carousel"
      className="relative w-full h-auto"
      data-carousel="slide"
    >
      <div className=" relative overflow-hidden pb-[40%]">
        {renderCarouselItems()}
      </div>
      <div className="absolute z-30 flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-2 h-2 rounded-full ${
              index === currentSlide ? "bg-white" : "bg-gray-500"
            }`}
            aria-current={index === currentSlide}
            aria-label={`Slide ${index + 1}`}
            data-carousel-slide-to={index}
            onClick={() => handleSlideClick(index)}
          ></button>
        ))}
      </div>
      <button
        type="button"
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        data-carousel-prev
        onClick={() =>
          setCurrentSlide((prevSlide) =>
            prevSlide === 0 ? images.length - 1 : prevSlide - 1
          )
        }
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg
            className="w-4 h-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 1 1 5l4 4"
            />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button
        type="button"
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        data-carousel-next
        onClick={() =>
          setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length)
        }
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg
            className="w-4 h-4 text-white "
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
};

export default Carousel1;
