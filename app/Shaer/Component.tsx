"use client";
import React, { useState, useEffect } from "react";
import Card from "../Components/shaer/Profilecard";
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

interface ApiResponse {
  records: any[];
  offset: string | null;
}

interface Photo {
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

interface FormattedRecord {
  fields: {
    takhallus: string;
    dob: string;
    location: string;
    tafseel: string[];
    searchKeys: string[];
    enTakhallus: string[];
    hiTakhallus: string[];
    enName: string[];
    hiName: string[];
    enLocation: string[];
    hiLocation: string[];
    ghazal: boolean;
    eBooks: boolean;
    nazmen: boolean;
    likes: number;
    photo: Photo[];
  };
  id: string;
  createdTime: string;
}
interface Pagination {
  offset: string | null;
  pageSize: number;
}
const Page: React.FC<{}> = () => {
  const [data, setData] = useState<FormattedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolledPosition, setScrolledPosition] = useState<number>();
  const [searchText, setSearchText] = useState("");
  const [moreloading, setMoreLoading] = useState(true);
  const [initialDataItems, setInitialdDataItems] = useState<FormattedRecord[]>(
    []
  );
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

  const fetchData = async (offset: string | null, userQuery: boolean) => {
    userQuery && setLoading(true);
    userQuery && setDataOffset(pagination.offset);
    try {
      const BASE_ID = "appgWv81tu4RT3uRB";
      const TABLE_NAME = "Intro";
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
        FIND('${searchText.trim().toLowerCase()}', LOWER({takhallus})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({name})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({dob})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({location})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({tafseel})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({searchKeys})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({enTakhallus})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({hiTakhallus})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({enName})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({hiName})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({enLocation})),
        FIND('${searchText.trim().toLowerCase()}', LOWER({hiLocation}))
      )`
        );
        url += `&filterByFormula=${encodedFormula}`;
      }

      if (offset) {
        url += `&offset=${offset}`;
      }
      const response = await fetch(url, { method: "GET", headers });
      const result: ApiResponse = await response.json();
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
      const formattedRecords: FormattedRecord[] = result.records.map(
        (record: any) => ({
          ...record,
          fields: {
            ...record.fields,
            tafseel: record.fields?.tafseel.split("\n"),
            searchKeys: record.fields?.searchKeys.split("\n"),
            enTakhallus: record.fields?.enTakhallus.split("\n"),
            hiTakhallus: record.fields?.hiTakhallus.split("\n"),
            enName: record.fields?.enName.split("\n"),
            hiName: record.fields?.hiName.split("\n"),
            enLocation: record.fields?.enLocation.split("\n"),
            hiLocation: record.fields?.hiLocation.split("\n"),
            ghazal: record.fields?.ghazal,
            eBooks: record.fields?.eBooks,
            nazmen: record.fields?.nazmen,
            likes: record.fields?.likes,
          },
        })
      );
      // console.log(result);
      // console.log("formated records are >" + formattedRecords);
      if (!offset) {
        if (userQuery) {
          setInitialdDataItems(data);
          setData(formattedRecords);
          // console.log(result);
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
    shaerData: FormattedRecord,
    index: any,
    id: string
  ): Promise<void> => {
    //for reference of double click to like: these are to be completed
    console.log("Event object:", e.detail);

    // toggleanaween(null);
    if (typeof window !== undefined && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Shura");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: FormattedRecord[] = existingDataJSON
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

          localStorage.setItem("Shura", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ شاعر کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          console.log(
            "آپ کی پروفائل میں یہ شاعر کامیابی کے ساتھ جوڑ دی گئی ہے۔ ."
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

            const updateResponse = await fetch(
              `https://api.airtable.com/v0/appgWv81tu4RT3uRB/Intro`,
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

          localStorage.setItem("Shura", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ شاعر کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          console.log(
            "آپ کی پروفائل سے یہ شاعر کامیابی کے ساتھ ہٹا دی گئی ہے۔"
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

            const updateResponse = await fetch(
              `https://api.airtable.com/v0/appgWv81tu4RT3uRB/Intro`,
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
      const storedData = localStorage.getItem("Shura");
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
    setPagination({
      offset: pagination.offset,
      pageSize: 30,
    });
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
          <div className="w-full z-20 flex flex-row bg-white border-b-2 p-3 justify-center sticky top-14">
            <div className="filter-btn basis-[75%] text-center flex">
              <div
                dir="rtl"
                className="flex justify-center items-center basis-[100%] h-auto pt-2"
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
                  className="heart cursor-pointer text-gray-500 pr-1 absolute top-0 right-0 w-[60px] max-w-[120px] content-center justify-center items-center h-8 flex border rounded-full m-2 gap-2 bg-white bg-opacity-30 backdrop-blur-sm z-10"
                  onClick={(e) =>
                    handleHeartClick(e, item, index, `${item.id}`)
                  }
                  id={`${item.id}`}
                >
                  <FontAwesomeIcon icon={faHeart} className="text-xl" />
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
