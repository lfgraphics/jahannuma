import React from "react";
import Ashaar from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahannuma.vercel.app/Nazmen"),
  title: "Nazmen | Jahannuma",
  description: "This page has nazmen of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/nazme.jpg"],
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
