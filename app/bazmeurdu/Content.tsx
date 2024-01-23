"use client";
import Aos from "aos";
import React, { useEffect, useState } from "react";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import Link from "next/link";
import SkeletonLoader from "../Components/SkeletonLoader";

interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

interface PlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
}

interface PlaylistItemListResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  prevPageToken: string;
  pageInfo: PageInfo;
  items: PlaylistItem[];
}

interface Snippet {
  channelId: string;
  channelTitle: string;
  description: string;
  playlistId: string;
  position: number;
  publishedAt: string;
  resourceId: ResourceId;
  thumbnails: {
    default: Thumbnail;
    high: Thumbnail;
    maxres: Thumbnail;
    medium: Thumbnail;
    standard: Thumbnail;
  };
  title: string;
  videoOwnerChannelId: string;
  videoOwnerChannelTitle: string;
}

interface ResourceId {
  kind: string;
  videoId: string;
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Pagination {
  maxResults: number;
  nextPageToken: string | null;
}

const Content = () => {
  const [loading, setLoading] = useState(true);
  const [moreloading, setMoreLoading] = useState(true);
  const [dataItems, setDataItems] = useState<PlaylistItem[]>([]);
  const [noMoreData, setNoMoreData] = useState(false);

  const [pagination, setPagination] = useState<Pagination>({
    maxResults: 50,
    nextPageToken: null,
  });

  useEffect(() => {
    Aos.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });

  //function ot scroll to the top
  function scrollToTop() {
    if (typeof window !== undefined) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  const fetchData = async (offset: string | null) => {
    try {
      const playlistId = "PL_grvzurQrkR7PqvTofGq7IoYuG26_JRs";
      //airtable fetch url and methods
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?maxResults=50&part=snippet&playlistId=${playlistId}&key=${process.env.NEXT_PUBLIC_Youtube_API}`;

      if (offset) {
        url += `&pageToken=${offset}`;
      }
      const response = await fetch(url, { method: "GET" });
      const result: PlaylistItemListResponse = await response.json();
      const items = result.items || [];

      if (!result.nextPageToken) {
        // No more data, disable the button
        setNoMoreData(true);
        setLoading(false);
        setMoreLoading(false);
      }
      // formating result to match the mock data type for ease of development
      if (!offset) {
        setDataItems(items);
      }

      !offset && scrollToTop();
      // seting pagination depending on the response
      setPagination({
        nextPageToken: result.nextPageToken,
        maxResults: 50,
      });
      // seting the loading state to false to show the data
      setLoading(false);
      setMoreLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
      setMoreLoading(false);
    }
  };
  // fetching more data by load more data button
  const handleLoadMore = () => {
    setMoreLoading(true);
    fetchData(pagination.nextPageToken);
  };
  // Fetch the initial set of items
  useEffect(() => {
    fetchData(null);
  }, []);
  return (
    <div>
      {loading && <SkeletonLoader />}
      <h1 className="text-center text-4xl my-6">بزم اردو</h1>
      {!loading && (
        <section>
          <div
            id="section"
            dir="rtl"
            className="flex flex-col items-start justify-center md:grid lg:grid md:grid-cols-2 lg:grid-cols-3 gap-3 m-3"
          >
            {dataItems.map((cardData, index) => (
              <div dir="ltr" key={index} data-aos="fade-up">
                <Link
                  href={`https://www.youtube.com/watch?v=${cardData.snippet.resourceId.videoId}`}
                  target="_blank"
                >
                  <div className="cardBody border-gray-600 border overflow-hidden rounded-md hover:border-2">
                    <Image
                      src={cardData.snippet.thumbnails.maxres.url}
                      width={cardData.snippet.thumbnails.maxres.width}
                      height={cardData.snippet.thumbnails.maxres.height}
                      alt={`Thumbnail${cardData.snippet.position}`}
                    ></Image>
                    <div className="text-lg text-center p-2 line-clamp-2">
                      {cardData.snippet.title}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          {dataItems.length > 0 && (
            <div className="flex justify-center text-lg m-5">
              <button
                onClick={handleLoadMore}
                disabled={noMoreData}
                className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
              >
                {moreloading
                  ? "لوڈ ہو رہا ہے۔۔۔"
                  : noMoreData
                  ? "مزید ویڈیوز نہیں ہیں"
                  : "مزید ویڈیوز لوڈ کریں"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Content;
