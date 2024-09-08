import Ads from "./Components/Ads";
import Branches from "./Components/Branches";
import Carousel from "./Components/Carosel";
import HorizontalBooks from "./Components/HorizontalBooks";
import HorizontalShura from "./Components/HorizontalShura";
import InstallPWAButton from "./Components/InstallAppBtn";
import Mutala from "./Components/Mutala";
import Quiz from "./Components/Quiz";
import RandCard from "./Components/RandCard";
import DoYouKnow from "./Components/doyoouknow/DoYouKnow";

export const metadata = {
  manifest: "https://nextjs.org/manifest.json",
  metadataBase: new URL("https://jahan-numa.org"),
  title:
    "اردو نظمیں، مشہور و معروف شعراء کے اشعار - جہاں نما Urdu Poetry, Urdu Shayeri of Famous Poets - Jahan Numa",
  description: "This page has ghazlen of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/logo.png"],
  },
};

export default function Home() {
  return (
    <>
      <div>
        <Carousel></Carousel>
        <RandCard />
        <HorizontalShura />
        <HorizontalBooks />
        <Branches />
        <div className="w-full flex justify-center my-3">
          <InstallPWAButton />
        </div>
        <Quiz />
        <Ads />
        <Mutala />
        <DoYouKnow />
      </div>
    </>
  );
}
