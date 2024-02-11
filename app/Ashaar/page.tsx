import React from "react";
import Ashaar from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/Ashaar"),
  title: "Ashaar | Jahannuma",
  description: "This page has ashaar of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/ashaar.jpg"],
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
