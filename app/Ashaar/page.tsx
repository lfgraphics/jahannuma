import React from "react";
import Ashaar from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahannuma.vercel.app/Ashaar"),
  title: "Ashaar | Jahannuma",
  description: "This page has ashaar of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahannuma.vercel.app/metaImages/ashaar.jpg"],
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
