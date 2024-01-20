import React, { useEffect, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";

interface IntroProps {
  data: {
    name: string;
    takhallus: string;
    dob: string;
    location: string;
    tafseel: string;
    description: string[];
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
  });
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
      className="container flex flex-col justify-center p-5 pt-0 md:px-36 lg:px-36"
    >
      {!data && <ComponentsLoader />}
      {insideBrowser && data && (
        <div className="poet-intro text-lg">
          <p>
            <strong>نام:</strong> {data.name}
          </p>

          <p>
            <strong>مزید:</strong>
            <ul>
              {data.tafseel?.split("\n").map((line, index) => (
                <li data-aos="fade-up" key={index}>
                  {line}
                </li>
              ))}
            </ul>
            <div className="block mx-auto">
              {data.description.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </p>
        </div>
      )}
    </div>
  );
};

export default Intro2;
