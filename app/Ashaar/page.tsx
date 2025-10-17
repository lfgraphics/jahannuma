import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Ashaar from "./Component";

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const dynamicKeywords = [
    "اشعار",
    "اردو شاعری",
    "poetry",
    "urdu poetry",
    "ashaar",
  ];

  return generatePageMetadata({
    title: "Ashaar - اشعار",
    description:
      "Explore beautiful Ashaar (poetry couplets) from renowned poets. Discover timeless verses in Urdu literature with likes, comments and sharing features.",
    keywords: dynamicKeywords,
    url: "/Ashaar",
    image: "/metaImages/ashaar.jpg",
    language: "ur",
    alternateLanguages: {
      en: "https://jahan-numa.org/EN/Ashaar",
      hi: "https://jahan-numa.org/HI/Ashaar",
    },
  });
}

// Server component with SSR data
const AshaarPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Ashaar",
    description: "Collection of beautiful Urdu poetry and ashaar",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/Ashaar",
    language: "ur",
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [websiteStructuredData],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Ashaar />
    </div>
  );
};

export default AshaarPage;