"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const adsData = [
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://lfgraphics.github.io",
  },
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://lfgraphics.github.io",
  },
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://lfgraphics.github.io",
  },
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://lfgraphics.github.io",
  },
];

const Ads: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % adsData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollSnapStyle = {
    scrollSnapType: "x mandatory",
  };

  const translateXStyle = {
    transform: `translateX(-${currentIndex * 100}%)`,
  };

  return (
    <div className="p-0 pt-3 pb-4 w-full overflow-x-auto self-center justify-center">
      <div
        className="flex flex-row mt-4 mb-6"
        style={scrollSnapStyle}
      // style={translateXStyle}
      >
        {adsData.map((ad, index) => (
          <Link href={{ pathname: ad.redirectUrl }} key={index}>
            <div className=" overflow-auto w-[95vw] h-[max-content] m-3 scroll-snap-align-start shadow-md rounded-md">
              <img
                src={`${ad.imageUrl}`}
                alt={`Image ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-auto object-cover"
              ></img>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Ads;
