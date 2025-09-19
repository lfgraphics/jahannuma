"use client";
import React, { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import Intro from "@/app/Components/shaer/IntroPhoto"
import Intro2 from "@/app/Components/shaer/Intro"
import Ghazlen from "@/app/Components/shaer/Ghazlen"
import Nazmen from "@/app/Components/shaer/Nazmen"
import Ashaar from "@/app/Components/shaer/Ashaar"
import EBkooks from "@/app/Components/shaer/EBooks"
import Rubai from "@/app/Components/shaer/Rubai"
import ComponentsLoader from "@/app/Components/shaer/ComponentsLoader";
import Link from 'next/link';
import './shaer.css';

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [activeNav, setActiveNav] = useState('');
  const [loading, setLoading] = useState(true);
  // In Next.js newer versions, params is a Promise; unwrap safely for client usage
  const routeParams = typeof params?.then === "function" ? use(params) : params;
  const nameParam = routeParams?.name ?? useParams()?.name;

  useEffect(() => {
    const initializeActiveNav = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab) {
        setActiveNav(tab);
      } else {
        setActiveNav("تعارف"); // Default to 'تعارف' if no tab is specified
      }
    };

    initializeActiveNav();

    const encodedName = nameParam;
    if (!encodedName) {
      setLoading(false);
      return;
    }
    const decodedName = decodeURIComponent(encodedName).replace("-", " ");

    const fetchData = async () => {
      try {
        const BASE_ID = "appgWv81tu4RT3uRB";
        const TABLE_NAME = "Intro";

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({takhallus}='${decodedName.trim()}')`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        const records = result.records || [];
        if (records.length > 0 && records[0].fields) {
          setData(records[0].fields);
        } else {
          setData({});
        }
        setLoading(false)
      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };
    fetchData();

    window.addEventListener("popstate", initializeActiveNav);

    return () => {
      window.removeEventListener("popstate", initializeActiveNav);
    };
  }, [nameParam]);

  const handleNavClick = (nav) => {
    setActiveNav(nav);
    localStorage.setItem("activeNav", nav);
  };

  return (
    <>
      {loading && <ComponentsLoader />}
      {!loading && (<div dir="rtl" className="flex flex-col">
        <Intro data={data} ></Intro>
        <div className="inner-navs w-full md:w-[80vw] flex flex-row gap-3 mb-4 border-b-2 self-center p-4 py-2 text-xl">
          <div
            className={`nav-item ${activeNav === 'تعارف' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
            onClick={() => handleNavClick('تعارف')}
          >
            <Link href={`${"/Shaer/" + nameParam + "?tab=تعارف"}`} prefetch >
              تعارف
            </Link>
          </div>
          {data.ghazlen && data.ghazlen === true && (
            <div
              className={`nav-item ${activeNav === 'غزلیں' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
              onClick={() => handleNavClick('غزلیں')}
            >
              <Link href={`${"/Shaer/" + nameParam + "?tab=غزلیں"}`} prefetch >
                غزلیں
              </Link>
            </div>
          )}
          {data.nazmen && data.nazmen === true && (
            <div
              className={`nav-item ${activeNav === 'نظمیں' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
              onClick={() => handleNavClick('نظمیں')}
            >
              <Link href={`${"/Shaer/" + nameParam + "?tab=نظمیں"}`} prefetch >
                نظمیں
              </Link>
            </div>
          )}
          {data.ashaar && data.ashaar === true && (
            <div
              className={`nav-item ${activeNav === 'اشعار' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
              onClick={() => handleNavClick('اشعار')}
            >
              <Link href={`${"/Shaer/" + nameParam + "?tab=اشعار"}`} prefetch >
                اشعار
              </Link>
            </div>
          )}
          {data.eBooks && data.eBooks === true && (
            <div
              className={`nav-item ${activeNav === 'ئی - بکس' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
              onClick={() => handleNavClick('ئی - بکس')}
            >
              <Link href={`${"/Shaer/" + nameParam + "?tab=ئی - بکس"}`} prefetch >
                ئی - بکس
              </Link>
            </div>
          )}
          {data.rubai && data.rubai === true && (
            <div
              className={`nav-item ${activeNav === 'رباعی' ? 'active' : ''} min-w-[40px] text-center transition-all ease-in-out duration-500 `}
              onClick={() => handleNavClick('رباعی')}
            >
              <Link href={`${"/Shaer/" + nameParam + "?tab=رباعی"}`} prefetch >
                رباعی
              </Link>
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
        {activeNav === "رباعی" && (
          <Rubai takhallus={data.takhallus} ></Rubai>
        )}

      </div>)}
    </>
  );
};

export default Page;
