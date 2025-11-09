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
      "अशार",
      "उर्दू शायरी",
      "शायरी",
      "urdu poetry hindi",
      "ashaar hindi",
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
      title: "अशार - प्रसिद्ध कवियों के शेर",
      description:
        "प्रसिद्ध कवियों के सुंदर अशार (शायरी के दोहे) का अन्वेषण करें। उर्दू साहित्य में कालजयी छंदों को लाइक, कमेंट और शेयरिंग सुविधाओं के साथ खोजें।",
      keywords: dynamicKeywords,
      url: "/HI/Ashaar",
      image: "/metaImages/ashaar.jpg",
      language: "hi",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Ashaar",
        en: "https://jahan-numa.org/EN/Ashaar",
      },
    });
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata if data fetching fails
    return generatePageMetadata({
      title: "अशार - प्रसिद्ध कवियों के शेर",
      description:
        "प्रसिद्ध कवियों के सुंदर अशार (शायरी के दोहे) का अन्वेषण करें। उर्दू साहित्य में कालजयी छंदों को लाइक, कमेंट और शेयरिंग सुविधाओं के साथ खोजें।",
      keywords: ["अशार", "उर्दू शायरी", "शायरी", "urdu poetry hindi", "ashaar hindi"],
      url: "/HI/Ashaar",
      image: "/metaImages/ashaar.jpg",
      language: "hi",
      alternateLanguages: {
        ur: "https://jahan-numa.org/Ashaar",
        en: "https://jahan-numa.org/EN/Ashaar",
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
    name: "जहाँनुमा - अशार",
    description: "सुंदर उर्दू शायरी और अशार का संग्रह",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/Ashaar",
    language: "hi",
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