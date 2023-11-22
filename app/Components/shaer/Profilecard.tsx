import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faCalendarAlt,
//   faMapMarkerAlt,
// } from "@fortawesome/free-regular-svg-icons";
import {
  faCalendarAlt,
  faInfoCircle,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Camera } from "react-feather"; // You can replace this with your actual description component
import MuiTypography from "@mui/material/Typography"; // Import Mui Typography component
import Link from "next/link";
import Image from "next/image";

interface CardProps {
  data: {
    takhallus: string;
    dob: string;
    location: string;
    description: string;
    photo: {
      thumbnails: {
        full: {
          url: string;
          height: number;
          width: number;
        };
      }[];
    }[]
    ;
    tafseel: string;
  };
}

const Card: React.FC<CardProps> = ({ data }) => {
  const { takhallus, dob, location, photo, description } = data;

  // Function to format date (assuming dob is in MM/DD/YYYY format)
  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <Link href={`/Shaer/${takhallus.replace(" ", "-")}`}>
      <div className="rounded overflow-hidden shadow-lg mx-auto my-1">
        {/* Photo */}
        <div className="relative">
          <Image
            className="w-full h-64 object-cover object-center"
            src={photo[0].thumbnails.full.url}
            height={photo[0].thumbnails.full.height}
            width={photo[0].thumbnails.full.width}
            alt="Poet's Photo"
          />
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
          <div className="flex items-center mb-2">
            {description}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
