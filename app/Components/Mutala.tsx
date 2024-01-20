"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
interface Mutalah {
  fields: {
    date: Date;
    heading: string;
    body: string[];
    hawalaText: string;
    hawalaLink: string;
    enHeading: string;
    enBody: string[];
    enHawalaText: string;
    enHawalaLink: string;
    hiHeading: string;
    hiBody: string[];
    hiHawalaText: string;
    hiHawalaLink: string;
    likes: number;
    comments: number;
    shares: number;
  };
  id: string;
  createdTime: string;
}
const Mutala = () => {
  const [mutalaData, setMutalaData] = useState<Mutalah>();
  const [insideBroser, setInsideBrowser] = useState(false);

  const todayDate = new Date().toLocaleDateString("en-GB");
  // Split the date components
  const dateComponents = todayDate.split("/");
  // Rearrange the components to the desired format "YYYY/MM/DD"
  const formattedDate = `${dateComponents[2]}-${dateComponents[1]}-${dateComponents[0]}`;

  const fetchData = async () => {
    try {
      const BASE_ID = "appzoxjWbF28knxX4";
      const TABLE_NAME = "data";

      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      // Include filterByFormula in the query parameters
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();
      const records = result.records || [];

      const recordWithTodayDate = records.find(
        (record: { fields: { date: string | number | Date } }) =>
          new Date(record.fields.date).getTime() ===
          new Date(formattedDate).getTime()
      );
      setMutalaData(recordWithTodayDate);
      console.log(recordWithTodayDate.fields?.ans);
    } catch (error) {
      console.error("Failed to fetch quiz data:", error);
    }
  };

  useEffect(() => {
    setInsideBrowser(true);
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {insideBroser && mutalaData !== undefined && (
        <>
          <h1 className="text-4xl text-center m-7">مطالعہ کی میز سے </h1>
          <h2 className="text-2xl text-center font-semibold">
            {mutalaData?.fields?.heading}
          </h2>
          <p className="p-6">{mutalaData?.fields?.body}</p>
          <div dir="rtl" className="flex w-screen text-white bg-[#984A02] items-center justify-center p-3">
            <Link href={mutalaData?.fields?.hawalaLink}>
              حوالہ: {mutalaData?.fields?.hawalaText}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Mutala;
