import { getBuildSafeFetcher } from "@/lib/build-safe-fallbacks";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { fetchList } from "@/lib/universal-data-fetcher";
import { getBaseIdForTable } from "@/src/lib/airtable";
import { Metadata } from "next";
import Ghazlen from "./Component";
import GhazlenErrorBoundary from "./ErrorBoundary";

// Generate dynamic metadata with server-side data
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch some sample data for dynamic metadata
    const ghazlenData = await fetchList<any>(
      getBaseIdForTable("Ghazlen"), // Ghazlen base ID
      "Ghazlen",
      { pageSize: 5 },
      { 
        cache: true, 
        fallback: null,
        throwOnError: false 
      }
    );

    const dynamicKeywords = [
      "غزلیں",
      "اردو غزل",
      "ghazal",
      "urdu ghazal",
      "ghazlen",
    ];

    // Add poet names from fetched data to keywords if available
    if (ghazlenData?.records) {
      const poetNames = ghazlenData.records
        .map((record: any) => record.fields?.shaer)
        .filter(Boolean)
        .slice(0, 3); // Add up to 3 poet names
      dynamicKeywords.push(...poetNames);
    }

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
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Fallback metadata if data fetching fails
    return generatePageMetadata({
      title: "Ghazlen - غزلیں",
      description:
        "Discover beautiful Ghazals from renowned Urdu poets. Experience classical and contemporary ghazal poetry with interactive features.",
      keywords: ["غزلیں", "اردو غزل", "ghazal", "urdu ghazal", "ghazlen"],
      url: "/Ghazlen",
      image: "/metaImages/ghazlen.jpg",
      language: "ur",
      alternateLanguages: {
        en: "https://jahan-numa.org/EN/Ghazlen",
        hi: "https://jahan-numa.org/HI/Ghazlen",
      },
    });
  }
}

// Server component with SSR data
const GhazlenPage = async () => {
  let initialData = null;
  let error = null;

  try {
    // Fetch initial data during SSR
    const ghazlenResponse = await fetchList<any>(
      getBaseIdForTable("Ghazlen"), // Ghazlen base ID
      "Ghazlen", 
      { pageSize: 30 },
      { 
        cache: true,
        revalidate: 300000, // 5 minutes
        fallback: null,
        throwOnError: false,
        debug: process.env.NODE_ENV === 'development'
      }
    );

    if (ghazlenResponse?.records) {
      initialData = ghazlenResponse;
    }
  } catch (fetchError) {
    console.error("Error fetching initial Ghazlen data:", fetchError);
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
    name: "Jahannuma - Ghazlen",
    description: "Collection of beautiful Urdu ghazals and poetry",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/Ghazlen",
    language: "ur",
  });

  // Create poetry-specific structured data
  const poetryStructuredData = {
    "@type": "CreativeWork",
    "@id": "https://jahan-numa.org/Ghazlen",
    "name": "Ghazlen Collection",
    "description": "A comprehensive collection of Urdu ghazals from classical and contemporary poets",
    "genre": "Poetry",
    "inLanguage": "ur",
    "author": {
      "@type": "Organization",
      "name": "Jahannuma",
      "url": "https://jahan-numa.org"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Jahannuma",
      "url": "https://jahan-numa.org"
    }
  };

  // Create structured data for SEO
  const structuredDataGraph = [websiteStructuredData, poetryStructuredData];

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
      <GhazlenErrorBoundary>
        <Ghazlen initialData={initialData} />
      </GhazlenErrorBoundary>
    </div>
  );
};

export default GhazlenPage;