import Ads from "./Components/Ads";
import Branches from "./Components/Branches";
import Carousel1 from "./Components/Carosel_m";
import InstallPWAButton from "./Components/InstallAppBtn";
import Mutala from "./Components/Mutala";
import Quiz from "./Components/Quiz";
// import GoogleSearch from "./Components/GoogleSearch";
import RandCard from "./Components/RandCard";
import DoYouKnow from "./Components/doyoouknow/DoYouKnow";

export const metadata = {
  manifest: "https://nextjs.org/manifest.json",
};

export default function Home() {
  return (
    <>
      <div>
        {/* <GoogleSearch></GoogleSearch> */}
        <Carousel1></Carousel1>
        <Mutala></Mutala>
        {/* <Quiz></Quiz> */}
        <RandCard></RandCard>
        <Branches></Branches>
        <div className="w-screen flex justify-center m-3">
          <InstallPWAButton />
        </div>
        <Ads></Ads>
        <DoYouKnow></DoYouKnow>
      </div>
    </>
  );
}
