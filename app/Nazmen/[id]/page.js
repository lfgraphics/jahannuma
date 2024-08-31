"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import ComponentsLoader from "@/app/Components/shaer/ComponentsLoader";


const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setId(params.id);
    const fetchData = async () => {
      setLoading(true)
      try {
        const BASE_ID = "app5Y2OsuDgpXeQdz";
        const TABLE_NAME = "nazmen";

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({id}='${id}')`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        setData(result.records[0].fields)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error(`Failed to fetch data: ${error}`);
      }
    };
    fetchData();
  }, [id]);
  const ghazalLines = data.nazm?.split('\n');
  const anaween = data.unwan?.split('\n');

  const visitNazmen = () => {
    if (typeof window !== undefined) {
      const referrer = document.referrer || '';
      // Check if the referrer is not coming from /Nazmen
      if (!referrer.includes('/Nazmen')) {
        window.location.href = `${window.location.origin}/Nazmen`; // Replace with your desired URL
      } else {
        window.history.back();
      }
    }
  };

  return (
    <div dir="rtl" className="flex justify-center">
      {loading ? <ComponentsLoader /> : (
        <div className="p-4 mt-3 w-screen md:w-[400px]">
          <div className="ghazalHead text-3xl text-center text-black mb-2" style={{ lineHeight: "46px" }}>
            <h2>{data.unwan}</h2>
          </div>
          <div className="ghazalHead mb-3 text-[#984A02]">
            <Link href={`/Shaer/${data.shaer}`}>
              <h2>{data.shaer}</h2>
            </Link>
          </div>
          <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div>
          {!data.paband && (<div className="text-2xl mb-4 text-center">
            {ghazalLines?.map((line, index) => (
              <p className={`${line == "****" ? "my-12 opacity-0" : ""}`} style={{ lineHeight: "normal" }} key={index}>{line}</p>
            ))}
          </div>)
          }
          {data.paband && (
            (<div className="text-2xl mb-4 flex flex-col justify-center">
              {ghazalLines?.map((line, index) => (
                <p
                  data-aos="fade-up"
                  key={index}
                  className={`justif w-full px-10 text-black pb-3 text-2xl ${line == "****" ? "my-12 opacity-0" : ""}`}
                >
                  {line}
                </p>
              ))}
            </div>)
          )}
          <div className="flex gap-5 text-md mb-4 justify-center">
            {anaween?.map((unwan, index) => (
              <Link href={`/Nazmen/mozu/${unwan}`} className="text-blue-500 underline cursor-pointer" style={{ lineHeight: "normal" }} key={index}>{unwan}</Link>
            ))}
          </div>
          <div className="mazeed flex justify-around">
            <button
              onClick={visitNazmen}
              className="bg-white text-[#984A02] border active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            >
              مزید نظمیں
            </button>
            <Link href={`/Nazmen/shaer/${data.shaer?.replace(' ', '_')}`} className="text-blue-600 underline">{data.shaer} کی مزید نظمیں</Link>
          </div>
          {/* <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div> */}
        </div>
      )}
    </div>
  );
};

export default Page;
