"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [id, setId] = useState("");

  useEffect(() => {
    const encodedName = params.name;
    const decodedName = decodeURIComponent(encodedName).replace("-", " ");

    const fetchData = async () => {
      try {
        const BASE_ID = "appvzkf6nX376pZy6";
        const TABLE_NAME = "Ghazlen";

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({takhallus}='${decodedName}')`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        const records = result.records || [];
        if (records.length > 0) {
          setPagination({ offset: result.offset, pageSize });
        }
        // Convert ghazal and ghazalHead fields to arrays
        const formattedRecords = records.map(
          (record) => ({
            ...record,
            fields: {
              ...record.fields,
              ghazal: record.fields.ghazal.split("\n"),
              ghazalHead: record.fields.ghazalHead.split("\n"),
              unwan: record.fields.unwan.split("\n"),
            },
          })
        );

        setDataItems(formattedRecords);
        setLoading(false);

        // console.log(filteredRecord)
      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  const ghazalLines = data.ghazal?.split('\n');
  const anaween = data.unwan?.split('\n');

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
        <div className="text-2xl mb-4">
          {ghazalLines?.map((line, index) => (
            <p style={{ lineHeight: "normal" }} key={index}>{line}</p>
          ))}
        </div>
        <div className="flex gap-5 text-md mb-4 justify-center">
          {anaween?.map((unwan, index) => (
            <p className="text-[#984A02] cursor-pointer" style={{ lineHeight: "normal" }} key={index}>{unwan}</p>
          ))}
        </div>
        <div className="mazeed ">
          <button
            onClick={visitGhazlen}
            className="bg-white text-[#984A02] border active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
          >
            مزید غزلیں
          </button>
        </div>
        {/* <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div> */}
      </div>
    </div>
  );
};

export default Page;
