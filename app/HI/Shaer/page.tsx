import Page from "./Component";

export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/HI/Shaer"),
  title: "कवि | जहाननुमा - उर्दू कवियों की खोज करें",
  description: "प्रसिद्ध उर्दू कवियों के जीवन और कार्यों का अन्वेषण करें। उनकी कविता, जीवनी और उर्दू साहित्य में योगदान की खोज करें।",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/shaer.jpg"],
  },
};

const Shaer = () => {
  return (
    <div>
      <Page />
    </div>
  );
};

export default Shaer;
