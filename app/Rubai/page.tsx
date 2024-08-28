import React from "react";
import Ashaar from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/Rubai"),
  title: "Rubai | Jahannuma",
  description: "This page has rubai's of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/rubai.jpg"],
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
