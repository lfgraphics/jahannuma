import React from "react";
import Page from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/Shaer"),
  title: "Shu'ra | Jahannuma",
  description: "This page has pen data of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/shu'ra.jpg"],
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
