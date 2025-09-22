"use client";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  // YouTube video ID validation (11 characters, alphanumeric + underscore/hyphen)
  const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (!id || !youtubeIdRegex.test(id)) {
    return <div className="w-screen pt-12 px-5">Invalid video ID</div>;
  }

  return (
    <div className="w-screen pt-12 px-5">
      <iframe
        className="w-full mb-12 h-screen aspect-auto rounded-lg overflow-hidden"
        width="380"
        height="215"
        src={`https://www.youtube.com/embed/${id}`}
        frameBorder="0"
        allow="picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default Page;
