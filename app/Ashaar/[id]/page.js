"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import UnwanPageLoader from "../../Components/UnwanPageLoader"
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setId(params.id);

    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });


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
              <p
                data-aos="fade-up"
                key={index}
                className="justif w-[320px] text-black pb-3 pr-4 text-2xl"
              >
                {line}
              </p>
            ))}
          </div>
          <div className="flex gap-5 text-md mb-4 justify-center" data-aos="fade-up">
            {anaween?.map((unwan, index) => (
              <Link href={`/Ashaar/mozu/${unwan}`} className="text-blue-500 underline cursor-pointer" style={{ lineHeight: "normal" }} key={index}>{unwan}</Link>
            ))}
          </div>
          <div className="mazeed flex justify-around" data-aos="fade-up">
            <button
              onClick={visitGhazlen}
              className="bg-white text-[#984A02] border active:bg-[#984a02ac] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            >
              مزید اشعار
            </button>
            <Link href={`/Ashaar/shaer/${data?.shaer?.replace(' ', '_')}`} className="text-blue-600 underline">{data.shaer} کے مزید اشعار</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
