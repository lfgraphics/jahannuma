import Ashaar from "./Ashaar/page";
import Branches from "./Components/Branches";
import Carousel1 from "./Components/Carosel_m";
import RandCard from "./Components/RandCard";
// import { getAllShaers } from "./Ashaar/data";
// const shaerData = getAllShaers();
// import Carousel2 from "./Components/Carousel2";

export default function Home() {
  return (
    <>
    <div className="bg-white text-black">
      <Carousel1></Carousel1>
      <RandCard></RandCard>
      <Branches></Branches>
    </div>
    </>
  );
}
