"use client";
import { useParams } from "next/navigation";

const page = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const isValidYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(id);
  if (!isValidYouTubeId) {
    return (
      <div className="w-screen pt-12 px-5 ">
        <div>Invalid YouTube video ID format</div>
      </div>
    );
  }
  return (
    <div className="w-screen pt-12 px-5 ">
      <iframe
        className="w-full mb-12 h-screen aspect-auto rounded-lg overflow-hidden"
        width="380"
        height="215"
        src={`https://www.youtube.com/embed/${encodeURIComponent(id)}`}
        frameBorder="0"
        allow="picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default page;
