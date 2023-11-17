"use client";
import React, { useState, useEffect } from "react";

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [id, setId] = useState("");

  useEffect(() => {
    setId(params.id);

    const fetchData = async () => {
      try {
        const API_KEY =
          "patpWvd49NVJhHOVr.73ebeea33c6733900c098b73f0d71a60114061896d4051a451e7e24d59351cef";
        const BASE_ID = "appvzkf6nX376pZy6";
        const TABLE_NAME = "ghazlen";

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`;
        const headers = {
          Authorization: `Bearer ${API_KEY}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        console.log("Fetched Data:", result.records);

        const records = result.records || [];
        console.log(records);

        // Handle the specific record you fetched
        const specificRecord = records.length > 0 ? records[0] : null;
        console.log("Specific Record:", specificRecord);

        // Further processing or setting state as needed
        setData(specificRecord);

      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      <h1>This is dynamic data of: {id}</h1>
      
    </div>
  );
};

export default Page;
