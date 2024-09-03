"use client";
import { useState, useEffect } from "react";
import Card from "./BookCard";
import Link from "next/link";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";

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
    <div dir="ltr">
      <h2 className="pt-6 text-center text-4xl">کتابیں</h2>
      {loading && <Loader></Loader>}
      {!loading && (
        <div>
          <div
            id="section"
            dir="rtl"
            className="flex flex-row-reverse overflow-auto gap-4 pt-7 pb-4  px-6 items-center"
          >
            {data.map((item, index) => (
              <div className="relative" key={index}>
                <Card data={item} />
              </div>
            ))}
            <Link className=" text-white text-4xl font-bold" href={"/E-Books"}>
              <FontAwesomeIcon
                icon={faCircleChevronRight}
                shake
                style={{ color: "#984A02" }}
              />{" "}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalBooks;
