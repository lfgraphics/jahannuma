import { CalendarDays, MapPin, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Loader from "../Loader";

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
            text: `${title}\n\n${text !== "" ? `${text}\n` : ""
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

  return (
    <>
      {!data && (
        <Loader />
      )}
      {data && (
        <div dir="rtl" className="container flex flex-col justify-center ">
          <div
            style={{ backgroundImage: `url(/poets/bg.jpg)` }}
            className="bg-cover bg-center h-32 lg:h-52 w-full"
          >
            <div
              dir="rtl"
              // style={{ filter: "backGroundBlur(10px)" }}
              className="h-full w-full bg-black/70 backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <div className="photo lg:h-32 h-24 md:h-28 lg:w-32 w-24 md:w-28 rounded-full overflow-clip border-[#984a0291] border-4 ">
                {data && insideBrowser && data.photo && data.photo.length > 0 && data.photo[0]?.thumbnails?.large ? (
                  <img
                    alt={`${data.photo[0]?.filename ?? "poet"}`}
                    src={`${data.photo[0]?.thumbnails?.large?.url ?? "/poets/nodp.jpg"}`}
                    height={data.photo[0]?.thumbnails?.large?.height ?? 150}
                    width={data.photo[0]?.thumbnails?.large?.width ?? 150}
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

              <div className="mini_intro mr-5 text-white ">
                <p className="text-4xl">{data?.takhallus}</p>
                <p className="mt-3 flex gap-2 items-baseline">
                  <span className="icon ml-2">
                    <CalendarDays color="white" size={16} />
                  </span>
                  {data?.dob && data.dob}
                </p>
                <p className="flex gap-2 items-baseline">
                  <span className="icon ml-2">
                    <MapPin color="white" size={16} />
                  </span>
                  {data?.location}
                </p>
              </div>

              <span className="mx-3 text-white font-bold">|</span>{" "}

              <div className="navs" onClick={() => handleShareClick()}>
                <Share2 color="white" className="text-3xl ml-6" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Intro;
