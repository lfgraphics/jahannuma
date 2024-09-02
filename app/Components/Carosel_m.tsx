"use client";
import React, { useState, useEffect } from "react";
import Carousel from "./Carousel";
import useSWR from "swr";
import Loader from "./Loader";

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

const Page: React.FC = () => {
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
  return (
    <div>
      {/* <h1>Image Carousel</h1> */}
      <Carousel records={records} />
    </div>
  );
};

export default Page;
