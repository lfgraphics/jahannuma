"use client";
import React, { useState, useEffect } from "react";
import Card from "../Components/shaer/Profilecard";

const Page: React.FC<{}> = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const BASE_ID = "appgWv81tu4RT3uRB";
        const TABLE_NAME = "Intro";

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        const records = result.records || [];

        // Map through the records array and extract the fields
        const extractedData = records.map(
          (record: { fields: any }) => record.fields
        );

        setData(extractedData);
        console.log(extractedData);
      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };
    fetchData();
  }, []);

  return (
    <div
      dir="rtl"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3"
    >
      {/* Map over data and render a Card for each item */}
      {data.map((item, index) => (
        <Card key={index} data={item} />
      ))}
    </div>
  );
};

export default Page;
