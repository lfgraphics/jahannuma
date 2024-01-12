"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import UnwanPageLoader from "../../Components/UnwanPageLoader"

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if (document !== undefined) {
    //   const elements = [...document.querySelectorAll('.langChange')];
    //   elements.forEach((element) => element.classList.add('hidden'));
    //   window.addEventListener('beforeunload', function () {
    //     console.log('Beforeunload event triggered!');
    //     elements.forEach((element) => element.classList.remove('hidden'));
    //   });
    // }
    setId(params.id);

    const fetchData = async () => {
      setLoading(true)
      try {
        const BASE_ID = "appeI2xzzyvUN5bR7";
        const TABLE_NAME = "Ashaar";

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
  const ghazalLines = data.body?.split('\n');
  const anaween = data.unwan?.split('\n');

  const visitGhazlen = () => {
    if (typeof window !== undefined) {
      const referrer = document.referrer || '';
      // Check if the referrer is not coming from /Ghazlen
      if (!referrer.includes('/Ashaar')) {
        window.location.href = `${window.location.origin}/Ashaar`; // Replace with your desired URL
      } else {
        window.history.back();
      }
    }
  };

  // useEffect(() => {
  //   // Attach the custom back navigation handler to the popstate event
  //   window.addEventListener('popstate', visitGhazlen);

  //   // Cleanup the event listener when the component is unmounted
  //   return () => {
  //     window.removeEventListener('popstate', visitGhazlen);
  //   };
  // }, []); // Empty dependency array to ensure the effect runs only once

  return (
    <div dir="rtl" className="flex justify-center">
      {loading ? <UnwanPageLoader /> : (
        <div className="p-4 mt-3 w-screen md:w-[400px]">
          <div className="ghazalHead text-4xl text-black mb-2" style={{ lineHeight: "46px" }}>
            <h2>{data.sher?.replace("\n", "،")}</h2>
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
              <Link href={`/Ghazlen/mozu/${unwan}`} className="text-blue-500 underline cursor-pointer" style={{ lineHeight: "normal" }} key={index}>{unwan}</Link>
            ))}
          </div>
          <div className="mazeed flex justify-around">
            <button
              onClick={visitGhazlen}
              className="bg-white text-[#984A02] border active:bg-[#984a02ac] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            >
              مزید غزلیں
            </button>
            <Link href={`/Ghazlen/shaer/${data?.shaer?.replace(' ', '_')}`} className="text-blue-600 underline">{data.shaer} کی مزید نظمیں</Link>
          </div>
          {/* <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div> */}
        </div>
      )}
    </div>
  );
};

export default Page;
