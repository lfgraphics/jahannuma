"use client";
import { useState, useEffect } from "react";
import Card from "./shaer/Profilecard";
import Link from "next/link";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";

interface Photo {
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

interface FormattedRecord {
  fields: {
    takhallus: string;
    dob: string;
    location: string;
    tafseel: string[];
    searchKeys: string[];
    enTakhallus: string[];
    hiTakhallus: string[];
    enName: string[];
    hiName: string[];
    enLocation: string[];
    hiLocation: string[];
    ghazal: boolean;
    eBooks: boolean;
    nazmen: boolean;
    likes: number;
    photo: Photo[];
  };
  id: string;
  createdTime: string;
}

const HorizontalShura = () => {
  const [data, setData] = useState<FormattedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  //
  const fetchData = async () => {
    try {
      const BASE_ID = "appgWv81tu4RT3uRB";
      const TABLE_NAME = "Intro";
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
      const formattedRecords: FormattedRecord[] = result.records.map(
        (record: any) => ({
          ...record,
          fields: {
            ...record.fields,
            tafseel: record.fields?.tafseel.split("\n"),
            searchKeys: record.fields?.searchKeys.split("\n"),
            enTakhallus: record.fields?.enTakhallus.split("\n"),
            hiTakhallus: record.fields?.hiTakhallus.split("\n"),
            enName: record.fields?.enName.split("\n"),
            hiName: record.fields?.hiName.split("\n"),
            enLocation: record.fields?.enLocation.split("\n"),
            hiLocation: record.fields?.hiLocation.split("\n"),
            ghazal: record.fields?.ghazal,
            eBooks: record.fields?.eBooks,
            nazmen: record.fields?.nazmen,
            likes: record.fields?.likes,
          },
        })
      );

      setData(formattedRecords)
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
      <h2 className="py-7 text-center text-4xl">شعرا</h2>
      {loading && <Loader></Loader>}
      {!loading && (
        <div>
          <div
            id="section"
            dir="rtl"
            className="flex flex-row-reverse overflow-auto gap-4 py-6 px-6 items-center"
          >
            {data.map((item, index) => (
              <div className="w-[240px]" key={index}>
                <Card data={item}/>
              </div>
            ))}
            <Link className=" text-white text-4xl font-bold" href={"/Shaer"}>
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

export default HorizontalShura;
