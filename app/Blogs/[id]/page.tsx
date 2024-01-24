"use client";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import SkeletonLoader from "../../Components/SkeletonLoader";
import BlogPost from "@/app/Components/BlogPost";

interface BloggerPost {
  kind: string;
  id: string;
  blog: BloggerBlog;
  published: string;
  updated: string;
  url: string;
  selfLink: string;
  title: string;
  content: string; // You can adjust this based on your needs
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

const page = ({ params }: { params: { id: string } }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BloggerPost | null>(null);
  useEffect(() => {
    Aos.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  });
  const fetchData = async () => {
    try {
      let url = `https://www.googleapis.com/blogger/v3/blogs/7934253485914932501/posts/${params.id}?key=${process.env.NEXT_PUBLIC_Blogger_API}`;
      const response = await fetch(url, { method: "GET" });
      const result: BloggerPost = await response.json();

      setData(result);

      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch data: ${error}`);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {loading && <SkeletonLoader />}
      {!loading && (
        <div data-aos="fade-up">
          {data && (
            <>
              <div className="text-center text-4xl mt-4 mb-2 mx-5 leading-10">{data.title}</div>
              <BlogPost content={data.content} />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default page;
