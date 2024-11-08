// ShaerCard.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShareNodes,
  faTag,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import DynamicDownloadHandler from "./Download";
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
interface ShaerCardProps {
  page: string;
  shaerData: Shaer; // Replace Shaer with the actual type of shaerData
  index: number;
  download: boolean;
  handleCardClick: (shaerData: Shaer) => void; // Replace Shaer with the actual type
  toggleanaween: (cardId: string | null) => void;
  openanaween: string | null; // Updated type
  handleHeartClick: (shaerData: Shaer, index: number, id: string) => void; // Replace Shaer with the actual type
  handleShareClick: (shaerData: Shaer, index: number) => void; // Replace Shaer with the actual type
}

const LocalGhazalCard: React.FC<ShaerCardProps> = ({
  page,
  shaerData,
  index,
  download,
  handleCardClick,
  toggleanaween,
  openanaween,
  handleHeartClick,
  handleShareClick,
}) => {
  // const [openDownloadHandler, setOpenDownloadHandler] =
  //   useState<boolean>(false);
  const [selectedShaer, setSelectedShaer] = useState<Shaer | null>(null);

  const cancelDownload = () => {
    // Reset the selectedShaer state to null
    setSelectedShaer(null);
  };

  return (
    <div
      // data-aos={"fade-up"}
      key={index}
      id={`card${index}`}
      className="bg-white p-4 items-center rounded-sm border-b relative flex flex-col justify-between max-h-[250px]"
    >
      <Link href={`/Shaer/${shaerData.fields.shaer.replace(" ", "-")}`}>
        <h2 className="text-black text-3xl mb-4">{shaerData.fields.shaer}</h2>
      </Link>
      {shaerData.fields.ghazalHead.map((lin, index) => (
        <p
          // style={{ lineHeight: "normal" }}
          key={index}
          className="text-black  text-lg cursor-default"
          onClick={() => handleCardClick(shaerData)}
        >
          {lin}
        </p>
      ))}
      <div className="relative">
        <div
          className="anaween-container flex flex-col items-center absolute translate-y-[-7rem] overflow-y-scroll w-[90px] bg-white shadow-md transition-all duration-500 ease-in-out"
          style={{
            height: openanaween === `card${index}` ? "120px" : "0",
          }}
        >
          {shaerData?.fields?.unwan?.map((unwaan, index) => (
            <span key={index} className="text-md text-blue-500 underline p-2">
              <Link href={`/${download ? "Ashaar" : "Ghazlen"}/mozu/${unwaan}`}>
                {unwaan}
              </Link>
            </span>
          ))}
        </div>
        <button
          dir="ltr"
          className="text-[#984A02] cursor-auto mt-2 justify-start flex items-end flex-row-reverse "
          onClick={() => toggleanaween(`card${index}`)}
        >
          <span>
            :موضوعات{" "}
            <FontAwesomeIcon
              icon={faTag}
              className="ml-2 text-yellow-400 cursor-pointer"
            />
          </span>
          {
            <Link
              className="text-blue-500 underline"
              href={`/${download ? "Ashaar" : "Ghazlen"}/mozu/${
                shaerData.fields.unwan?.[0]
              }`}
            >
              {shaerData.fields.unwan?.[0]}
            </Link>
          }
          <span dir="rtl" className="cursor-auto">
            {shaerData.fields.unwan?.length > 1
              ? " ، " + (shaerData.fields.unwan?.length - 1) + " اور "
              : ""}
          </span>
        </button>
      </div>
      <div className="felx text-center icons">
        <button
          className={`m-3 text-gray-500 transition-all duration-500`}
          onClick={() => handleHeartClick(shaerData, index, `${shaerData.id}`)}
          id={`${shaerData.id}`}
        >
          <FontAwesomeIcon icon={faHeart} />{" "}
        </button>
        <button
          className="m-3"
          onClick={() => handleShareClick(shaerData, index)}
        >
          <FontAwesomeIcon icon={faShareNodes} style={{ color: "#984A02" }} />{" "}
        </button>
        <button
          className="text-[#984A02] font-semibold m-3"
          onClick={() => handleCardClick(shaerData)}
        >
          غزل پڑھیں
        </button>
        {download && (
          <button className="m-3" onClick={() => setSelectedShaer(shaerData)}>
            <FontAwesomeIcon icon={faDownload} style={{ color: "#984A02" }} />
          </button>
        )}
      </div>
      {/* openDownloadHandler && */}
      {download && selectedShaer && (
        <div className="fixed z-50 ">
          <DynamicDownloadHandler data={shaerData} onCancel={cancelDownload} />
        </div>
      )}
    </div>
  );
};

export default LocalGhazalCard;
