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
      "गज़लें",
      "उर्दू गज़ल",
      "गज़ल",
      "urdu ghazal hindi",
      "ghazlen hindi",
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
      title: "गज़लें - प्रसिद्ध उर्दू गज़लों का संग्रह",
      description:
        "प्रसिद्ध उर्दू कवियों की सुंदर गज़लों की खोज करें। इंटरैक्टिव सुविधाओं के साथ क्लासिकल और समकालीन गज़ल शायरी का अनुभव करें।",
      keywords: dynamicKeywords,
      url: "/HI/Ghazlen",
      image: "/metaImages/ghazlen.jpg",
      language: "hi",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Ghazlen",
        en: "https://jahan-numa.org/EN/Ghazlen",
      },
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Fallback metadata if data fetching fails
    return generatePageMetadata({
      title: "गज़लें - प्रसिद्ध उर्दू गज़लों का संग्रह",
      description:
        "प्रसिद्ध उर्दू कवियों की सुंदर गज़लों की खोज करें। इंटरैक्टिव सुविधाओं के साथ क्लासिकल और समकालीन गज़ल शायरी का अनुभव करें।",
      keywords: ["गज़लें", "उर्दू गज़ल", "गज़ल", "urdu ghazal hindi", "ghazlen hindi"],
      url: "/HI/Ghazlen",
      image: "/metaImages/ghazlen.jpg",
      language: "hi",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Ghazlen",
        en: "https://jahan-numa.org/EN/Ghazlen",
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
    name: "जहाँनुमा - गज़लें",
    description: "सुंदर उर्दू गज़लों और शायरी का संग्रह",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/Ghazlen",
    language: "hi",
  });

  // Create poetry-specific structured data
  const poetryStructuredData = {
    "@type": "CreativeWork",
    "@id": "https://jahan-numa.org/HI/Ghazlen",
    "name": "गज़ल संग्रह",
    "description": "क्लासिकल और समकालीन कवियों की उर्दू गज़लों का व्यापक संग्रह",
    "genre": "Poetry",
    "inLanguage": "hi",
    "author": {
      "@type": "Organization",
      "name": "जहाँनुमा",
      "url": "https://jahan-numa.org/HI"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "जहाँनुमा",
      "url": "https://jahan-numa.org/HI"
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