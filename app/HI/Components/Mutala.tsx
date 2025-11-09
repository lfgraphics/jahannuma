"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
interface Mutalah {
  fields: {
    date: Date;
    heading: string;
    body: string[];
    hawalaText: string;
    hawalaLink: string;
    writer: string;
    unwan: string;
    enUnwan: string;
    hiUnwan: string;
    enWriter: string;
    hiWriter: string;
    enHeading: string;
    enBody: string[];
    enHawalaText: string;
    enHawalaLink: string;
    hiHeading: string;
    hiBody: string[];
    hiHawalaText: string;
    hiHawalaLink: string;
  };
  id: string;
  createdTime: string;
}
// likes: number;
// comments: number;
// shares: number;
const Mutala = () => {
  const [mutalaData, setMutalaData] = useState<Mutalah>();
  const [insideBroser, setInsideBrowser] = useState(false);

  const todayDate = new Date().toLocaleDateString("en-GB");
  // Split the date components
  const dateComponents = todayDate?.split("/");
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
      console.log(recordWithTodayDate);
      console.log(recordWithTodayDate?.fields?.ans);
    } catch (error) {
      console.error("Failed to fetch quiz data:", error);
    }
  };

  useEffect(() => {
    setInsideBrowser(true);
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {insideBroser && mutalaData !== undefined && (
        <>
          <h1 className="text-4xl text-center mt-7 mb-3 text-[#984A02]">
            {mutalaData?.fields?.hiUnwan || "अध्ययन परिणाम"}
          </h1>
          <h2 className="text-2xl text-center mb-2">
            {mutalaData?.fields?.hiHeading || mutalaData?.fields?.heading}
          </h2>
          <p dir="ltr" className="p-6 bg-[#F3F4F6] dark:bg-[#2d2d2f] leading-10">
            {mutalaData?.fields?.hiBody || mutalaData?.fields?.body}
          </p>
          <div
            dir="ltr"
            className="flex w-full dark:text-foreground text-background bg-[#984A02] items-center justify-between px-7 pb-3 pt-4"
          >
            مأخز
            {(mutalaData.fields.hiHawalaLink || mutalaData.fields.hawalaLink) ? (
              <p>
                स्रोत:
                <Link
                  href={{ pathname: mutalaData?.fields?.hiHawalaLink || mutalaData?.fields?.hawalaLink }}
                  className="text-blue-200 underline ml-2"
                >
                  {mutalaData?.fields?.hiHawalaText || mutalaData?.fields?.hawalaText}
                </Link>
              </p>
            ) : (
              `संदर्भ: ${mutalaData?.fields?.hiHawalaText || mutalaData?.fields?.hawalaText}`
            )}
            {/* writer */}
            <p className="writer">{mutalaData.fields.hiWriter || mutalaData.fields.writer}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Mutala;
