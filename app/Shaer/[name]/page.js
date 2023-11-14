"use client";
import React, { useState, useEffect } from "react";
import Intro from "@/app/Components/shaer/Intro"
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
          "patozzsZAsH1XSXny.f8e69e6d2e9a4781f92b68dd353ea2cdf37bfe64c00103355b69fed9e2c653a2";
        const BASE_ID = "appgWv81tu4RT3uRB";
        const TABLE_NAME = "Intro"

        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
        const headers = {
          Authorization: `Bearer ${API_KEY}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        const records = result.records || [];
        const filteredRecord = records.find((record) => record.fields.takhallus.trim() == decodedName);

        if (filteredRecord) {
          // console.log(filteredRecord);

          setData(filteredRecord.fields);
        } else {
          console.log(`No record found for takhallus: ${decodedName}`);
          setData(null); // or set an empty object as per your requirement
        }


      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };


    fetchData();
  }, [params.name]);

  return (
    <div>
      <h1>This is dynamic data of: {name}</h1>
      <Intro data={data} ></Intro>
    </div>
  );
};

export default Page;
