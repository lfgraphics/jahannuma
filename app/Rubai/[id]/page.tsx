"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Loader from "@/app/Components/Loader";
import { Rubai } from "../../types";

export default function Page({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Rubai>();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE_ID = "appIewyeCIcAD4Y11";
      const TABLE_NAME = "rubai";

      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({id}='${params.id}')`;
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();

      setData(result.records[0]);
      console.log(result.records[0]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(`Failed to fetch data: ${error}`);
    }
  };
  useEffect(() => {
    // setId(params.id);
    fetchData();
    setTimeout(() => {
      console.log("data is -- ", data);
      console.log("id is -- ", params.id);
    }, 5000);
  }, [id]);
  const visitRubai = () => {
    if (typeof window !== undefined) {
      const referrer = document.referrer || "";
      if (!referrer.includes("/Rubai")) {
        window.location.href = `${window.location.origin}/Rubai`;
      } else {
        window.history.back();
      }
    }
  };
  return (
    <div dir="rtl" className="flex justify-center">
      {loading ? (
        <div className="h-[90vh] w-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="p-4 mt-3 w-full md:w-[400px]">
          <div className="text-center text-2xl">
            <p>
              {data?.fields.unwan}
            </p>
          </div>
          <div className="ghazalHead mb-3 text-[#984A02]">
            <Link href={`/Shaer/${data?.fields.shaer}`}>
              <h2>{data?.fields.shaer}</h2>
            </Link>
          </div>
          <div className="text-2xl mb-4 flex flex-col justify-center">
            {data?.fields.body.split("\n").map((line, index) => (
              <p
                data-aos="fade-up"
                key={index}
                className="justif w-full px-10 text-black pb-3 text-2xl"
              >
                {line}
              </p>
            ))}
          </div>
          <div className="mazeed flex justify-around" data-aos="fade-up">
            <button
              onClick={visitRubai}
              className="bg-white text-[#984A02] border active:bg-[#984a02ac] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            >
              مزید رباعی
            </button>
            <Link
              href={`/Rubai/shaer/${data?.fields.shaer.replace(" ", "_")}`}
              className="text-blue-600 underline"
            >
              {data?.fields.shaer} کی مزید رباعی
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
