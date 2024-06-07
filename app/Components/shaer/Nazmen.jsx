import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";

const Nazmen = ({ takhallus }) => {
  const [dataItems, setDataItems] = useState([]); // Specify the type explicitly as Shaer[]
  const [loading, setLoading] = useState(true);
  //snackbar
  const [toast, setToast] = useState(null);
  const [hideAnimation, setHideAnimation] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  //function ot show toast
  const showToast = (msgtype, message) => {
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

  console.log(takhallus);

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE_ID = "app5Y2OsuDgpXeQdz";
      const TABLE_NAME = "nazmen";

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({shaer}='${takhallus}')`;
      console.log(takhallus);
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();

      console.log(response);
      const records = result.records || [];
      console.log(records);
      // Convert ghazal and ghazalHead fields to arrays
      const formattedRecords = records.map((record) => ({
        ...record,
        fields: {
          ...record.fields,
          ghazalHead: record.fields.displayLine.split("\n"),
          id: record.fields.id,
        },
      }));

      setDataItems(formattedRecords);
      console.log(records);
      console.log(formattedRecords);
      setLoading(false);

      // console.log(filteredRecord)
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
      const storedData = localStorage.getItem("Nazmen");
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

  const [heartColors, setHeartColors] = useState([]);
  const handleHeartClick = async (shaerData, index, id) => {
    if (typeof window !== undefined && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Nazmen");

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

          localStorage.setItem("Nazmen", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          console.log(
            "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔ ."
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
              `https://api.airtable.com/v0/app5Y2OsuDgpXeQdz/nazmen`,
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

          localStorage.setItem("Nazmen", updatedDataJSON);

          // Optionally, you can update the UI or show a success message
          showToast(
            "invalid",
            "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔"
          );
          console.log("آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔");
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
              `https://api.airtable.com/v0/app5Y2OsuDgpXeQdz/nazmen`,
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

  const handleShareClick = async (shaerData, index) => {
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.fields.shaer, // Use the shaer's name as the title
            text:
              shaerData.fields.ghazalHead.map((line) => line).join("\n") +
              `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `, // Join ghazalHead lines with line breaks
            url: `${window.location.href + "/" + shaerData.id}`, // Get the current page's URL
          })

          .then(() => console.info("Successful share"))
          .catch((error) => console.error("Error sharing", error));
        try {
          // Make API request to update the record's "Likes" field
          const updatedShares = shaerData.fields.shares + 1;
          const updateData = {
            records: [
              {
                id: shaerData.id,
                fields: {
                  shares: updatedShares,
                },
              },
            ],
          };

          const updateHeaders = {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
            "Content-Type": "application/json",
          };

          const updateResponse = await fetch(
            `https://api.airtable.com/v0/app5Y2OsuDgpXeQdz/nazmen`,
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
              updatedDataItems[index].fields.shares = updatedShares;
              return updatedDataItems;
            });
          } else {
            console.error(`Failed to update shares: ${updateResponse.status}`);
          }
        } catch (error) {
          console.error("Error updating shres:", error);
        }
      } else {
        console.warn("Web Share API is not supported.");
      }
    } catch (error) {
      // Handle any errors that may occur when using the Web Share API
      console.error("Error sharing:", error);
    }
  };

  return (
    <div>
      {loading && <ComponentsLoader />}
      {dataItems.map((shaerData, index) => {
        return (
          <div
            key={index}
            id={`card${index}`}
            className="bg-white rounded-sm border-b relative flex flex-col justify-between m-5 pt-0 md:mx-36 lg:mx-36"
          >
            <div className="flex justify-between items-center">
              <div className="mr-5">
                <Link href={"/Nazmen/" + shaerData.id}>
                  <p className="text-2xl mb-3 text-[#984A02]">
                    {shaerData.fields.unwan}
                  </p>
                  {shaerData.fields.ghazalHead.map((lin, index) => (
                    <p
                      style={{ lineHeight: "normal" }}
                      key={index}
                      className="text-black line-normal text-xl"
                    >
                      {lin}
                    </p>
                  ))}
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div
                  id={`${shaerData.id}`}
                  className="btn ml-5 text-gray-500 transition-all duration-500 text-lg"
                  onClick={() =>
                    handleHeartClick(shaerData, index, `${shaerData.id}`)
                  }
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    style={{ color: heartColors[index] }}
                  />
                </div>
                <button
                  className="m-3"
                  onClick={() => handleShareClick(shaerData, index)}
                >
                  <FontAwesomeIcon
                    icon={faShareNodes}
                    style={{ color: "#984A02" }}
                  />{" "}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Nazmen;
