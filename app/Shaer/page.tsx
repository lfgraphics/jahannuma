import React from "react";
import Page from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahannuma.vercel.app/Shaer"),
  title: "Shu'ra | Jahannuma",
  description: "This page has pen data of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahannuma.vercel.app/metaImages/shu'ra.jpg"],
  },
};

const page = () => {
  return (
    <div>
      <Page />
    </div>
  );
};

export default page;
