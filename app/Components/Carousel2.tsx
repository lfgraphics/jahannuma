"use client";
import React, { useState } from "react";
import { styled } from "@mui/system";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const CarouselContainer = styled("div")({
  width: "350px",
  height: "450px",
  overflowX: "scroll",
  margin: "0 auto",
});

const CarouselItem = styled("div")({
  width: "350px",
  height: "450px",
  display: "inline-block",
  overflow: "hidden",
  borderRadius: "4px",
});

const CarouselImage = styled("img")({
  width: "100%",
  height: "100%",
  border: "2px solid #984A02",
});

const ScrollButton = styled("div")({
  position: "relative",
  top: "50%",
  // transform: "translateY(-50%)",
  width: "40px",
  height: "40px",
  backgroundColor: "#333",
  color: "#fff",
  textAlign: "center",
  lineHeight: "40px",
  cursor: "pointer",
  zIndex: 1,
});

const ScrollButtonLeft = styled(ScrollButton)({
  left: "0",
});

const ScrollButtonRight = styled(ScrollButton)({
  right: "0",
});

const images = [
  "https://ideogram.ai/api/images/direct/ZYl4IE91RpCJ_q-ZqKsTrw",
  "https://ideogram.ai/api/images/direct/8smUhEw8QqymnvHgaCTuYQ",
  "https://ideogram.ai/api/images/direct/fg28RoKYRSuVR0PS8NNomA",
];

const Carousel2: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollCarousel = (step: number) => {
    const newIndex = currentIndex + step;
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <>
      <div className="text-center">
        <h4 className="text-lg font-bold">
          JahanNuman Branches
        </h4>
      </div>
      <CarouselContainer>
        {/* Left Scroll Button   fix buttons taking the viewport center */}
        <div className="flex absolute justify-between w-[90%] h-[450px]">
          <ScrollButtonLeft onClick={() => scrollCarousel(-1)}>
            <ArrowBackIosIcon />
          </ScrollButtonLeft>
          <ScrollButtonRight onClick={() => scrollCarousel(1)}>
            <ArrowForwardIosIcon />
          </ScrollButtonRight>
        </div>
        {/* Carousel Items */}
        <CarouselItem>
          <CarouselImage
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
          />
        </CarouselItem>
        {/* Right Scroll Button   fix buttons taking the viewport center */}
      </CarouselContainer>
    </>
  );
};

export default Carousel2;
