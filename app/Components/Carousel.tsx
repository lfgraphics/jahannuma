import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/swiper-bundle.min.css";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

SwiperCore.use([Navigation, Pagination]);

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Image {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
  width: number;
  height: number;
  thumbnails: {
    small: Thumbnail;
    large: Thumbnail;
    full: Thumbnail;
  };
}

interface RecordFields {
  url: String;
  mobilePhoto: Image[];
  photo: Image[];
}

interface Record {
  id: string;
  createdTime: string;
  fields: RecordFields;
}

interface DataStructure {
  records: Record[];
}

interface CarouselProps {
  records: Record[];
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{ width: number | undefined }>({
    width: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const Carousel: React.FC<CarouselProps> = ({ records }) => {
  const size = useWindowSize();
  const isMobile = size.width && size.width < 768;

  const [currentIndex, setCurrentIndex] = useState(0);

  const getImages = (record: Record) =>
    isMobile ? record.fields.mobilePhoto : record.fields.photo;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % records.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + records.length) % records.length
    );
  };

  if (records.length === 0) return null;

  const currentRecord = records[currentIndex];
  const images = getImages(currentRecord);
  return (
    <div
      className="carousel-container"
      style={{
        position: "relative",
        width: "100%",
        margin: "0 0",
      }}
    >
      <button
        onClick={handlePrev}
        className="bg-white p-3 rounded-lg ml-3 bg-opacity-75"
        style={{
          position: "absolute",
          left: "0",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <ChevronLeft strokeWidth={2.75} />
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "auto",
        }}
      >
        {images.map((image) => (
          <div key={image.id} style={{ flex: "100%" }}>
            {currentRecord.fields.url ? (
              <Link
                href={`${currentRecord.fields.url}`}
                target="_blank"
                rel="noopener noreferrer"
                passHref
              >
                <Image
                  width={image.width}
                  height={image.height}
                  src={image.url}
                  alt={image.filename}
                />
              </Link>
            ) : (
              <Image
                width={image.width}
                height={image.height}
                src={image.url}
                alt={image.filename}
              />
            )}
          </div>
        ))}
      </div>
      <button
        className="bg-white p-3 rounded-lg mr-3 bg-opacity-75"
        onClick={handleNext}
        style={{
          position: "absolute",
          right: "0",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <ChevronRight strokeWidth={2.75} />
      </button>
    </div>
  );
};

export default Carousel;
