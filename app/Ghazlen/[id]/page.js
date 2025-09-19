"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ComponentsLoader from "@/app/Components/shaer/ComponentsLoader";
import html2canvas from "html2canvas";



const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  useEffect(() => {
    setId(params.id);

    const fetchData = async () => {
      setLoading(true)
      try {
        const BASE_ID = "appvzkf6nX376pZy6";
        const TABLE_NAME = "Ghazlen";

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

  const downloadImageWithWatermark = async () => {
    // Elements to hide during download
    const elementsToHide = document.querySelectorAll(".ghazalHead, .unwan");

    // Hide elements
    elementsToHide.forEach(el => el.style.visibility = 'hidden');

    const mainElement = document.getElementById("main");
    if (!mainElement) {
      console.error("Main content element not found.");
      return;
    }

    try {
      // Create canvas from mainElement
      const canvas = await html2canvas(mainElement, {
        allowTaint: true,
        useCORS: true,
        scale: 4, // Increase resolution
      });

      const ctx = canvas.getContext("2d");
      const watermarkText = "jahan-numa.org";
      const fontSize = 20;
      const opacity = 0.1;
      const angle = -30 * (Math.PI / 180); // Convert to radians
      const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      const step = 200; // Distance between watermarks

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.rotate(angle);

      for (let x = -diagonal; x < diagonal; x += step) {
        for (let y = -diagonal; y < diagonal; y += step) {
          ctx.fillText(watermarkText, x, y);
        }
      }

      ctx.rotate(-angle);

      // Convert canvas to image and download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${data.ghazalHead || "ghazal"}.png`;
      link.click();

      elementsToHide.forEach(el => el.style.visibility = 'visible');
    } catch (error) {
      console.error("Failed to generate and download image:", error);
    }
  };
  return (
    <div dir="rtl" className="flex flex-col items-center dark:bg-[#2d2d2f]">
      <div className="w-full sm:w-[400px]">
        {loading ? <ComponentsLoader /> : (
          <div id="main" className="p-4 mt-3">
            <div className={`ghazalHead text-2xl text-foreground text-center leading-[3rem]`}>
              {data.ghazalHead?.split('\n').map((line, index) => (
                <h2
                  key={index}
                  className="text-foreground"
                >
                  {line}
                </h2>
              ))}
            </div>
            <div className="shaer mb-3 text-[#984A02]">
              <Link href={`/Shaer/${data.shaer}`}>
                <h2>{data.shaer}</h2>
              </Link>
            </div>
            <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div>
            <div className="text-2xl mb-4 flex flex-col justify-center">
              {ghazalLines?.map((line, index) => (
                <p
                  data-aos="fade-up"
                  key={index}
                  className="justif w-full px-10 text-foreground pb-3 text-2xl [&]:text-[length:clamp(1rem,2vw,1.5rem)] break-words"
                >
                  {line}
                </p>
              ))}
            </div>
            <div className="flex gap-5 text-md mb-4 justify-center" data-aos="fade-up">
              {anaween?.map((unwan, index) => (
                <Link href={`/Ghazlen/mozu/${unwan}`} className={`unwan text-blue-500 underline cursor-pointer`} style={{ lineHeight: "normal" }} key={index}>{unwan}</Link>
              ))}
            </div>
          </div>
        )}
        {!loading && (
          <div className="mazeed flex mb-4 justify-around" data-aos="fade-up">
            <button
              onClick={visitGhazlen}
              className="bg-white text-[#984A02] border active:bg-[#984a02ac] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            >
              مزید غزلیں
            </button>
            <Link scroll={false} href={`/Ghazlen/shaer/${data?.shaer?.replace(' ', '_')}`} className="text-blue-600 underline">{data.shaer} کی مزید غزلیں</Link>
            <button
              onClick={downloadImageWithWatermark}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              تصویر ڈاؤن لوڈ کریں
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
