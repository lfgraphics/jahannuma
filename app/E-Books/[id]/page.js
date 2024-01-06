"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
// import { Document, Page } from 'react-pdf';

const App = ({ params }) => {
  const [data, setData] = useState([]);

  useEffect(() => {

    const id = params.id;
    // const decodedName = decodeURIComponent(encodedName).replace("-", " ");

    const fetchData = async () => {
      try {
        const BASE_ID = "appXcBoNMGdIaSUyA";
        const TABLE_NAME = "E-Books";
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({id}='${id}')`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        };

        const response = await fetch(url, { method: "GET", headers });
        const result = await response.json();

        const records = result.records || [];
        setData(records[0].fields.book[0].url);
        console.log(records[0].fields.book[0].url);

      } catch (error) {
        console.error(`Failed to fetch data: ${error}`);
      }
    };
    fetchData();
  }, [params.id]);
  // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  // const [numPages, setNumPages] = useState(null);
  // const [pageNumber, setPageNumber] = useState(1); // Default to the first page

  // function onDocumentLoadSuccess({ numPages }) {
  //   setNumPages(numPages);
  // }
  return (
    <div dir="rtl" className="flex flex-col min-h-screen w-screen bg-white text-center">
      <p className="pt-4">PDF viewer may don't work</p>
      <button className=" self-center m-4 rounded-md bg-gray-500 outline-none p-4 text-white hover:bg-white hover:outline-gray-500 hover:text-black w-max transition-all duration-500">
        <Link href={data}>Download the pdf book</Link>
      </button>
      <div className="main">
        {/* <Document file={data} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document> */}
        <iframe
          src={`https://docs.google.com/viewer?url=${data}&embedded=true`}
          className="w-full h-[98svh] border-0"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
};

export default App;
