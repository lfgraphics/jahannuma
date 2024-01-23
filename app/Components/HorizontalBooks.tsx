"use client";
import { useState, useEffect } from "react";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import Card from "./BookCard";
import Link from "next/link";

interface Book {
  filename: string;
  height: number;
  id: string;
  size: number;
  thumbnails: {
    full: {
      height: number;
      url: string;
      width: number;
    };
    large: {
      height: number;
      url: string;
      width: number;
    };
    small: {
      height: number;
      url: string;
      width: number;
    };
  };
  type: string;
  url: string;
  width: number;
}

interface EBooksType {
  fields: {
    bookName: string;
    enBookName: string;
    hiBookName: string;
    publishingDate: string;
    writer: string;
    enWriter: string;
    hiWriter: string;
    desc: string[];
    enDesc: string[];
    hiDesc: string[];
    book: Book[];
    likes: number;
  };
  id: string;
  createdTime: string;
}

const HorizontalBooks = () => {
  const [data, setData] = useState<EBooksType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });
  //
  const fetchData = async () => {
    try {
      const BASE_ID = "appXcBoNMGdIaSUyA";
      const TABLE_NAME = "E-Books";
      const pageSize = 10;
      const headers = {
        //authentication with environment variable
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };
      //airtable fetch url and methods
      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?pageSize=${pageSize}`;

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();
      // : ApiResponse
      const records = result.records || [];

      setData(result.records);
      // formating result to match the mock data type for ease of development
      const formattedRecords: EBooksType[] = result.records.map(
        (record: any) => ({
          ...record,
          fields: {
            ...record.fields,
            bookName: record.fields?.bookName,
            writer: record.fields?.writer,
            publishingData: record.fields?.publishingData,
            tafseel: record.fields?.desc,
            book: record.fields?.book,
            likes: record.fields?.likes,
          },
        })
      );
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
      {!loading && (
        <div>
          <div className="py-7 text-center font-bold text-4xl">کتابیں</div>
          <div
            id="section"
            dir="rtl"
            className="flex overflow-auto gap-4 py-6 px-6 items-center"
          >
            {data.map((item, index) => (
              <div className="relative" key={index} data-aos="fade-up">
                <Card data={item} />
              </div>
            ))}
            <Link
              className="h-10 w-10 p-10 m-5 text-center rounded-full bg-blue-500 text-white text-4xl font-bold"
              href={"/E-Books"}
            >
              &gt;
              {/* <div className="h-20 w-20 text-center rounded-full bg-blue-500 text-white text-4xl font-bold">
            </div> */}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalBooks;
