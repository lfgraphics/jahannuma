import React from "react";
import Link from "next/link";
import Image from "next/image";

const Card = ({ data }) => {
  const { fields } = data;
  const { bookName, publishingDate, writer, book, desc, id } = fields;

  // Function to format date (assuming dob is in MM/DD/YYYY format)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <Link href={`/E-Books/${id}`}>
      <div className="rounded overflow-hidden shadow-lg mx-auto my-1">
        {/* Photo */}
        <div
          className="relative bg-cover bg-center min-w-[200px] min-h-[300px]"
          style={{
            backgroundImage: `url(/poets/loadingpic.gif)`,
          }}
        >
          <Image
            className="h-full w-full"
            src={book?.[0].thumbnails?.large?.url}
            height={book?.[0].thumbnails?.large?.height}
            width={book?.[0].thumbnails?.large?.width}
            alt="Poet's Photo"
            loading="lazy"
          />
          {/* <div className="absolute bottom-0 w-full text-center p-2 bg-black bg-opacity-75 text-white">
            {bookName}
          </div> */}
        </div>
        {/* Card Content */}
        <div className="px-6 py-4">
          {/* bookName */}
          <div className="mb-2">{bookName}</div>
          {/* writer */}
          <div className="flex items-center mb-2">{writer}</div>
          {/* Publishing data */}
          <div className="date_location">
            <div className="flex items-center mb-2">
              {formatDate(publishingDate)}
            </div>
          </div>
          {/* Description */}
          <div className="date_location">
            <div className="text-center mb-2">{desc}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
