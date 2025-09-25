"use client";
import React, { useState, useEffect, useMemo } from "react";
import Card from "../Components/BookCard";
import { Heart, House, Search, X } from "lucide-react";
import { toast } from "sonner";
import SkeletonLoader from "../Components/SkeletonLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";

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
    desc: string;
    enDesc: string;
    hiDesc: string;
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
  // toast via sonner

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);
  const filterFormula = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return undefined;
    // Escape single quotes to prevent formula injection
    const escaped = q.replace(/'/g, "\\'");
    return `OR( FIND('${escaped}', LOWER({bookName})), FIND('${escaped}', LOWER({enBookName})), FIND('${escaped}', LOWER({hiBookName})), FIND('${escaped}', LOWER({desc})), FIND('${escaped}', LOWER({enDesc})), FIND('${escaped}', LOWER({hiDesc})), FIND('${escaped}', LOWER({publishingDate})), FIND('${escaped}', LOWER({writer})), FIND('${escaped}', LOWER({enWriter})), FIND('${escaped}', LOWER({hiWriter})) )`;
  }, [searchText]);
  const { records, isLoading, hasMore, loadMore } = useAirtableList<EBooksType>(
    "appXcBoNMGdIaSUyA",
    "E-Books",
    { pageSize: 30, filterByFormula: filterFormula },
    { debounceMs: 300 }
  );

  const { updateRecord: updateBooks } = useAirtableMutation(
    "appXcBoNMGdIaSUyA",
    "E-Books"
  );

  const formattedRecords: EBooksType[] = useMemo(() => {
    return (records || []).map((record: any) => ({
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
    }));
  }, [records]);

  useEffect(() => {
    setData(formattedRecords);
    setLoading(isLoading);
    setMoreLoading(false);
    setNoMoreData(!hasMore);
  }, [formattedRecords, isLoading, hasMore]);
  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    if (msgtype === "success") return toast.success(message);
    if (msgtype === "error") return toast.error(message);
    return toast.warning(message);
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
    if (typeof window !== 'undefined' && window.localStorage) {
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
            const updatedLikes = shaerData.fields.likes + 1;
            await updateBooks([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
            setData((prev) => {
              const copy = [...prev];
              const item = copy[index];
              if (item?.fields) item.fields.likes = updatedLikes;
              return copy;
            });
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
            const updatedLikes = shaerData.fields.likes - 1;
            await updateBooks([{ id: shaerData.id, fields: { likes: updatedLikes } }]);
            setData((prev) => {
              const copy = [...prev];
              const item = copy[index];
              if (item?.fields) item.fields.likes = updatedLikes;
              return copy;
            });
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
    if (typeof window !== 'undefined' && window.localStorage) {
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
    if (typeof window !== 'undefined') {
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
    if (typeof window !== 'undefined') {
      const section = document.getElementById("section");
      section?.scrollTo({
        top: scrolledPosition ?? 0,
        behavior: "smooth",
      } as ScrollToOptions);
    }
    setInitialdDataItems([]);
  };
  const handleLoadMore = async () => {
    try {
      setMoreLoading(true);
      await loadMore();
    } finally {
      setMoreLoading(false);
    }
  };

  return (
    <>
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
          <div className="w-full z-20 flex flex-row bg-transparent backdrop-blur-sm pb-1 justify-center sticky top-[116px] md:top-[80px] border-foreground border-b-2">
            <div className="filter-btn basis-[75%] text-center flex">
              <div dir="rtl" className="flex justify-center items-center basis-[100%] h-auto pt-1">
                <House color="#984A02" className="ml-3 cursor-pointer" size={30} onClick={() => { window.location.href = "/"; }} />
                <input
                  type="text"
                  placeholder="لکھ کر تلاش کریں"
                  className="text-foreground border border-foreground focus:outline-none focus:border-l-0 border-l-0 p-1 w-64 leading-7 bg-transparent"
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
                <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border border-r-0 border-l-0 border-foreground">
                  <X color="#984A02" size={24} onClick={clearSearch} id="searchClear" className="hidden text-[#984A02] cursor-pointer" />
                </div>
                <div className="justify-center bg-transparent h-[100%] items-center flex w-11 border-t border-b border-l border-foreground">
                  <Search color="#984A02" size={24} onClick={searchQuery} id="searchIcon" className="hidden text-[#984A02] text-xl cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
          <div
            id="section"
            dir="rtl"
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sticky m-3`}
          >
            {data.map((item, index) => (
              <div className="relative" key={index} data-aos="fade-up">
                <div
                  className="heart scale-75 cursor-pointer text-gray-500 pr-3 absolute -top-[13px] -right-[18px] w-[80px] max-w-[120px] h-10 flex items-center justify-center border rounded-t-none rounded-b-xl rounded-tr-sm m-2 bg-white bg-opacity-30 backdrop-blur-sm z-10"
                  onClick={(e) =>
                    handleHeartClick(e, item, index, `${item.id}`)
                  }
                  id={`${item.id}`}
                >
                  <Heart className="text-xl ml-3" />
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
                disabled={noMoreData || moreloading}
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