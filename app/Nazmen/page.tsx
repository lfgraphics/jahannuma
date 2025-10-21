import { getBuildSafeFetcher } from "@/lib/build-safe-fallbacks";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { fetchList } from "@/lib/universal-data-fetcher";
import { getBaseIdForTable } from "@/src/lib/airtable";
import { Metadata } from "next";
import Nazmen from "./Component";
import NazmenErrorBoundary from "./ErrorBoundary";

// Generate dynamic metadata with server-side data
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch some sample data for dynamic metadata
    const nazmenData = await fetchList<any>(
      getBaseIdForTable("Nazmen"), // Nazmen base ID
      "nazmen",
      { pageSize: 5 },
      { 
        cache: true, 
        fallback: null,
        throwOnError: false 
      }
    );

    const dynamicKeywords = [
      "نظمیں",
      "اردو نظم", 
      "poetry",
      "urdu nazm",
      "nazmen",
    ];

    // Add poet names from fetched data to keywords if available
    if (nazmenData?.records) {
      const poetNames = nazmenData.records
        .map((record: any) => record.fields?.shaer)
        .filter(Boolean)
        .slice(0, 3); // Add up to 3 poet names
      dynamicKeywords.push(...poetNames);
    }

    return generatePageMetadata({
      title: "Nazmen - نظمیں",
      description:
        "Explore beautiful Nazmen (Urdu poems) from renowned poets. Discover timeless verses in Urdu literature with likes, comments and sharing features.",
      keywords: dynamicKeywords,
      url: "/Nazmen",
      image: "/metaImages/nazme.jpg",
      language: "ur",
      alternateLanguages: {
        en: "https://jahan-numa.org/EN/Nazmen",
        hi: "https://jahan-numa.org/HI/Nazmen",
      },
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Fallback metadata if data fetching fails
    return generatePageMetadata({
      title: "Nazmen - نظمیں",
      description:
        "Explore beautiful Nazmen (Urdu poems) from renowned poets. Discover timeless verses in Urdu literature with likes, comments and sharing features.",
      keywords: ["نظمیں", "اردو نظم", "poetry", "urdu nazm", "nazmen"],
      url: "/Nazmen",
      image: "/metaImages/nazme.jpg",
      language: "ur",
      alternateLanguages: {
        en: "https://jahan-numa.org/EN/Nazmen",
        hi: "https://jahan-numa.org/HI/Nazmen",
      },
    });
  }
}

// Server component with SSR data
const NazmenPage = async () => {
  let initialData = null;
  let error = null;

  try {
    // Fetch initial data during SSR
    const nazmenResponse = await fetchList<any>(
      getBaseIdForTable("Nazmen"), // Nazmen base ID
      "nazmen", 
      { pageSize: 30 },
      { 
        cache: true,
        revalidate: 300000, // 5 minutes
        fallback: null,
        throwOnError: false,
        debug: process.env.NODE_ENV === 'development'
      }
    );

    if (nazmenResponse?.records) {
      initialData = nazmenResponse;
    }
  } catch (fetchError) {
    console.error("Error fetching initial Nazmen data:", fetchError);
    error = fetchError;
    
    // Try to get fallback data
    try {
      // Use build safe fetcher for fallbacks
      getBuildSafeFetcher();
      
      // Create empty fallback data structure
      initialData = { records: [], offset: undefined };
    } catch (fallbackError) {
      console.error("Error getting fallback data:", fallbackError);
    }
  }

  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Nazmen",
    description: "Collection of beautiful Urdu poetry and nazmen",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/Nazmen",
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
      <NazmenErrorBoundary>
        <Nazmen initialData={initialData} />
      </NazmenErrorBoundary>
    </div>
  );
};

export default NazmenPage;
