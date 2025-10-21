import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { fetchList } from "@/lib/universal-data-fetcher";
import { getBaseIdForTable } from "@/src/lib/airtable";
import { Metadata } from "next";
import Ashaar from "./Component";
import AshaarErrorBoundary from "./ErrorBoundary";

// Generate dynamic metadata with server-side data
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch some sample data for dynamic metadata
    const ashaarData = await fetchList<any>(
      getBaseIdForTable("Ashaar"), // Ashaar base ID
      "Ashaar",
      { pageSize: 5 },
      {
        cache: true,
        fallback: null,
        throwOnError: false
      }
    );

    const dynamicKeywords = [
      "اشعار",
      "اردو شاعری",
      "poetry",
      "urdu poetry",
      "ashaar",
    ];

    // Add poet names from fetched data to keywords if available
    if (ashaarData?.records) {
      const poetNames = ashaarData.records
        .map((record: any) => record.fields?.shaer)
        .filter(Boolean)
        .slice(0, 3); // Add up to 3 poet names
      dynamicKeywords.push(...poetNames);
    }

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
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata if data fetching fails
    return generatePageMetadata({
      title: "Ashaar - اشعار",
      description:
        "Explore beautiful Ashaar (poetry couplets) from renowned poets. Discover timeless verses in Urdu literature with likes, comments and sharing features.",
      keywords: ["اشعار", "اردو شاعری", "poetry", "urdu poetry", "ashaar"],
      url: "/Ashaar",
      image: "/metaImages/ashaar.jpg",
      language: "ur",
      alternateLanguages: {
        en: "https://jahan-numa.org/EN/Ashaar",
        hi: "https://jahan-numa.org/HI/Ashaar",
      },
    });
  }
}

// Server component with SSR data
const AshaarPage = async () => {
  let initialData = null;

// For now, let's disable server-side fetching to test client-side only
// This will help us identify if the issue is with server-side or client-side fetching

  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Ashaar",
    description: "Collection of beautiful Urdu poetry and ashaar",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/Ashaar",
    language: "ur",
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
        <Ashaar initialData={initialData} />
      </AshaarErrorBoundary>
    </div>
  );
};

export default AshaarPage;