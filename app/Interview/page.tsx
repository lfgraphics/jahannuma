import Content from "./Content";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/Bazmeurdu"),
  title: "Interviews | Jahannuma",
  description:
    "This page contains Interview and podcast videos of contestents interviewed by jahan numa",
  openGraph: {
    images: ["https://jahannuma.vercel.app/metaImages/interview.jpg"],
  },
};

const page = () => {
  return <Content />;
};

export default page;
