import React from "react";
import Link from "next/link";

const Card = ({ data }) => {
  const { fields } = data;
  const { takhallus, photo } = fields;

  return (
    <Link href={`/Shaer/${takhallus?.replace(" ", "-")}`}>
      <div className="w-[180px] h-[205px] rounded overflow-hidden shadow-[#00000080] shadow-md mx-auto my-1">
        {/* Photo */}
        <div className="relative bg-cover bg-center" style={{ backgroundImage: `url(/poets/loadingpic.gif)` }}>
          {photo ? (
            <img
              className="w-full h-52 object-cover object-center"
              src={`${photo?.[0].thumbnails?.full?.url}`}
              height={photo?.[0].thumbnails?.full?.height}
              width={photo?.[0].thumbnails?.full?.width}
              alt="Poet's Photo"
            ></img>
          ) : (
            <img
              className="w-full h-52 object-cover object-center"
              src={"/poets/nodp.jpg"}
              height={180}
              width={180}
              alt="Poet's Photo"
            ></img>
          )}
          {/* Takhallus */}
          <div className="absolute bottom-0 w-full text-center p-2 bg-black bg-opacity-75 text-white">
            {takhallus}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
