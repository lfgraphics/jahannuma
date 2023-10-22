import Ashaar from "./Ashaar/page";
import Carousel1 from "./Components/Carosel_m";
import RandCard from "./Components/RandCard";
// import { getAllShaers } from "./Ashaar/data";
// const shaerData = getAllShaers();
// import Carousel2 from "./Components/Carousel2";

export default function Home() {
  return (
    <>
      <Carousel1></Carousel1>
      <RandCard></RandCard>
      {/* <Ashaar data={shaerData}></Ashaar> */}
      {/* <Carousel2></Carousel2> */}
    </>
  );
}
