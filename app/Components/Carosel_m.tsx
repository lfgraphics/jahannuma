"use client";
import React, { useState, useEffect } from "react";
import Carousel from "./Carousel";

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
  url: String;
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
    handleResize(); // Call handler right away so state gets updated with initial window size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const Page: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const size = useWindowSize();
  const [data, setData] = useState<DataStructure[]>([]);

  const fetchData = async () => {
    try {
      const BASE_ID = "app1eVOGD6PdjD3vS";
      const TABLE_NAME = "Main Carousel";
      const headers = {
        //authentication with environment variable
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };
      //airtable fetch url and methods
      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

      const response = await fetch(url, { method: "GET", headers });
      const result: DataStructure = await response.json();
      const records = result.records || [];

      console.log(records);
      setData(records);
      // seting the loading state to false to show the data
      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* <h1>Image Carousel</h1> */}
      {loading ? <p>Loading...</p> : <Carousel records={data} />}
    </div>
  );
};

export default Page;
