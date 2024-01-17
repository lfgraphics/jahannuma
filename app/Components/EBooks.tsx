"use client";
import { useEffect, useState } from "react";
import ToastComponent from "./Toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import Card from "./BookCard";

// import React {useEffect} from 'react'
interface Shaer {
  fields: {
    sher: string[];
    shaer: string;
    ghazalHead: string[];
    ghazal: string[];
    unwan: string[];
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}

const EBooks = () => {
  const [data, setData] = useState<Shaer[] | null>(null);
  //snackbar
  const [toast, setToast] = useState<React.ReactNode | null>(null);
  const [hideAnimation, setHideAnimation] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [insideBrowser, setInsideBrowser] = useState(false);

  useEffect(() => {
    let retrivedData = localStorage.getItem("Books");
    let parsedData = retrivedData ? JSON.parse(retrivedData) : null;
    setData(parsedData);
  }, []);
  useEffect(() => {
    setInsideBrowser(true);
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
    shaerData: Shaer,
    index: any,
    id: string
  ): Promise<void> => {
    if (typeof window !== undefined && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Books");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: Shaer[] = existingDataJSON
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
          console.log(
            "آپ کی پروفائل میں یہ کتاب کامیابی کے ساتھ جوڑ دی گئی ہے۔ ."
          );
        } else {
          if (
            confirm(
              "کیا آپ سچ میں اس کتاب کو اپنے پسندیدہ میں سے ہٹانا چاہتے ہیں؟"
            )
          ) {
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
            console.log(
              "آپ کی پروفائل سے یہ کتاب کامیابی کے ساتھ ہٹا دی گئی ہے۔"
            );
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
  //handeling sahre
  //checking while render, if the data is in the loacstorage then make it's heart red else leave it grey
  useEffect(() => {
    if (window !== undefined && window.localStorage) {
      const storedData = localStorage.getItem("EBooks");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          data &&
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

  return (
    <>
      {toast}
      {insideBrowser && (data === null || data.length === 0) && (
        <div className="w-screen h-screen grid place-items-center">
          آپ کے پسندیدہ میں کوئی کتاب موجود نہیں ہیں
        </div>
      )}
      <div
        id="section"
        dir="rtl"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3"
      >
        {insideBrowser &&
          data &&
          data.map((item, index) => (
            <div className="relative" key={index}>
              <div
                className="heart cursor-pointer text-gray-500 pr-3 absolute top-0 right-0 w-[80px] max-w-[120px] h-10 flex items-center justify-center border rounded-full m-2 bg-white bg-opacity-30 backdrop-blur-sm z-10"
                onClick={(e) => handleHeartClick(item, index, `${item.id}`)}
                id={`${item.id}`}
              >
                <FontAwesomeIcon icon={faHeart} className="text-xl ml-3" />
                <span className="text-black">{`${item.fields?.likes}`}</span>
              </div>
              <Card data={item} />
            </div>
          ))}
      </div>
    </>
  );
};

export default EBooks;
