import React from "react";
import Page from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/HI/Shaer"),
  title: "शायर | जहाँनुमा",
  description: "इस पृष्ठ में गोरखपुर के सभी युवा शायरों का पेन डेटा है",
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
