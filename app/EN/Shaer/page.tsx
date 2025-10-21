import Page from "./Component";

export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/EN/Shaer"),
  title: "Poets | Jahannuma - Discover Urdu Poets",
  description: "Explore the lives and works of renowned Urdu poets. Discover their poetry, biography, and literary contributions to Urdu literature.",
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
