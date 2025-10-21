import Loader from "@/app/Components/Loader";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useLikeButton } from "@/hooks/useLikeButton";
import { CalendarDays, Heart, MapPin, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface IntroProps {
  data: {
    name?: string;
    takhallus: string;
    dob?: string;
    description?: string;
    location?: string;
    tafseel?: string;
    likes?: number;
    id?: string;
    photo?: {
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
    ghazalen?: boolean;
    nazmen?: boolean;
    ashaar?: boolean;
    eBooks?: boolean;
  } | null;
  currentTab?: string;
  recordId?: string;
  showLikeButton?: boolean;
  baseId?: string;
  table?: string;
  storageKey?: string;
  onLikeChange?: (args: { id: string; liked: boolean; likes: number }) => void;
}

const Intro: React.FC<IntroProps> = ({
  data,
  currentTab,
  recordId,
  showLikeButton = true,
  baseId = "appgWv81tu4RT3uRB",
  table = "Intro",
  storageKey = "Shura",
  onLikeChange
}) => {
  const [insideBrowser, setInsideBrowser] = useState(false);
  const { requireAuth, showLoginDialog, setShowLoginDialog } = useAuthGuard();

  // Like functionality
  const likeEnabled = !!(showLikeButton && (data?.id || recordId));
  const recId = (data?.id || recordId) as string | undefined;
  const like = likeEnabled && recId
    ? useLikeButton({
      baseId,
      table,
      storageKey,
      recordId: recId,
      currentLikes: Number(data?.likes || 0),
      onChange: onLikeChange,
    })
    : null;

  const handleShareClick = () => {
    try {
      if (navigator.share) {
        const title = data?.takhallus || "कवि प्रोफ़ाइल";
        const text = (data?.tafseel || "").trim();
        const origin = window.location.origin;
        const decodedPath = decodeURI(window.location.pathname);
        const currentParams = new URLSearchParams(window.location.search);
        const tab = (currentTab || currentParams.get("tab") || "").trim();
        const shareUrl = `${origin}${decodedPath}${tab ? `?tab=${tab}` : ""}`;

        navigator
          .share({
            text: `${title}\n\n${text !== "" ? `${text}\n` : ""
              }जहान नुमा वेबपेज पर मिला\nयहाँ देखें\n${shareUrl}`,
            url: shareUrl,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        console.log("Web Share API is not supported.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInsideBrowser(true);
    } else {
      setInsideBrowser(false);
    }
  }, []);

  return (
    <>
      {!data && <Loader />}
      {data && (
        <div
          dir="ltr"
          className="container mx-auto flex flex-col justify-center "
        >
          <div
            style={{ backgroundImage: `url(/poets/bg.jpg)` }}
            className="bg-cover bg-center h-32 lg:h-52 w-full"
          >
            <div
              dir="ltr"
              className="h-full w-full bg-black/70 backdrop-blur-[1px] flex items-center justify-center gap-2"
            >
              <div className="photo lg:h-32 h-24 md:h-28 lg:w-32 w-24 md:w-28 rounded-full overflow-clip border-[#984a0291] border-4 ">
                {data &&
                  insideBrowser &&
                  data.photo &&
                  data.photo.length > 0 &&
                  data.photo[0]?.thumbnails?.large ? (
                  <img
                    alt={`${data.photo[0]?.filename ?? "poet"}`}
                    src={`${data.photo[0]?.thumbnails?.large?.url ?? "/poets/nodp.jpg"
                      }`}
                    height={data.photo[0]?.thumbnails?.large?.height ?? 150}
                    width={data.photo[0]?.thumbnails?.large?.width ?? 150}
                  />
                ) : (
                  <img
                    className="object-cover object-center"
                    src={"/poets/nodp.jpg"}
                    height={150}
                    width={150}
                    alt="कवि की तस्वीर"
                  />
                )}
              </div>
              <div className="mini_intro ml-5 text-white ">
                <p className="text-4xl">{data?.takhallus}</p>
                <p className="mt-3 flex gap-2 items-baseline">
                  <span className="icon mr-2">
                    <CalendarDays color="white" size={16} />
                  </span>
                  {data?.dob && data.dob}
                </p>
                <p className="flex gap-2 items-baseline">
                  <span className="icon mr-2">
                    <MapPin color="white" size={16} />
                  </span>
                  {data?.location}
                </p>
              </div>
              <span className="mx-3 text-white font-bold">|</span>
              <div className="flex items-center gap-4">
                {likeEnabled && like && (
                  <button
                    className={`flex items-center gap-1 transition-colors duration-300 ${like.isLiked ? "text-red-400" : "text-white"
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (requireAuth("like")) like.handleLikeClick();
                    }}
                    disabled={like.isDisabled}
                    aria-disabled={like.isDisabled}
                    title={like.isLiked ? "पसंदीदा" : "पसंद करें"}
                  >
                    <Heart className="text-2xl" fill="currentColor" size={24} />
                    <span className="text-sm">{like.likesCount}</span>
                  </button>
                )}
                <div className="navs cursor-pointer" onClick={() => handleShareClick()}>
                  <Share2 color="white" className="text-2xl" size={24} />
                </div>
              </div>
              {likeEnabled && (
                <LoginRequiredDialog
                  open={showLoginDialog}
                  onOpenChange={setShowLoginDialog}
                  actionType="like"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Intro;