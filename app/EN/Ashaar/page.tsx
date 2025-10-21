import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import AshaarComponent from "./Component";
import AshaarErrorBoundary from "./ErrorBoundary";

// Generate dynamic metadata with server-side data for English
export async function generateMetadata(): Promise<Metadata> {
  try {
    const dynamicKeywords = [
      "ashaar",
      "urdu poetry",
      "english urdu poetry",
      "poetry couplets",
      "urdu literature",
      "urdu shayari",
    ];

    return generatePageMetadata({
      title: "Ashaar - Poetry Couplets",
      description:
        "Explore beautiful Ashaar (poetry couplets) from renowned poets. Discover timeless verses in Urdu literature with likes, comments and sharing features.",
      keywords: dynamicKeywords,
      url: "/EN/Ashaar",
      image: "/metaImages/ashaar.jpg",
      language: "en",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Ashaar",
        hi: "https://jahan-numa.org/HI/Ashaar",
      },
    });
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata if data fetching fails
    return generatePageMetadata({
      title: "Ashaar - Poetry Couplets",
      description:
        "Explore beautiful Ashaar (poetry couplets) from renowned poets. Discover timeless verses in Urdu literature with likes, comments and sharing features.",
      keywords: ["ashaar", "urdu poetry", "poetry couplets", "urdu literature"],
      url: "/EN/Ashaar",
      image: "/metaImages/ashaar.jpg",
      language: "en",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Ashaar",
        hi: "https://jahan-numa.org/HI/Ashaar",
      },
    });
  }
}

// Server component with SSR data
const AshaarPage = async () => {
  let initialData = null;

  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Ashaar",
    description: "Collection of beautiful Urdu poetry and ashaar in English",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/Ashaar",
    language: "en",
  });

  // Create structured data for SEO
  const structuredDataGraph = [websiteStructuredData];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": structuredDataGraph,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <AshaarErrorBoundary>
        <AshaarComponent initialData={initialData} />
      </AshaarErrorBoundary>
    </div>
  );
};

export default AshaarPage;
