"use client";
import { useParams } from "next/navigation";

const page = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  // Validate YouTube video ID format (basic sanitization)
  const isValidYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(id);
  const safeId = isValidYouTubeId ? id : "";

  return (
    <div className="w-screen pt-12 px-5 ">
      {safeId ? (
        <iframe
          className="w-full mb-12 h-screen aspect-auto rounded-lg overflow-hidden border-0"
          width="380"
          height="215"
          src={`https://www.youtube.com/embed/${safeId}`}
          title={`YouTube video ${safeId}`}
          allow="picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="w-full mb-12 h-screen flex items-center justify-center bg-gray-100 rounded-lg">
          <p>Invalid video ID</p>
        </div>
      )}
    </div>
  );
};

export default page;
