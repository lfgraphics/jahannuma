"use client";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { ChevronRightCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import Card from "./BookCard";
import Loader from "./Loader";

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
  const { records, isLoading } = useAirtableList<EBooksType>("ebooks", {
    pageSize: 10,
  });
  const data = useMemo(() => records || [], [records]);
  const loading = isLoading;
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
                <Card
                  data={item}
                  showLikeButton
                  baseId="appXcBoNMGdIaSUyA"
                  table="E-Books"
                  storageKey="Books"
                />
              </div>
            ))}
            <Link className=" text-white text-4xl font-bold" href={"/E-Books"}>
              <ChevronRightCircle color="#984A02" size={36} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalBooks;
