import React from "react";
import Page from "./Component";
// import PdfViewer from "../Components/PdfKitPdfViwer";
export const metadata = {
  metadataBase: new URL("https://jahannuma.vercel.app/Shaer"),
  title: "E-Books | Jahannuma",
  description: "This page has book data of all young shaers of Goraphur",
  openGraph: {
    images: ["https://jahannuma.vercel.app/metaImages/ebooks.jpg"],
  },
};

const page = () => {
  return (
    <div>
      <Page />
      {/* <PdfViewer />  */}
    </div>
  );
};

export default page;
