"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import SkeletonLoader from "../../Components/SkeletonLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import PdfViewer from "@/app/Components/PdfViewer";

// import { Document, Page } from 'react-pdf';
const App = ({ params }) => {
  const [data, setData] = useState([]);
  const [bookUrl, setBookUrl] = useState();
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  const reloadIframe = () => {
    setIframeKey((prevKey) => prevKey + 1);
  };
  // useEffect(() => {
  const id = params.id;

  const fetchData = async () => {
    setLoading(true);
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
      if (records.length > 0) {
        const fieldsData = records[0].fields;
        setData(fieldsData);
      } else {
        // Handle the case where no records are available.
        console.error("No records found in the response.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(`Failed to fetch data: ${error}`);
    }
  };
  // }, [params.id]);
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (data.book && data.book.length > 0) {
      const firstBook = data.book[0];
      const bookUrl = firstBook.url;
      setBookUrl(data.book[0]?.url);
    } else {
      // Handle the case where 'book' is undefined or an empty array
      console.error(
        "No book data found in the record. please contact the organization"
      );
    }
  }, [data]); // Log the data whenever it changes
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  return (
    <div dir="rtl" className="flex flex-col min-h-screen w-screen">
      {loading && <SkeletonLoader />}
      {!loading && (
        <div>
          <div className="flex flex-col sm:flex-row p-6">
            <Link href="#pdf">
              <div className="photo mb-4">
                {/* <Image width={data.book[0]?.}></Image> */}
                <img
                  className="h-full w-[50%] p-2 border-2 block mx-auto"
                  src={`${data.book?.[0].thumbnails?.large?.url}`}
                  height={data.book?.[0].thumbnails?.large?.height}
                  width={data.book?.[0].thumbnails?.large?.width}
                  alt="Book cover"
                  loading="lazy"
                ></img>
              </div>
            </Link>
            <div className="details" data-aos="fade-up">
              {data && (
                <div className="text-lg" data-aos="fade-up">
                  <p className="my-2">کتاب کا نام: {data.bookName}</p>
                  <p className="my-2">
                    اشاعت: {formatDate(data.publishingDate)}
                  </p>
                  <p className="my-2">مصنف:
                    <Link href={`/Shaer/${data.writer}`}>
                      {data.writer}
                    </Link>
                  </p>
                  <p className="my-2">تفصیل: {data.desc}</p>
                  {data.maloomat && (
                    <div className="bg-gray-100 py-2 mt-4 rounded-sm border">
                      <p className="text-xs mr-4 text-foreground">دلچسپ معلومات:</p>
                      <p className="maloomat mr-4 mt-2 text-sm">
                        {data.maloomat}
                      </p>
                    </div>
                  )}
                  <div className="scale-75">
                    <Link
                      href={`#pdf`}
                      className=" text-background block mx-auto m-4 p-2 bg-blue-500 text-center w-[200px] px-8 rounded-md"
                    >
                      کتاب پڑھیں
                    </Link>
                    {bookUrl && data.download && (
                      <Link
                        href={bookUrl}
                        className=" text-foreground block mx-auto m-4 mb-1 p-2 border-2 border-blue-500 text-center w-[200px] px-8 rounded-md"
                      >
                        کتاب ڈاؤنلوڈ کریں
                      </Link>
                    )}
                  </div>
                  {/* کتاب نہ دکھنے یا لوڈ نہ ہونے کی صورت میں{" "}
                  <FontAwesomeIcon
                    icon={faRefresh}
                    className="text-foreground px-3"
                  />{" "}
                  اس بٹن سے ریفریش کریں */}
                </div>
              )}
            </div>
          </div>
          <div id="pdf" className="main relative">
            {/* <button
              className="absolute top-[75px] rounded-md right-2 w-12 p-3 bg-black text-background "
              onClick={reloadIframe}
            >
              <FontAwesomeIcon
                icon={faRefresh}
                className="text-xl block mx-auto "
              />
            </button> */}
            {bookUrl && (
              <PdfViewer url={bookUrl} />
              // <iframe
              //   data-aos="fade-up"
              //   key={iframeKey}
              //   src={`https://docs.google.com/viewer?url=${bookUrl}&embedded=true`}
              //   className="w-full h-[98svh] border-0 pt-16"
              //   frameBorder="0"
              // ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
