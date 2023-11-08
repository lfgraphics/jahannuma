"use client";
import React, { useState, useEffect } from "react";
// import { RouteComponentProps } from "react-router-dom";

interface MatchParams {
  name: string;
}

const page = ({ params }) => {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const encodedName = params.name;
  setName(decodeURIComponent(encodedName).replace("-", " "));

  useEffect(() => {
    const API_KEY =
      "patQEExbucK5XVDEL.01c280724c437bee768825c0d8d8fa39b993534749a8dbd46256028b86edff5d";
    const BASE_ID = "appgWv81tu4RT3uRB";
    const TABLE_NAME = "فرحت انصاری";

    // The Airtable endpoint for your table
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

    // Define headers with the API key
    const headers = {
      Authorization: `Bearer ${API_KEY}`,
    };

    // Make a GET request to fetch data from Airtable
    fetch(url, { method: "GET", headers })
      .then((response) => response.json())
      .then((data) => {
        const records = data.records || [];

        records.forEach((record) => {
          // Process the data as needed
          const fields = record.fields;
          // Access your fields using fields['Field_Name']

          // Example: Log the record's data
          console.log(fields);
        });
      })
      .catch((error) => {
        console.error(`Failed to fetch data: ${error}`);
      });
  }, [name]);

  return (
    <div>
      <h1>This is dynamic data of: {name}</h1>
      {data}
    </div>
  );
};

export default page;
