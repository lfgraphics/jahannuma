"use client";
import React, { useState, useEffect } from "react";
import Card from "../Components/BookCard";
import {
  faHeart,
  faHome,
  faSearch,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ToastComponent from "../Components/Toast";
import SkeletonLoader from "../Components/SkeletonLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";

interface Book {
  filename: string;
  height: number;
  id: string;
  size: number;
  thumbnails: {
    full: {
      height: number;
      url: string;
      width: number;
    };
    large: {
      height: number;
      url: string;
      width: number;
    };
    small: {
      height: number;
      url: string;
      width: number;
    };
  };
  type: string;
  url: string;
  width: number;
}

interface EBooksType {
  fields: {
    bookName: string;
    enBookName: string;
    hiBookName: string;
    publishingDate: string;
    writer: string;
    enWriter: string;
    hiWriter: string;
    desc: string[];
    enDesc: string[];
    hiDesc: string[];
    book: Book[];
    likes: number;
  };
  id: string;
  createdTime: string;
}
interface Pagination {
  offset: string | null;
  pageSize: number;
}
const Page: React.FC<{}> = () => {
  const [data, setData] = useState<EBooksType[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [searchText, setSearchText] = useState("");
  const [moreloading, setMoreLoading] = useState(true);
  const [initialDataItems, setInitialdDataItems] = useState<EBooksType[]>([]);
  const [noMoreData, setNoMoreData] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    offset: null,
    pageSize: 30,
  });
  const [voffset, setOffset] = useState<string | null>("");
  const [dataOffset, setDataOffset] = useState<string | null>(null);
  //snackbar
  const [toast, setToast] = useState<React.ReactNode | null>(null);
  const [hideAnimation, setHideAnimation] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });
  //
  const fetchData = async (offset: string | null, userQuery: boolean) => {
    userQuery && setLoading(true);
    userQuery && setDataOffset(pagination.offset);
    try {
      const BASE_ID = "appXcBoNMGdIaSUyA";
      const TABLE_NAME = "E-Books";
      const pageSize = 30;
      const headers = {
        //authentication with environment variable
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };
      //airtable fetch url and methods
      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?pageSize=${pageSize}`;

      if (userQuery) {
        // Encode the formula with OR condition
        const encodedFormula = encodeURIComponent(
          `OR(
        FIND('${searchText.trim().toLowerCase()}', LOWER({bookName})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({enBookName})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({hiBookName})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({desc})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({enDesc})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({hiDesc})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({publishingData})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({writer})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({enWriter})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({hiWriter}))
      )`
        );
        url += `&filterByFormula=${encodedFormula}`;
      }

      if (offset) {
        url += `&offset=${offset}`;
      }
      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();
      setTimeout(() => {
        result.offset && setOffset(result.offset);
        !result.offset && setNoMoreData(true);
      }, 3000);

      if (!result.offset && dataOffset == "") {
        // No more data, disable the button
        setNoMoreData(true);
        setLoading(false);
        setMoreLoading(false);
      }
      setData(result.records);
      // formating result to match the mock data type for ease of development
      const formattedRecords: EBooksType[] = result.records.map(
        (record: any) => ({
          ...record,
          fields: {
            ...record.fields,
            bookName: record.fields?.bookName,
            writer: record.fields?.writer,
            publishingData: record.fields?.publishingData,
            tafseel: record.fields?.desc,
            book: record.fields?.book,
            likes: record.fields?.likes,
          },
        })
      );
      if (!offset) {
        if (userQuery) {
          setInitialdDataItems(data);
          setData(formattedRecords);
          // console.log(formattedRecords);
        } else {
          setData(formattedRecords);
          // console.log(result);
        }
      } else {
        setData((prevDataItems) => [...prevDataItems, ...formattedRecords]);
        // console.log(result);
      }
      // seting pagination depending on the response
      setOffset(result.offset);
      // seting the loading state to false to show the data
      setLoading(false);
      setMoreLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
      setMoreLoading(false);
    }
  };
  useEffect(() => {
    fetchData(null, false);
  }, []);
  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    // Clear the previous timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
      // showToast(msgtype, message);
    }
    setToast(
      <div className={`toast-container ${hideAnimation ? "hide" : ""}`}>
        <ToastComponent
          msgtype={msgtype}
          message={message}
          onHide={() => {
            setHideAnimation(true);
            setTimeout(() => {
              setHideAnimation(false);
              setToast(null);
            }, 500);
          }}
        />
      </div>
    );
    // Set a new timeout
    const newTimeoutId = setTimeout(() => {
      setHideAnimation(true);
      setTimeout(() => {
        setHideAnimation(false);
        setToast(null);
      }, 500);
    }, 6000);

    setTimeoutId(newTimeoutId);
  };

  const handleHeartClick = async (
    //for reference of double click to like
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    shaerData: EBooksType,
    index: any,
    id: string
  ): Promise<void> => {
    //for reference of double click to like: these are to be completed

    // toggleanaween(null);
    if (typeof window !== undefined && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Books");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: EBooksType[] = existingDataJSON
          ? JSON.parse(existingDataJSON)
          : [];

        // Check if the shaerData is already in the existing data
        const isDuplicate = existingData.some(
          (data) => data.id === shaerData.id
        );

        if (!isDuplicate) {
          // Add the new shaerData to the existing data array
          existingData.push(shaerData);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(existingData);

          // Toggle the color between "#984A02" and "grey" based on the current color
          document.getElementById(`${id}`)!.classList.remove("text-gray-500");
          document.getElementById(`${id}`)!.classList.add("text-red-600");

          localStorage.setItem("Books", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ کتاب کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );

          try {
            // Make API request to update the record's "Likes" field
            const updatedLikes = shaerData.fields.likes + 1;
            const updateData = {
              records: [
                {
                  id: shaerData.id,
                  fields: {
                    likes: updatedLikes,
                  },
                },
              ],
            };

            const updateHeaders = {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
              "Content-Type": "application/json",
            };
            const BASE_ID = "appXcBoNMGdIaSUyA";
            const TABLE_NAME = "E-Books";
            const updateResponse = await fetch(
              `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
              {
                method: "PATCH",
                headers: updateHeaders,
                body: JSON.stringify(updateData),
              }
            );

            if (updateResponse.ok) {
              // Update local state to reflect the change in likes
              setData((prevDataItems) => {
                const updatedDataItems = [...prevDataItems];
                updatedDataItems[index].fields.likes = updatedLikes;
                return updatedDataItems;
              });
            } else {
              console.error(`Failed to update likes: ${updateResponse.status}`);
            }
          } catch (error) {
            console.error("Error updating likes:", error);
          }
        } else {
          // Remove the shaerData from the existing data array
          const updatedData = existingData.filter(
            (data) => data.id !== shaerData.id
          );

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(updatedData);

          // Toggle the color between "#984A02" and "grey" based on the current color
          document.getElementById(`${id}`)!.classList.remove("text-red-600");
          document.getElementById(`${id}`)!.classList.add("text-gray-500");

          localStorage.setItem("Books", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ کتاب کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );

          try {
            // Make API request to update the record's "Likes" field
            const updatedLikes = shaerData.fields.likes - 1;
            const updateData = {
              records: [
                {
                  id: shaerData.id,
                  fields: {
                    likes: updatedLikes,
                  },
                },
              ],
            };

            const updateHeaders = {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
              "Content-Type": "application/json",
            };
            const BASE_ID = "appXcBoNMGdIaSUyA";
            const TABLE_NAME = "E-Books";
            const updateResponse = await fetch(
              `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
              {
                method: "PATCH",
                headers: updateHeaders,
                body: JSON.stringify(updateData),
              }
            );

            if (updateResponse.ok) {
              // Update local state to reflect the change in likes
              setData((prevDataItems) => {
                const updatedDataItems = [...prevDataItems];
                updatedDataItems[index].fields.likes = updatedLikes;
                return updatedDataItems;
              });
            } else {
              console.error(`Failed to update likes: ${updateResponse.status}`);
            }
          } catch (error) {
            console.error("Error updating likes:", error);
          }
        }
      } catch (error) {
        // Handle any errors that may occur when working with Local Storage
        console.error(
          "Error adding/removing data to/from Local Storage:",
          error
        );
      }
    }
  };
  useEffect(() => {
    if (window !== undefined && window.localStorage) {
      const storedData = localStorage.getItem("Books");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          data.forEach((shaerData, index) => {
            const shaerId = shaerData.id; // Get the id of the current shaerData

            // Check if the shaerId exists in the stored data
            const storedShaer = parsedData.find(
              (data: { id: string }) => data.id === shaerId
            );

            if (storedShaer) {
              // If shaerId exists in the stored data, update the card's appearance
              const cardElement = document.getElementById(shaerId);
              if (cardElement) {
                cardElement.classList.add("text-red-600");
              }
            }
          });
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      }
    }
  }, [data]);

  const searchQuery = () => {
    fetchData(null, true);
    if (typeof window !== undefined) {
      setScrolledPosition(document!.getElementById("section")!.scrollTop);
    }
  };
  //search keyup handeling
  const handleSearchKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value.toLowerCase();
    let xMark = document.getElementById("searchClear");
    let sMark = document.getElementById("searchIcon");
    value === ""
      ? xMark?.classList.add("hidden")
      : xMark?.classList.remove("hidden");
    value === ""
      ? sMark?.classList.add("hidden")
      : sMark?.classList.remove("hidden");
    setSearchText(value);
  };
  //clear search box handeling
  const clearSearch = () => {
    let input = document.getElementById("searchBox") as HTMLInputElement;
    let xMark = document.getElementById("searchClear");
    let sMark = document.getElementById("searchIcon");

    input.value ? (input.value = "") : null;
    xMark?.classList.add("hidden");
    sMark?.classList.add("hidden");
    // Clear the searched data and show all data again
    setSearchText(""); // Clear the searchText state
    // setDataItems(data.getAllShaers()); // Restore the original data
  };
  const resetSearch = () => {
    searchText && clearSearch();
    setData(initialDataItems);
    if (typeof window !== undefined) {
      let section = document.getElementById("section");
      section!.scrollTo({
        top: scrolledPosition,
        behavior: "smooth",
      });
    }
    setInitialdDataItems([]);
  };
  const handleLoadMore = () => {
    setMoreLoading(true);
    fetchData(voffset, false);
  };

  return (
    <>
      {toast}
      {loading && <SkeletonLoader />}
      {initialDataItems.length > 0 && data.length == 0 && (
        <div className="block mx-auto text-center my-3 text-2xl">
          سرچ میں کچھ نہیں ملا
        </div>
      )}
      {initialDataItems.length > 0 && (
        <button
          className="bg-white text-[#984A02] hover:px-7 transition-all duration-200 ease-in-out border block mx-auto my-4 active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
          onClick={resetSearch}
          // disabled={!searchText}
        >
          تلاش ریسیٹ کریں
        </button>
      )}
      {!loading && (
        <div>
          <div className="w-full z-20 flex flex-row bg-white border-b-2 p-3 justify-center sticky  top-28 lg:top-14">
            <div className="filter-btn basis-[75%] justify-center text-center flex">
              <div
                dir="rtl"
                className="flex basis-[100%] justify-center items-center h-auto pt-2"
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="text-[#984A02] text-2xl ml-3"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                />
                <input
                  type="text"
                  placeholder="لکھ کر تلاش کریں"
                  className="text-black border border-black focus:outline-none focus:border-l-0 border-l-0 p-2 w-64 leading-7"
                  id="searchBox"
                  onKeyUp={(e) => {
                    handleSearchKeyUp(e);
                    if (e.key === "Enter") {
                      if (document.activeElement === e.target) {
                        e.preventDefault();
                        searchQuery();
                      }
                    }
                  }}
                />
                <div className="justify-center bg-white h-[100%] items-center flex w-11 border border-r-0 border-l-0 border-black">
                  <FontAwesomeIcon
                    onClick={clearSearch}
                    id="searchClear"
                    icon={faXmark}
                    className="hidden text-[#984A02] text-2xl cursor-pointer"
                  />
                </div>
                <div className="justify-center bg-white h-[100%] items-center flex w-11 border-t border-b border-l border-black">
                  <FontAwesomeIcon
                    onClick={searchQuery}
                    id="searchIcon"
                    icon={faSearch}
                    className="hidden text-[#984A02] text-xl cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            id="section"
            dir="rtl"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3"
          >
            {data.map((item, index) => (
              <div className="relative" key={index} data-aos="fade-up">
                <div
                  className="heart scale-75 cursor-pointer text-gray-500 pr-3 absolute -top-4 -right-4 w-[80px] max-w-[120px] h-10 flex items-center justify-center border rounded-t-none rounded-b-xl m-2 bg-white bg-opacity-30 backdrop-blur-sm z-10"
                  onClick={(e) =>
                    handleHeartClick(e, item, index, `${item.id}`)
                  }
                  id={`${item.id}`}
                >
                  <FontAwesomeIcon icon={faHeart} className="text-xl ml-3" />
                  <span className="text-black">{`${item.fields?.likes}`}</span>
                </div>
                <Card data={item} />
              </div>
            ))}
          </div>
          {data.length > 0 && (
            <div className="flex justify-center text-lg m-5">
              <button
                onClick={handleLoadMore}
                disabled={noMoreData}
                className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
              >
                {moreloading
                  ? "لوڈ ہو رہا ہے۔۔۔"
                  : noMoreData
                  ? "مزید شعراء کی تفصیلات موجود نہیں ہیں"
                  : "مزید شعراء کی تفصیات لوڈ کریں"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Page;