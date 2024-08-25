import {
  faCalendarAlt,
  faLocationDot,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

interface IntroProps {
  data: {
    name: string;
    takhallus: string;
    dob: string;
    description: string;
    location: string;
    tafseel: string;
    photo: {
      filename: string;
      id: string;
      size: number;
      url: string;
      height: number;
      width: number;
      thumbnails: {
        large: {
          url: string;
          height: number;
          width: number;
        };
        full: {
          url: string;
          height: number;
          width: number;
        };
        small: {
          url: string;
          height: number;
          width: number;
        };
      };
    }[];
    ghazalen: boolean;
    nazmen: boolean;
    ashaar: boolean;
    eBooks: boolean;
  } | null;
}

const Intro: React.FC<IntroProps> = ({ data }) => {
  const [insideBrowser, setInsideBrowser] = useState(false);
  // const [loading, setLoading] = useState(true);
  const handleShareClick = () => {
    try {
      if (navigator.share) {
        const title = data?.takhallus || "Default Title"; // Replace 'Default Title' with your desired default title
        const text = (data?.tafseel || "").trim(); // Keep multiple lines
        const decodedUrl = decodeURIComponent(window.location.href);

        navigator
          .share({
            text: `${title}\n\n${
              text !== "" ? `${text}\n` : ""
            }Found this on Jahannuma webpage\nVisit it here\n`,
            url: decodedUrl,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        console.log("Web Share API is not supported.");
      }
    } catch (error) {
      // Handle any errors that may occur when using the Web Share API
      console.error("Error sharing:", error);
    }
  };

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
    <>
      {!data && (
        <div className="min-h-full min-w-full bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700"></div>
      )}
      {data && (
        <div dir="rtl" className="container flex flex-col justify-center ">
          <div
            style={{ backgroundImage: `url(/poets/bg.jpg)` }}
            className="bg-cover bg-center h-32 lg:h-52 w-full"
          >
            <div
              dir="rtl"
              style={{ filter: "backGroundBlur(10px)" }}
              className="h-full w-full bg-black bg-opacity-70 flex items-center justify-center"
            >
              <div className="photo lg:h-32 h-24 md:h-28 lg:w-32 w-24 md:w-28 rounded-full overflow-clip border-[#984a0291] border-4 ">
                {data && insideBrowser && data.photo ? (
                  <img
                    alt={`${data.photo[0].filename}`}
                    src={`${data.photo[0].thumbnails.large.url}`}
                    height={data.photo[0].thumbnails.large.height}
                    width={data.photo[0].thumbnails.large.width}
                  ></img>
                ) : (
                  <img
                    className="object-cover object-center"
                    src={"/poets/nodp.jpg"}
                    height={150}
                    width={150}
                    alt="Poet's Photo"
                  ></img>
                )}
              </div>
              <div className="mini_intro mr-5 text-white">
                <p className="text-4xl">{data?.takhallus}</p>
                <p className="mt-3">
                  <span className="icon ml-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: "white" }}
                    />
                  </span>
                  {data?.dob && data.dob}
                  <span className="mx-3 text-white font-bold">|</span>{" "}
                  <span className="icon ml-2">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      style={{ color: "white" }}
                    />
                  </span>
                  {data?.location}
                </p>
              </div>
              <div className="navs" onClick={() => handleShareClick()}>
                <FontAwesomeIcon
                  icon={faShareAlt}
                  style={{ color: "white" }}
                  className="text-3xl ml-6"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Intro;
