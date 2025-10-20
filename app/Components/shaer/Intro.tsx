import React, { useEffect, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import { Bookmark } from "lucide-react";

interface IntroProps {
  data: {
    name: string;
    takhallus: string;
    dob: string;
    location: string;
    tafseel: string;
    description: string;
    photo: {
      filename: string;
      url: string;
      height: number;
      width: number;
    }[];
    ghazalen: boolean;
    ashaar: boolean;
    eBooks: boolean;
  } | null;
}

const Intro2: React.FC<IntroProps> = ({ data }) => {
  const [insideBrowser, setInsideBrowser] = useState(false);
  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Code is running in a browser
      setInsideBrowser(true);
    } else {
      // Code is running on the server
      setInsideBrowser(false);
    }
  }, []);
  return (
    <div
      dir="rtl"
      className="container flex flex-col justify-center p-5 pt-0 md:px-36 lg:px-36 dark:bg-[#2d2d2f]"
    >
      {!data && <ComponentsLoader />}
      {insideBrowser && data && (
        <div className="poet-intro text-lg">
          {data.description &&
            <div className="block mx-auto my-5 p-4 border-4 border-gray-500 bg-gray-300 text-black border-double relative shadow-lg">
              <div className="absolute -top-2 right-0">
                <Bookmark width={24} fill="#F0D586" color="#984a02" />
              </div>
              <ul>
                {data?.description?.split("\n").map((line, index) => (
                  <li data-aos="fade-up" key={index}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          }
          <ul>
            <p>
              {data.tafseel?.split("\n").map((line, index) => (
                <li data-aos="fade-up" className="my-2" key={index}>
                  {line}
                </li>
              ))}
            </p>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Intro2;
