"use client";
import {
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Carousel as ShadcnCarousel,
} from "@/components/ui/carousel";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import Loader from "./Loader";

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}
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
  url: string;
  photo: Image[];
  mobilePhoto: Image[];
}
interface Record {
  id: string;
  createdTime: string;
  fields: RecordFields;
}
interface DataStructure {
  records: Record[];
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

const fetcher = async (url: string) => {
  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
  };
  const response = await fetch(url, { method: "GET", headers });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const Carousel: React.FC = () => {
  const size = useWindowSize();
  const { getClientBaseId } = require("@/lib/airtable-client-utils");
  const BASE_ID = getClientBaseId("CAROUSEL");
  const TABLE_NAME = "Main Carousel";
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

  // Auto-advance state management
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  // Use SWR to handle data fetching, caching, and revalidation
  const { data, error } = useSWR(url, fetcher, {
    revalidateOnFocus: false, // Disable revalidation on focus
    revalidateOnReconnect: false, // Disable revalidation on reconnect
    refreshInterval: 0, // Disable polling entirely
    dedupingInterval: 60000, // Dedupes requests within 60 seconds (default: 2 seconds)
  });

  // Auto-advance functionality
  useEffect(() => {
    if (!carouselApi || isUserInteracting) return;

    const startAutoAdvance = () => {
      autoAdvanceRef.current = setInterval(() => {
        carouselApi.scrollNext();
      }, 5000); // 5 seconds
    };

    const stopAutoAdvance = () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
    };

    // Start auto-advance
    startAutoAdvance();

    // Listen for user interactions to pause auto-advance
    const handleUserInteraction = () => {
      setIsUserInteracting(true);
      stopAutoAdvance();

      // Resume auto-advance after 10 seconds of no interaction
      setTimeout(() => {
        setIsUserInteracting(false);
      }, 10000);
    };

    // Add event listeners for user interactions
    carouselApi.on('pointerDown', handleUserInteraction);
    carouselApi.on('select', (api: any) => {
      // Only pause if the selection was triggered by user interaction
      // We can detect this by checking if the selection happened during auto-advance
      if (!autoAdvanceRef.current) {
        handleUserInteraction();
      }
    });

    // Cleanup function
    return () => {
      stopAutoAdvance();
      if (carouselApi) {
        carouselApi.off('pointerDown', handleUserInteraction);
        carouselApi.off('select', handleUserInteraction);
      }
    };
  }, [carouselApi, isUserInteracting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
      }
    };
  }, []);

  // Error handling and loading state
  if (error) return <div>Failed to load data: {error.message}</div>;
  if (!data) return <Loader />;

  const records = data.records || [];

  const isMobile = size.width && size.width < 768;

  function getImages(record: Record) {
    const img = isMobile ? record.fields.mobilePhoto?.[0] : record.fields.photo?.[0];
    return img;
  }

  return (
    <div>
      <ShadcnCarousel
        opts={{
          loop: true,
          align: "start",
        }}
        setApi={setCarouselApi}
        className="w-full"
      >
        <CarouselContent className="h-[210px] sm:h-[310px] md:h-[210px] lg:h-[280px] xl:h-[390px] 2xl:h-[450px]">
          {records.map((record: Record, index: number) => (
            <CarouselItem key={record.id || index} className="relative">
              {record.fields.url ? (
                <Link
                  href={{ pathname: `${record.fields.url}` }}
                  target="_blank"
                  rel="noopener noreferrer"
                  passHref
                  className="block h-full w-full"
                >
                  <img
                    width={`${getImages(record)?.width ?? 0}`}
                    height={`${getImages(record)?.height ?? 0}`}
                    src={`${getImages(record)?.url ?? ""}`}
                    alt={`${getImages(record)?.filename ?? ""}`}
                    className="h-full w-full object-cover"
                  />
                </Link>
              ) : (
                <img
                  width={getImages(record)?.width ?? 0}
                  height={getImages(record)?.height ?? 0}
                  src={`${getImages(record)?.url ?? ""}`}
                  alt={`${getImages(record)?.filename ?? ""}`}
                  className="h-full w-full object-cover"
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="left-4"
          onClick={() => {
            setIsUserInteracting(true);
            setTimeout(() => setIsUserInteracting(false), 10000);
          }}
        />
        <CarouselNext
          className="right-4"
          onClick={() => {
            setIsUserInteracting(true);
            setTimeout(() => setIsUserInteracting(false), 10000);
          }}
        />
        <CarouselIndicators />
      </ShadcnCarousel>
    </div>
  );
};

export default Carousel;
