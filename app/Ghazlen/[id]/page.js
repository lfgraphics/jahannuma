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
        const API_KEY =
          "patpWvd49NVJhHOVr.73ebeea33c6733900c098b73f0d71a60114061896d4051a451e7e24d59351cef";
        const BASE_ID = "appvzkf6nX376pZy6";
        const TABLE_NAME = "ghazlen";

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({id}='${id}')`;
        const headers = {
          Authorization: `Bearer ${API_KEY}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        console.log("Fetched Data:", result.records[0].fields);

        setData(result.records[0].fields)
      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };

    fetchData();
  }, [id]);
  const ghazalLines = data.ghazal?.split('\n');


  return (
    <div dir="rtl">
      <div className="p-4 mt-3">
        <div className="ghazalHead text-4xl text-black mb-2" style={{ lineHeight: "46px" }}>
          <h2>{data.ghazalHead?.replace("\n", "،")}</h2>
        </div>
        <div className="ghazalHead mb-3 text-[#984A02]">
          <Link href={`/Shaer/${data.shaer}`}>
            <h2>{data.shaer}</h2>
          </Link>
        </div>
        <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div>
        <div className="text-2xl">
          {ghazalLines?.map((line, index) => (
            <p style={{ lineHeight: "normal" }} key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
