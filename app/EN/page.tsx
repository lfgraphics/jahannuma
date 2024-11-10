import Ads from "./Components/Ads";
import Branches from "@/app/Components/Branches";
import Carousel from "@/app/Components/Carosel";
import HorizontalBooks from "@/app/Components/HorizontalBooks";
import HorizontalShura from "@/app/Components/HorizontalShura";
import InstallPWAButton from "@/app/Components/InstallAppBtn";
import Mutala from "@/app/Components/Mutala";
import Quiz from "@/app/Components/Quiz";
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
