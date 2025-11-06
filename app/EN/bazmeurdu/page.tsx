import Content from "./Content";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/Bazmeurdu"),
  title: "Bazme Urdu | Jahannuma",
  description:
    "This page contans Ghazlen videos of programms organised by jahan numa",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/bazmeurdu.jpg"],
  },
};

const page = () => {
  return <Content />;
};

export default page;
