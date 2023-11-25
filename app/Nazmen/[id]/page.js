"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [id, setId] = useState("");

  useEffect(() => {
    setId(params.id);

    const fetchData = async () => {
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
      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };

    fetchData();
  }, [id]);
  const nazmLines = data.nazm?.split('\n');


  return (
    <div dir="rtl">
      <div className="p-4 mt-3">
        <div className="ghazalHead text-4xl text-black mb-2" style={{ lineHeight: "46px" }}>
          <h2>{data.displayLine?.replace("\n", "،")}</h2>
        </div>
        <div className="ghazalHead mb-3 text-[#984A02]">
          <Link href={`/Shaer/${data.shaer}`}>
            <h2>{data.shaer}</h2>
          </Link>
        </div>
        <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div>
        <div className="text-2xl">
          {nazmLines?.map((line, index) => (
            <p style={{ lineHeight: "normal" }} key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
