import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Ghazlen from "./Component";

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const dynamicKeywords = [
    "غزلیں",
    "اردو غزل",
    "ghazal",
    "urdu ghazal",
    "ghazlen",
  ];

  return generatePageMetadata({
    title: "Ghazlen - غزلیں",
    description:
      "Discover beautiful Ghazals from renowned Urdu poets. Experience classical and contemporary ghazal poetry with interactive features.",
    keywords: dynamicKeywords,
    url: "/Ghazlen",
    image: "/metaImages/ghazlen.jpg",
    language: "ur",
    alternateLanguages: {
      en: "https://jahan-numa.org/EN/Ghazlen",
      hi: "https://jahan-numa.org/HI/Ghazlen",
    },
  });
}

// Server component with SSR data
const GhazlenPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Ghazlen",
    description: "Collection of beautiful Urdu ghazals and poetry",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/Ghazlen",
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
      <Ghazlen />
    </div>
  );
};

export default GhazlenPage;