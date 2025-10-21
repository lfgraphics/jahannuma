import { getBuildSafeFetcher } from "@/lib/build-safe-fallbacks";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { fetchList } from "@/lib/universal-data-fetcher";
import { Metadata } from "next";
import GhazlenComponent from "./Component";
import GhazlenErrorBoundary from "./ErrorBoundary";

// Generate dynamic metadata with server-side data for Hindi
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch some sample data for dynamic metadata
    const ghazlenData = await fetchList<any>(
      "appvzkf6nX376pZy6", // Ghazlen base ID
      "Ghazlen",
      { pageSize: 5 },
      {
        cache: true,
        fallback: null,
        throwOnError: false
      }
    );

    const dynamicKeywords = [
      "ग़ज़लें",
      "हिंदी ग़ज़ल",
      "उर्दू शायरी हिंदी में",
      "ghazlen",
      "कविता संग्रह",
    ];

    // Add poet names from fetched data to keywords if available
    if (ghazlenData?.records) {
      const poetNames = ghazlenData.records
        .map((record: any) => record.fields?.hiShaer || record.fields?.shaer)
        .filter(Boolean)
        .slice(0, 3); // Add up to 3 poet names
      dynamicKeywords.push(...poetNames);
    }

    return generatePageMetadata({
      title: "ग़ज़लें - हिंदी कविता संग्रह",
      description:
        "प्रसिद्ध कवियों की सुंदर ग़ज़लों का आनंद लें। क्लासिकल और समकालीन ग़ज़ल कविता का अनुभव करें।",
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
      title: "ग़ज़लें - हिंदी कविता संग्रह",
      description:
        "प्रसिद्ध कवियों की सुंदर ग़ज़लों का आनंद लें। क्लासिकल और समकालीन ग़ज़ल कविता का अनुभव करें।",
      keywords: ["ग़ज़लें", "हिंदी ग़ज़ल", "उर्दू शायरी हिंदी में", "ghazlen", "कविता संग्रह"],
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

// Server component with SSR data for Hindi language
const GhazlenPage = async () => {
  let initialData = null;
  let error = null;

  try {
    // Fetch initial data during SSR
    const ghazlenResponse = await fetchList<any>(
      "appvzkf6nX376pZy6", // Ghazlen base ID
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
    name: "जहाँनुमा - हिंदी ग़ज़लें",
    description: "हिंदी में सुंदर ग़ज़लों और कविता का संग्रह",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/HI/Ghazlen",
    language: "hi",
  });

  // Create poetry-specific structured data
  const poetryStructuredData = {
    "@type": "CreativeWork",
    "@id": "https://jahan-numa.org/HI/Ghazlen",
    "name": "हिंदी ग़ज़ल संग्रह",
    "description": "क्लासिकल और समकालीन कवियों की ग़ज़लों का व्यापक संग्रह हिंदी में",
    "genre": "Poetry",
    "inLanguage": "hi",
    "author": {
      "@type": "Organization",
      "name": "जहाँनुमा",
      "url": "https://jahan-numa.org"
    },
    "publisher": {
      "@type": "Organization",
      "name": "जहाँनुमा",
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
        <GhazlenComponent initialData={initialData} language="HI" />
      </GhazlenErrorBoundary>
    </div>
  );
};

export default GhazlenPage;
