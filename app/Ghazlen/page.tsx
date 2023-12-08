import React from "react";
import Ashaar from "./Component";
export const metadata = {
  title: "Ghazlen | Jahannuma",
  description: "This page have ghazlen of all young shaers of goraphur",
  openGraph: {
    images: ["/metaImages/ghazlen.jpg"],
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
