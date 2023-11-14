"use client";
import React, { useState, useEffect } from "react";
// let datatype = {
//   fields: {
//     location: 'گورکھپور',
//     dob: '1/7/2003',
//     takhalllus: 'فرحت انصاری',
//     name: 'محمد فرقان انصاری',
//     tafseel: 'نام۔ محمد فرقان انصاری \nتخلص ۔ فرحت انصاری \nوالد ک…5996214\nجی میل اکاؤنٹ ۔ farhatansari373@gmail.com'
//   },
//   id: "recHYdjtb24y9jN1q"
// }

const Page = ({ params }) => {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {

    const encodedName = params.name;
    const decodedName = decodeURIComponent(encodedName).replace("-", " ");
    setName(decodedName);

    const fetchData = async () => {
      try {
        const API_KEY =
          "patQEExbucK5XVDEL.01c280724c437bee768825c0d8d8fa39b993534749a8dbd46256028b86edff5d";
        const BASE_ID = "appgWv81tu4RT3uRB";
        const TABLE_NAME = decodedName

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
        const headers = {
          Authorization: `Bearer ${API_KEY}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        const records = result.records || [];
        const fields = records.map((record) => record.fields);

        console.log(records[0])

        setData(fields[0]);
      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };


    fetchData();
  }, [params.name]);

  return (
    <div>
      <h1>This is dynamic data of: {name}</h1>
      {data.name}
    </div>
  );
};

export default Page;
