import Content from "./Content";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/HI/Blogs"),
  title: "ब्लॉग्स | जहाँनुमा",
  description:
    "इस पृष्ठ में जहाँनुमा द्वारा साक्षात्कार लिए गए प्रतियोगियों के साक्षात्कार और पॉडकास्ट वीडियो हैं",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/interview.jpg"],
  },
};

const page = () => {
  return <Content />;
};

export default page;
