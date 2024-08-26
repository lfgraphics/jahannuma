import React from "react";
import Ashaar from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/Ghazlen"),
  title: "Ghazlen | Jahannuma",
  description: "This page has ghazlen of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/ghazlen.jpg"],
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
