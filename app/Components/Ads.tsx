"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAirtableList } from "@/hooks/useAirtableList";
import { ADS_BASE, ADS_TABLE } from "@/lib/airtable-constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { AirtableRecord } from "@/app/types";

interface AdRecord {
  url?: string;
  photo?: { url?: string }[];
  unwan?: string;
  enUnwan?: string;
  hiUnwan?: string;
  text?: string;
  enText?: string;
  hiText?: string;
  background?: string;
}

// Fallback static data when Airtable is not available
const fallbackAdsData = [
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://codvista.com",
    title: "CodVista",
    text: "Check out our portfolio",
  },
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://codvista.com",
    title: "Services",
    text: "Explore our services",
  },
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://codvista.com",
    title: "Portfolio",
    text: "View our work",
  },
  {
    imageUrl: "/ads/codvista.jpg",
    redirectUrl: "https://codvista.com",
    title: "Contact",
    text: "Get in touch",
  },
];

const Ads: React.FC = () => {
  const { records, isLoading, error } = useAirtableList<AirtableRecord<AdRecord>>(ADS_BASE, ADS_TABLE, { pageSize: 30 });

  const adsData = useMemo(() => {
    // If there's an error or no records, use fallback data
    if (error || !records || records.length === 0) {
      return fallbackAdsData;
    }

    return records.map(record => {
      // Validate URL - must be a complete valid URL
      const rawUrl = record.fields.url || "";
      const isValidUrl = rawUrl &&
        (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) &&
        rawUrl.length > 8 &&
        !rawUrl.endsWith('://');

      return {
        imageUrl: record.fields.photo?.[0]?.url || "/ads/default.jpg",
        redirectUrl: isValidUrl ? rawUrl : "",
        title: record.fields.unwan || record.fields.enUnwan || record.fields.hiUnwan || "",
        text: record.fields.text || record.fields.enText || record.fields.hiText || "",
      };
    });
  }, [records, error]);

  if (isLoading && !error) {
    return (
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 p-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] lg:w-[400px] h-[200px] md:h-[220px] lg:h-[240px] bg-gray-200 animate-pulse rounded-md"
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-3 p-3">
        {adsData.map((ad, index) => {
          const AdContent = (
            <div className="flex-shrink-0 w-full sm:w-[320px] md:w-[350px] lg:w-[400px] shadow-md rounded-md overflow-hidden bg-background">
              <div className="w-full h-[70%] overflow-hidden">
                <img
                  src={ad.imageUrl}
                  alt={ad.title || `Ad ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {ad.title && (
                <div className="p-3 h-[30%] flex items-center justify-center">
                  <h3 
                    className="text-sm md:text-base font-medium text-gray-800 text-center overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {ad.title}
                  </h3>
                </div>
              )}
            </div>
          );

          return ad.redirectUrl ? (
            <Link 
              href={ad.redirectUrl} 
              key={index} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block"
            >
              {AdContent}
            </Link>
          ) : (
            <div key={index}>
              {AdContent}
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default Ads;
