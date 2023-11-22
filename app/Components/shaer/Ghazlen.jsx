import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Ghazlen = ({ takhallus }) => {
  const [dataItems, setDataItems] = useState([]); // Specify the type explicitly as Shaer[]

  console.log(takhallus);

  const fetchData = async () => {
    try {
      const API_KEY =
        "patyHB0heKhiIC1GW.010be231355721357449b8a2ea7a11e38534e329e517722b42090e0d87fd7946";
      const BASE_ID = "appvzkf6nX376pZy6";
      const TABLE_NAME = "Ghazlen";

      let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({shaer}='${takhallus}')`;
      const headers = {
        Authorization: `Bearer ${API_KEY}`,
      };

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();

      const records = result.records || [];
      // Convert ghazal and ghazalHead fields to arrays
      const formattedRecords = records.map((record) => ({
        ...record,
        fields: {
          ...record.fields,
          ghazalHead: record.fields.ghazalHead.split("\n"),
          id: record.fields.id,
        },
      }));

      setDataItems(formattedRecords);
      console.log(formattedRecords);
      // setLoading(false);

      // console.log(filteredRecord)
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      // setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [heartColors, setHeartColors] = useState([]);
  const handleClick = (index) => {
    // Create a copy of the heartColors array
    const updatedColors = [...heartColors];
    // Toggle the color for the clicked heart
    updatedColors[index] = updatedColors[index] === "grey" ? "red" : "grey";
    // Update the state with the new colors
    setHeartColors(updatedColors);
  };

  return (
    <div>
      {dataItems.map((shaerData, index) => {
        return (
          <div
            key={index}
            id={`card${index}`}
            className="bg-white rounded-sm border-b relative flex flex-col justify-between m-5 pt-0 md:mx-36 lg:mx-36"
          >
            <div className="flex justify-between items-center">
              <div className="mr-5">
                <Link href={"/Ghazlen/" + shaerData.id}>
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
              <div
                className="btn ml-5 text-gray-500 transition-all duration-500 text-lg"
                onClick={() => handleClick(index)}
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  style={{ color: heartColors[index] }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ghazlen;
