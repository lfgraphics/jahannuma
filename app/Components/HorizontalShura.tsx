"use client";
import { useState, useEffect } from "react";
import Card from "./shaer/Profilecard";
import Link from "next/link";
import Loader from "./Loader";
import { ChevronRightCircle } from "lucide-react";

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
      const records = Array.isArray(result.records) ? result.records : [];

      // helper to normalize string | string[] | undefined to string[]
      const toArray = (v: unknown): string[] => {
        if (Array.isArray(v)) return v.filter(Boolean) as string[];
        return typeof v === "string" ? v.split("\n").filter(Boolean) : [];
      };

      // format records to match FormattedRecord safely
      const formattedRecords: FormattedRecord[] = records.map((record: any) => ({
        ...record,
        fields: {
          ...record.fields,
          tafseel: toArray(record?.fields?.tafseel),
          searchKeys: toArray(record?.fields?.searchKeys),
          enTakhallus: toArray(record?.fields?.enTakhallus),
          hiTakhallus: toArray(record?.fields?.hiTakhallus),
          enName: toArray(record?.fields?.enName),
          hiName: toArray(record?.fields?.hiName),
          enLocation: toArray(record?.fields?.enLocation),
          hiLocation: toArray(record?.fields?.hiLocation),
          ghazal: Boolean(record?.fields?.ghazal),
          eBooks: Boolean(record?.fields?.eBooks),
          nazmen: Boolean(record?.fields?.nazmen),
          likes: Number(record?.fields?.likes ?? 0),
          photo: Array.isArray(record?.fields?.photo) ? record.fields.photo : [],
        },
      }));

      setData(formattedRecords);
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
      <h2 className="py-4 pb-0 text-center text-4xl">شعرا</h2>
      {loading && <Loader></Loader>}
      {!loading && (
        <div>
          <div
            id="section"
            dir="rtl"
            className="flex flex-row-reverse overflow-auto gap-4 py-6 pt-3 px-6 items-center bg-[#F3F4F6] dark:bg-[#2d2d2f]"
          >
            {data.map((item, index) => (
              <div className="w-[240px]" key={index}>
                <Card data={item}/>
              </div>
            ))}
            <Link className=" text-white text-4xl font-bold" href={"/Shaer"}>
              <ChevronRightCircle color="#984A02" size={36} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalShura;
