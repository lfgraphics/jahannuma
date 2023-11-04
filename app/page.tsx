import Ads from "./Components/Ads";
import Branches from "./Components/Branches";
import Carousel1 from "./Components/Carosel_m";
import GoogleSearch from "./Components/GoogleSearch";
import RandCard from "./Components/RandCard";
import DoYouKnow from "./Components/doyoouknow/DoYouKnow";

export default function Home() {
  return (
    <>
      <div >
        <GoogleSearch></GoogleSearch>
        <Carousel1></Carousel1>
        <RandCard></RandCard>
        <Branches></Branches>
        <Ads></Ads>
        <DoYouKnow></DoYouKnow>
      </div>
    </>
  );
}
