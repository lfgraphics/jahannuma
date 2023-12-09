import React from "react";
import Ashaar from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahannuma.vercel.app"),
  title: "Ghazlen | Jahannuma",
  description: "This page has ghazlen of all young shaers of Gorakhpur",
  locale: "ur_IN",
  type: "website",
  alternates: {
    languages: {
      "en-US": "/EN/Ghazlen",
      "hi-IN": "/HI/Ghazlen",
    },
    openGraph: {
      images: [
        {
          url: "/metaImages/ghazlen.jpg",
          alt: "Ghazlen Image Alt Text",
        },
      ],
    },
    icons: {
      icon: "/logo.png"
      // shortcut: "/shortcut-icon.png",
      // apple: "/apple-icon.png",
      // other: {
      //   rel: "apple-touch-icon-precomposed",
      //   url: "/apple-touch-icon-precomposed.png",
      // },
    },
  },
};

const page = () => {
  return (
    <div>
      <Ashaar></Ashaar>
    </div>
  );
};

export default page;
