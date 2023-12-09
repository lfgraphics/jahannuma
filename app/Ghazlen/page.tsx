import React from "react";
import Ashaar from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahannuma.vercel.app"),
  title: "Ghazlen | Jahannuma",
  description: "This page have ghazlen of all young shaers of goraphur",
  locale: "ur_IN",
  type: "website",
  alternates: {
    // canonical: '/',
    languages: {
      "en-US": "/EN/Ghazlen",
      "hi-IN": "/HI/Ghazlen",
    },
    openGraph: {
      images: ["/metaImages/ghazlen.jpg"],
    },
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
