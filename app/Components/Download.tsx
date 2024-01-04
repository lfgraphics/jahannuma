"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      quality: 1.0, // Adjust this value as needed
    };

    html2canvas(document.getElementById("downloadArea")!, options as any).then(
      function (canvas) {
        var anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        anchorTag.download = `${prompt(
          "Enter file name to save"
        )} by Jahannuma.png`;
        anchorTag.href = canvas.toDataURL();
        anchorTag.target = "_blank";
        anchorTag.click();
      }
    );
  }
};


  // Function to handle the cancel button click
  //   const cancelDownload = () => {
  //     // Hide the download handler using gsap animation
  //     gsap.to(downloadHandlerRef.current, {
  //       opacity: 0,
  //       duration: 1,
  //     });
  //   };

  //   // useEffect to show the download handler with animation on mount
  //   useEffect(() => {
  //     gsap.from(downloadHandlerRef.current, { opacity: 1, duration: 1 });
  //   }, []);

  return (
    <div
      ref={downloadHandlerRef}
      className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  flex flex-col justify-between p-4 rounded-md shadow-sm"
    >
      {/* Display shaer information */}
      <div
        id="downloadArea"
        className="text-center bg-cover bg-center w-300 h-300 text-black overflow-hidden"
        style={{ backgroundImage: `url(${selectedImage || images[0]})` }}
      >
        <div className="bg-black bg-opacity-60 relative text-white w-300 h-300 pt-12 p-8">
          {/* {data.fields.ghazalHead.map((lin, index) => ( */}
          <p className="text-center">
            {data.fields.ghazalHead.map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
          {/* //   ))} */}
          <div className="m-4 text-sm">{data.fields.shaer}</div>
        </div>
        <Image
          className="absolute top-4 right-4 opacity-70"
          src={"/logo_text.png"}
          alt="logo"
          width={50}
          height={40}
        ></Image>
      </div>

      {/* Display background image selection */}
      <div className={`flex mb-2 w-[250px] overflow-x-auto`}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Image ${index}`}
            className={`w-8 h-8 m-1 cursor-pointer rounded-sm mt-4 ${
              selectedImage == image ? "border-2 border-black scale-110" : ""
            }`}
            onClick={() => handleImageSelect(image)}
          />
        ))}
      </div>

      {/* Display buttons for download and cancel */}
      <div className="flex justify-around mt-4">
        <button
          onClick={download}
          className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
        >
          Download
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DynamicDownloadHandler;
