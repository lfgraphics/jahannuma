import React from "react";
import Ashaar from "./Component";
export const metadata = {
  title: "Ghazlen | Jahannuma",
  description: "This page has ghazlen of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahannuma.vercel.app/metaImages/ghazlen.jpg"],
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
