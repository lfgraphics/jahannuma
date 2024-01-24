import Content from "./Component";
export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/Bazmeurdu"),
  title: "Bazme Hindi | Jahannuma",
  description:
    "This page contans Ghazlen videos of programms organised by jahan numa",
  openGraph: {
    images: ["https://jahannuma.vercel.app/metaImages/bazmeurdu.jpg"],
  },
};

const page = () => {
  return <Content />;
};

export default page;
