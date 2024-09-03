import React from "react";
import Link from "next/link";

const Card = ({ data }) => {
  const { fields } = data;
  const { bookName, publishingDate, book, id } = fields;

  // Function to format date (assuming dob is in MM/DD/YYYY format)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <Link href={`/E-Books/${id}`}>
      <div className="rounded overflow-hidden shadow-lg mx-auto">
        {/* Photo */}
        <div
          //  min-w-[200px] min-h-[280px]
          className="relative bg-cover bg-center w-[200px] h-[260px]"
        >
          <img
            className="h-full w-full"
            src={`${book?.[0].thumbnails?.large?.url}`}
            height={book?.[0].thumbnails?.large?.height}
            width={book?.[0].thumbnails?.large?.width}
            alt="book's Photo"
            loading="lazy"
          ></img>
          {/* <div className="absolute bottom-0 w-full text-center p-2 bg-black bg-opacity-75 text-white">
            {bookName}
          </div> */}
        </div>
        {/* Card Content */}
        <div className="px-6">
          {/* bookName */}
          <div className="py-2">{bookName}</div>
          {/* Publishing data */}
          <div className="flex items-center mb-2">
            اشاعت: {formatDate(publishingDate)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
