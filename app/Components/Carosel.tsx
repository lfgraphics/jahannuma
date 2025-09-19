"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { Autoplay, Keyboard, Pagination, Navigation } from "swiper/modules";
import useSWR from "swr";
import Loader from "./Loader";
import Link from "next/link";

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}
interface Thumbnail {
  url: string;
  width: number;
  height: number;
}
interface Image {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
  width: number;
  height: number;
  thumbnails: {
    small: Thumbnail;
    large: Thumbnail;
    full: Thumbnail;
  };
}
interface RecordFields {
  url: string;
  photo: Image[];
  mobilePhoto: Image[];
}
interface Record {
  id: string;
  createdTime: string;
  fields: RecordFields;
}
interface DataStructure {
  records: Record[];
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

const fetcher = async (url: string) => {
  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
  };
  const response = await fetch(url, { method: "GET", headers });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const Carousel: React.FC = () => {
  const size = useWindowSize();
  const BASE_ID = "app1eVOGD6PdjD3vS";
  const TABLE_NAME = "Main Carousel";
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

  // Use SWR to handle data fetching, caching, and revalidation
  const { data, error } = useSWR(url, fetcher, {
    revalidateOnFocus: false, // Disable revalidation on focus
    revalidateOnReconnect: false, // Disable revalidation on reconnect
    refreshInterval: 0, // Disable polling entirely
    dedupingInterval: 60000, // Dedupes requests within 60 seconds (default: 2 seconds)
  });

  // Error handling and loading state
  if (error) return <div>Failed to load data: {error.message}</div>;
  if (!data) return <Loader />;

  const records = data.records || [];

  const isMobile = size.width && size.width < 768;

  function getImages(record: Record) {
    const img = isMobile ? record.fields.mobilePhoto?.[0] : record.fields.photo?.[0];
    return img;
  }

  return (
    <div>
      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        keyboard={{
          enabled: true,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Keyboard, Pagination, Navigation]}
        className="mySwiper h-[210px] sm:h-[310px] md:h-[210px] lg:h-[280px] xl:h-[390px] 2xl:h-[450px]"
      >
        {records.map((record: Record) => (
          <SwiperSlide>
            {record.fields.url ? (
              <Link
                href={{ pathname: `${record.fields.url}` }}
                target="_blank"
                rel="noopener noreferrer"
                passHref
              >
                <img
                  width={`${getImages(record)?.width ?? 0}`}
                  height={`${getImages(record)?.height ?? 0}`}
                  src={`${getImages(record)?.url ?? ""}`}
                  alt={`${getImages(record)?.filename ?? ""}`}
                ></img>
              </Link>
            ) : (
              <img
                width={getImages(record)?.width ?? 0}
                height={getImages(record)?.height ?? 0}
                src={`${getImages(record)?.url ?? ""}`}
                alt={`${getImages(record)?.filename ?? ""}`}
              ></img>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
