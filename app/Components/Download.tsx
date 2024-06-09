"use client";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import Image from "next/image";

// Define the interface for the dynamic data object
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

// Define the DynamicDownloadHandler component
const DynamicDownloadHandler: React.FC<{
  data: Shaer;
  onCancel: () => void;
}> = ({ data, onCancel }) => {
  // State for selected background image
  const [selectedImage, setSelectedImage] = useState<string | null>(
    "/backgrounds/1.jpeg"
  );

  // Ref for the download handler container
  const downloadHandlerRef = useRef<HTMLDivElement>(null);

  // Define the array of local images
  const images: string[] = [
    "/backgrounds/1.jpeg",
    "/backgrounds/2.jpeg",
    "/backgrounds/3.jpeg",
    "/backgrounds/4.jpeg",
    "/backgrounds/5.jpeg",
    "/backgrounds/6.jpeg",
    "/backgrounds/7.jpeg",
    "/backgrounds/8.jpeg",
    "/backgrounds/9.jpeg",
    "/backgrounds/10.jpeg",
    "/backgrounds/11.jpeg",
    "/backgrounds/12.jpeg",
    "/backgrounds/13.jpeg",
    "/backgrounds/14.jpeg",
    "/backgrounds/15.jpeg",
  ];

  // Function to handle image selection
  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };

  // Function to handle the download button click
  const download = () => {
    // Logic to convert the selected area to image using html2canvas
    if (downloadHandlerRef.current) {
      const options = {
        quality: 10, // Adjust this value as needed
      };

      html2canvas(
        document.getElementById("downloadArea")!,
        options as any
      ).then(function (canvas) {
        var anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        anchorTag.download = `${prompt(
          "محفوظ کرنے کے لیے تصویر کا نام درج کریں"
        )} جہاں نما کی ویبسائٹ سے.png`;
        anchorTag.href = canvas.toDataURL();
        anchorTag.target = "_blank";
        anchorTag.click();
        onCancel();
      });
    }
  };

  // accordian
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      ref={downloadHandlerRef}
      className="bg-white max-h-[90svh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  flex flex-col justify-between p-4 rounded-md shadow-lg"
    >
      {/* Display shaer information */}
      <div
        id="downloadArea"
        className="relative text-center bg-cover bg-center text-black overflow-hidden"
        style={{ backgroundImage: `url(${selectedImage || images[0]})` }}
      >
        <div className="bg-black flex flex-col justify-center bg-opacity-60 relative text-white min-w-[300px] min-h-[300px] pt-12 p-8">
          {/* {data.fields.ghazalHead.map((lin, index) => ( */}
          <div>
            <p className="text-center pl-2">
              {data.fields.ghazalHead.includes("\n")
                ? data.fields.ghazalHead.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))
                : data.fields.ghazalHead.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
            </p>
            {/* //   ))} */}
            <div className="m-4 text-sm">{data.fields.shaer}</div>
            <div className="absolute text-white text-lg top-4 right-6">
              جہاں نما
            </div>
            <div className="absolute text-white text-2xl font-bold w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-10 z-0">
              Jahan Numa
            </div>
          </div>
        </div>
      </div>

      {/* Display background image selection */}
      <div className={`flex flex-col mt-2 mb-2 items-center justify-center`}>
        <p className="text-lg">پس منظر تصویر منتخب کریں </p>
        <div className="images_wraper flex w-[280px] overflow-x-auto">
          {images.map((image, index) => (
            <Image
              width={280}
              height={280}
              key={index}
              src={image}
              alt={`Image ${index}`}
              className={`w-8 h-8 m-1 cursor-pointer transition-all duration-500 rounded-sm mt-4 ${
                image == selectedImage
                  ? "border-2 border-[#984A02] scale-125"
                  : ""
              }`}
              onClick={() => handleImageSelect(image)}
            />
          ))}
        </div>
        <div className={`accordion mb-4  w-full`}>
          <div
            className={`accordion-header ${
              isOpen && "bg-gray-200  "
            } p-3 flex items-center cursor-pointer`}
            onClick={toggleAccordion}
          >
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="text-md ml-5"
            />
            <span className="flex-1">مزید ترمیمی ٹولز </span>
          </div>
          {isOpen && (
            <div className="accordion-content p-3 border-t flex justify-around items-center">
              <div className="flex max-w-full overflow-x-auto flex-row">
                <p>Change text colour</p>
                <p>change background overlay colour</p>
                <p>custom image upload</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Display buttons for download and cancel */}
      <div className="flex justify-around mt-4">
        <button
          onClick={download}
          className="bg-[#984A02] text-white px-4 py-2 mr-2 rounded"
        >
          ڈاؤنلوڈ کریں
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          منسوخ کریں
        </button>
      </div>
    </div>
  );
};

export default DynamicDownloadHandler;
