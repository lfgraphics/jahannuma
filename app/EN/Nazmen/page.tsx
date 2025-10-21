import { getBuildSafeFetcher } from "@/lib/build-safe-fallbacks";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { fetchList } from "@/lib/universal-data-fetcher";
import { getBaseIdForTable } from "@/src/lib/airtable";
import { Metadata } from "next";
import NazmenComponent from "./Component";
import NazmenErrorBoundary from "./ErrorBoundary";

// Generate dynamic metadata with server-side data for English
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
      "poems",
      "english poetry",
      "urdu poetry in english",
      "nazmen",
      "poetry collection",
    ];

    // Add poet names from fetched data to keywords if available
    if (nazmenData?.records) {
      const poetNames = nazmenData.records
        .map((record: any) => record.fields?.enShaer || record.fields?.shaer)
        .filter(Boolean)
        .slice(0, 3); // Add up to 3 poet names
      dynamicKeywords.push(...poetNames);
    }

    return generatePageMetadata({
      title: "Nazmen - English Poetry Collection",
      description:
        "Explore beautiful Nazmen (poems) from renowned poets in English. Discover timeless verses in literature with likes, comments and sharing features.",
      keywords: dynamicKeywords,
      url: "/EN/Nazmen",
      image: "/metaImages/nazme.jpg",
      language: "en",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Nazmen",
        hi: "https://jahan-numa.org/HI/Nazmen",
      },
    });
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata if data fetching fails
    return generatePageMetadata({
      title: "Nazmen - English Poetry Collection",
      description:
        "Explore beautiful Nazmen (poems) from renowned poets in English. Discover timeless verses in literature with likes, comments and sharing features.",
      keywords: ["poems", "english poetry", "urdu poetry in english", "nazmen", "poetry collection"],
      url: "/EN/Nazmen",
      image: "/metaImages/nazme.jpg",
      language: "en",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Nazmen",
        hi: "https://jahan-numa.org/HI/Nazmen",
      },
    });
  }
}

// Server component with SSR data for English language
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
    name: "Jahannuma - Nazmen in English",
    description: "Collection of beautiful poetry and nazmen in English",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/EN/Nazmen",
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
      <NazmenErrorBoundary>
        <NazmenComponent initialData={initialData} language="EN" />
      </NazmenErrorBoundary>
    </div>
  );
};

export default NazmenPage;
