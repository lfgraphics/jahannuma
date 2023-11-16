import Image from "next/image";
import React, { useEffect, useState } from "react";

interface IntroProps {
  data: {
    name: string;
    takhallus: string;
    dob: string;
    location: string;
    tafseel: string;
    photo: {
      filename: string;
      url: string;
      height: number;
      width: number;
    }[];
  } | null;
}

const Intro: React.FC<IntroProps> = ({ data }) => {
  const [insideBrowser, setInsideBrowser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Code is running in a browser
      setInsideBrowser(true);
    } else {
      // Code is running on the server
      setInsideBrowser(false);
    }
  }, []);

  console.log(data);
  return (
    <div dir="rtl" className="container p-7">
      <h1 className="text-3xl font-bold mb-4">انک کے بارے میں</h1>
      {data && insideBrowser && (
        <div className="poet-intro">
          {data && insideBrowser && data.photo?.length > 0 && (
            <Image
              alt={data.photo[0].filename}
              src={data.photo[0].url}
              height={data.photo[0].height}
              width={data.photo[0].width}
              loading="lazy" // Add lazy loading
            />
          )}

          <p>
            <strong>نام:</strong> {data.name}
          </p>
          <p>
            <strong>تخلس:</strong> {data.takhallus}
          </p>
          <p>
            <strong>تاریخ پیدائش:</strong> {data.dob}
          </p>
          <p>
            <strong>مقام:</strong> {data.location}
          </p>
          <p>
            <strong>مزید:</strong>
            <ul>
              {data.tafseel?.split("\n").map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </p>

          {/* Add more information as needed */}
        </div>
      )}
    </div>
  );
};

export default Intro;
