"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { uiTexts } from "@/lib/multilingual-texts";
import Aos from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import SkeletonLoader from "../../Components/SkeletonLoader";

interface BloggerPostList {
  kind: string;
  nextPageToken: string;
  items: BloggerPost[];
}

interface BloggerPost {
  kind: string;
  id: string;
  blog: BloggerBlog;
  published: string;
  updated: string;
  url: string;
  selfLink: string;
  title: string;
  content: string;
  author: BloggerAuthor;
  replies: BloggerReplies;
}

interface BloggerBlog {
  id: string;
}

interface BloggerAuthor {
  id: string;
  displayName: string;
  url: string;
  image: BloggerImage;
}

interface BloggerImage {
  url: string;
}

interface BloggerReplies {
  totalItems: string;
  selfLink: string;
}

interface Pagination {
  maxResults: number;
  nextPageToken: string | null;
}

const Content = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [moreloading, setMoreLoading] = useState(true);
  const [dataItems, setDataItems] = useState<BloggerPost[]>([]);
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

  //function to scroll to the top
  function scrollToTop() {
    if (typeof window !== undefined) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  const fetchData = async (offset: string | null) => {
    setLoading(true);
    try {
      let url = `https://www.googleapis.com/blogger/v3/blogs/7934253485914932501/posts/?key=${process.env.NEXT_PUBLIC_Blogger_API}`;

      if (offset) {
        url += `&pageToken=${offset}`;
      }
      const response = await fetch(url, { method: "GET" });
      const result: BloggerPostList = await response.json();
      const items = result.items || [];

      if (!result.nextPageToken) {
        // No more data, disable the button
        setNoMoreData(true);
        setLoading(false);
        setMoreLoading(false);
      }
      // formatting result to match the mock data type for ease of development
      if (!offset) {
        setDataItems(items);
      }

      !offset && scrollToTop();
      // setting pagination depending on the response
      setPagination({
        nextPageToken: result.nextPageToken,
        maxResults: 50,
      });
      // setting the loading state to false to show the data
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

  function getFirstImageSrcFromContent(content: string): string | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const imgElement = doc.querySelector("img");
    if (imgElement) {
      return imgElement.getAttribute("src") || null;
    }

    return null;
  }

  const blogTitle = {
    EN: "Blogs",
    UR: "بلاگ",
    HI: "ब्लॉग्स"
  };

  const loadingText = uiTexts.messages.loading[language];
  const loadMoreText = uiTexts.buttons.loadMore[language];
  const noMoreText = {
    EN: "No more blogs available",
    UR: "مزید بلاگز دستیاب نہیں ہیں",
    HI: "कोई और ब्लॉग उपलब्ध नहीं है"
  };

  return (
    <div>
      {loading && <SkeletonLoader />}
      <h1 className="text-center text-4xl my-6">{blogTitle[language]}</h1>
      {!loading && (
        <section>
          <div
            id="section"
            dir={language === "UR" ? "rtl" : "ltr"}
            className="grid grid-cols-2 md:items-start md:grid md:grid-cols-3 lg:grid-cols-4 gap-3 m-3"
          >
            {dataItems.map((cardData, index) => (
              <div dir="ltr" key={index} data-aos="fade-up">
                <Link href={`/EN/Blogs/${cardData.id}`}>
                  <div className="cardBody w-max border-gray-600 border overflow-hidden rounded-md">
                    {(() => {
                      const src = getFirstImageSrcFromContent(cardData.content);
                      if (!src) return null;
                      const sizedSrc = src.replace(/\/[^\/]+(?=\/[^\/]+$)/, "/s1200");
                      return (
                        <img
                          src={sizedSrc}
                          alt={`blog image ${cardData.id}`}
                          className="object-cover h-auto sm:h-48 w-[180px]"
                        />
                      );
                    })()}
                    <div className="text-lg text-center p-2">
                      {cardData.title}
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
                  ? loadingText
                  : noMoreData
                    ? noMoreText[language]
                    : loadMoreText}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Content;