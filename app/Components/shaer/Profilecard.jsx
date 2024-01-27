import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";

const Card = ({ data }) => {
  const { fields } = data;
  const { takhallus, dob, location, photo, tafseel } = fields;

  // Function to format date (assuming dob is in MM/DD/YYYY format)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <Link href={`/Shaer/${takhallus?.replace(" ", "-")}`}>
      <div className="w-[180px] sm:w-[240px] rounded overflow-hidden shadow-lg mx-auto my-1">
        {/* Photo */}
        <div
          className="relative bg-cover bg-center"
          style={{ backgroundImage: `url(/poets/loadingpic.gif)` }}
        >
          {photo ? (
            <Image
              className="w-full h-64 object-cover object-center"
              src={photo?.[0].thumbnails?.full?.url}
              height={photo?.[0].thumbnails?.full?.height}
              width={photo?.[0].thumbnails?.full?.width}
              alt="Poet's Photo"
            />
          ) : (
            <Image
              className="w-full h-64 object-cover object-center"
              src={"/poets/nodp.jpg"}
              height={600}
              width={600}
              alt="Poet's Photo"
            />
          )}
          {/* Takhallus */}
          <div className="absolute bottom-0 w-full text-center p-2 bg-black bg-opacity-75 text-white">
            {takhallus}
          </div>
        </div>
        {/* Card Content */}
        <div className="px-6 py-4">
          {/* Date of Birth */}
          <div className="date_location">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="ml-2 text-gray-600"
              />
              {formatDate(dob)}
            </div>
            {/* Location */}
            <div className="flex items-center mb-2">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="ml-2 text-gray-600"
              />
              {location}
            </div>
          </div>

          {/* Description Icon */}
          {/* <div className="flex items-center mb-2">{tafseel}</div> */}
        </div>
      </div>
    </Link>
  );
};

export default Card;
