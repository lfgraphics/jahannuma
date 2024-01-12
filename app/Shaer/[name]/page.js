"use client";
import React, { useState, useEffect } from "react";
import Intro from "@/app/Components/shaer/IntroPhoto"
import Intro2 from "@/app/Components/shaer/Intro"
import Ghazlen from "@/app/Components/shaer/Ghazlen"
import Nazmen from "@/app/Components/shaer/Nazmen"
import Ashaar from "@/app/Components/shaer/Ashaar"
import EBkooks from "@/app/Components/shaer/EBooks"

import './shaer.css';

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [activeNav, setActiveNav] = useState('تعارف'); // Set the default active nav


  const handleNavClick = (nav) => {
    setActiveNav(nav);
  };

  useEffect(() => {

    const encodedName = params.name;
    const decodedName = decodeURIComponent(encodedName).replace("-", " ");

    const fetchData = async () => {
      try {
        const BASE_ID = "appgWv81tu4RT3uRB";
        const TABLE_NAME = "Intro"

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({takhallus}='${decodedName.trim()}')`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,

        };


        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        const records = result.records || [];
        setData(records[0].fields);

      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };
    fetchData();
  }, [params.name]);

  return (
    <div dir="rtl" className="flex flex-col">
      <Intro data={data} ></Intro>
      <div className="inner-navs w-full md:w-[80vw] flex flex-row gap-3 mb-4 border-b-2 self-center p-4 text-xl">
        <div
          className={`nav-item ${activeNav === 'تعارف' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
          onClick={() => handleNavClick('تعارف')}
        >
          تعارف
        </div>
        {data.ghazlen && data.ghazlen === true && (
          <div
            className={`nav-item ${activeNav === 'غزلیں' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
            onClick={() => handleNavClick('غزلیں')}
          >
            غزلیں
          </div>
        )}
        {data.ashaar && data.ashaar === true && (
          <div
            className={`nav-item ${activeNav === 'نظمیں' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
            onClick={() => handleNavClick('نظمیں')}
          >
            نظمیں
          </div>
        )}
        {data.ashaar && data.ashaar === true && (
          <div
            className={`nav-item ${activeNav === 'اشعار' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
            onClick={() => handleNavClick('اشعار')}
          >
            اشعار
          </div>
        )}
        {data.eBooks && data.eBooks === true && (
          <div
            className={`nav-item ${activeNav === 'ئی - بکس' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
            onClick={() => handleNavClick('ئی - بکس')}
          >
            ئی - بکس
          </div>
        )}

      </div>
      {activeNav === "تعارف" && (
        <Intro2 data={data} ></Intro2>
      )}
      {activeNav === "غزلیں" && (
        <Ghazlen takhallus={data.takhallus}></Ghazlen>
        )}
      {activeNav === "نظمیں" && (
        <Nazmen takhallus={data.takhallus}></Nazmen>
      )}
      {activeNav === "اشعار" && (
        <Ashaar takhallus={data.takhallus} ></Ashaar>
      )}
      {activeNav === "ئی - بکس" && (
        <EBkooks takhallus={data.takhallus} ></EBkooks>
      )}

    </div>
  );
};

export default Page;
