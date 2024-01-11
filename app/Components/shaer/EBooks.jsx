import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Card from "../../Components/BookCard";
import ComponentsLoader from "./ComponentsLoader";

const EBooks = ({ takhallus }) => {
  const [dataItems, setDataItems] = useState([]); // Specify the type explicitly as Shaer[]
  const [loading, setLoading] = useState(true);
  console.log(takhallus);

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE_ID = "appXcBoNMGdIaSUyA";
      const TABLE_NAME = "E-Books";

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({writer}='${takhallus}')`;
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();

      const records = result.records || [];
      // Convert ghazal and ghazalHead fields to arrays
      const formattedRecords = result.records.map((record) => ({
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

      setDataItems(formattedRecords);
      setLoading(false);

      console.log("filtered records are", formattedRecords);
      console.log("filtered records are", dataItems);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (window !== undefined && window.localStorage) {
      const storedData = localStorage.getItem("Books");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          dataItems.forEach((shaerData, index) => {
            const shaerId = shaerData.id; // Get the id of the current shaerData

            // Check if the shaerId exists in the stored data
            const storedShaer = parsedData.find((data) => data.id === shaerId);

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
  }, [dataItems]);

  const handleHeartClick = async (shaerData, index, id) => {
    if (typeof window !== undefined && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Books");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData = existingDataJSON
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
          document.getElementById(`${id}`)?.classList.remove("text-gray-500");
          document.getElementById(`${id}`)?.classList.add("text-red-600");

          localStorage.setItem("Ghazlen", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ کتاب کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          console.log(
            "آپ کی پروفائل میں یہ کتاب کامیابی کے ساتھ جوڑ دی گئی ہے۔ ."
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
              `https://api.airtable.com/v0/appXcBoNMGdIaSUyA/E-Books`,
              {
                method: "PATCH",
                headers: updateHeaders,
                body: JSON.stringify(updateData),
              }
            );

            if (updateResponse.ok) {
              // Update local state to reflect the change in likes
              setDataItems((prevDataItems) => {
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
          document.getElementById(`${id}`)?.classList.remove("text-red-600");
          document.getElementById(`${id}`)?.classList.add("text-gray-500");

          localStorage.setItem("Ghazlen", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ کتاب کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          console.log(
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

            const updateResponse = await fetch(
              `https://api.airtable.com/v0/appXcBoNMGdIaSUyA/E-Books`,
              {
                method: "PATCH",
                headers: updateHeaders,
                body: JSON.stringify(updateData),
              }
            );

            if (updateResponse.ok) {
              // Update local state to reflect the change in likes
              setDataItems((prevDataItems) => {
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

  return (
    <>
      {loading && <ComponentsLoader />}
      {!loading && (
        <div
          id="section"
          dir="rtl"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3"
        >
          {dataItems.map((item, index) => (
            <div className="relative" key={index}>
              <div
                className="heart cursor-pointer text-gray-500 pr-3 absolute top-0 right-0 w-[80px] max-w-[120px] h-10 flex items-center justify-center border rounded-full m-2 bg-white bg-opacity-30 backdrop-blur-sm z-10"
                onClick={(e) => handleHeartClick(e, item, index, `${item.id}`)}
                id={`${item.id}`}
              >
                <FontAwesomeIcon icon={faHeart} className="text-xl ml-3" />
                <span className="text-black">{`${item.fields?.likes}`}</span>
              </div>
              <Card data={item} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EBooks;
