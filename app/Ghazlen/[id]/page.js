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
          "patyHB0heKhiIC1GW.010be231355721357449b8a2ea7a11e38534e329e517722b42090e0d87fd7946";
        const BASE_ID = "appvzkf6nX376pZy6";
        const TABLE_NAME = "Ghazlen";

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({id}='${id}')`;
        const headers = {
          Authorization: `Bearer ${API_KEY}`,
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
  const ghazalLines = data.ghazal?.split('\n');
  const anaween = data.unwan?.split('\n');

  const visitGhazlen = () => {
    if (typeof window !== undefined) {
      const referrer = document.referrer || '';
      // Check if the referrer is not coming from /Ghazlen
      if (!referrer.includes('/Ghazlen')) {
        window.location.href = `${window.location.origin}/Ghazlen`; // Replace with your desired URL
      } else {
        window.history.back();
      }
    }
  };

  useEffect(() => {
    // Attach the custom back navigation handler to the popstate event
    window.addEventListener('popstate', visitGhazlen);

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('popstate', visitGhazlen);
    };
  }, []); // Empty dependency array to ensure the effect runs only once

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
