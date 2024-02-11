import Ads from "./Components/Ads";
import Branches from "./Components/Branches";
import Carousel1 from "./Components/Carosel_m";
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
  title: "اردو نظمیں، مشہور و معروف شعراء کے اشعار - جہاں نما Urdu Poetry, Urdu Shayeri of Famous Poets - Jahan Numa",
  description: "This page has ghazlen of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/logo.png"],
  },
};

export default function Home() {
  return (
    <>
      <div>
        <Carousel1></Carousel1>
        <RandCard></RandCard>
        <HorizontalBooks />
        <HorizontalShura />
        <Branches></Branches>
        <div className="w-screen flex justify-center my-3">
          <InstallPWAButton />
        </div>
        <Quiz></Quiz>
        <Ads></Ads>
        <Mutala></Mutala>
        <DoYouKnow></DoYouKnow>
      </div>
    </>
  );
}
