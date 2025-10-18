import { getBuildSafeFallback } from "@/lib/build-safe-fallbacks";
import { generatePoetryMetadata } from "@/lib/seo/metadata";
import { generatePoetryStructuredData } from "@/lib/seo/structured-data";
import { fetchList } from "@/lib/universal-data-fetcher";
import type { Rubai } from "../types";
import RubaiComponent from "./Component";
import ErrorBoundary from "./ErrorBoundary";

// Generate metadata for SEO
export async function generateMetadata() {
  try {
    // Fetch sample data for metadata generation
    const data = await fetchList<{ records: Rubai[] }>(
      "appIewyeCIcAD4Y11",
      "rubai",
      { pageSize: 1 },
      { 
        fallback: getBuildSafeFallback("rubai", "list"),
        throwOnError: false 
      }
    );

    const sampleRubai = data?.records?.[0];
    
    return generatePoetryMetadata({
      type: "rubai",
      title: "Rubai | Jahannuma",
      author: sampleRubai?.fields?.shaer || "Various Poets",
      excerpt: "This page has rubai's of all young shaers of Goraphur",
      id: "rubai-collection",
    });
  } catch (error) {
    console.error("Error generating Rubai metadata:", error);
    
    // Fallback metadata
    return {
      title: "Rubai | Jahannuma",
      description: "This page has rubai's of all young shaers of Goraphur",
      openGraph: {
        images: ["https://jahan-numa.org/metaImages/rubai.jpg"],
      },
    };
  }
}

const RubaiPage = async () => {
  let initialData: { records: Rubai[] } | null = null;
  let structuredData: any = null;

  try {
    // Fetch initial data for SSR
    initialData = await fetchList<{ records: Rubai[] }>(
      "appIewyeCIcAD4Y11",
      "rubai",
      { pageSize: 30 },
      { 
        fallback: getBuildSafeFallback("rubai", "list"),
        throwOnError: false 
      }
    );

    // Generate structured data for SEO
    if (initialData?.records?.length > 0) {
      const sampleRubai = initialData.records[0];
      structuredData = generatePoetryStructuredData({
        type: "rubai",
        title: sampleRubai.fields.unwan || "Rubai Collection",
        content: sampleRubai.fields.body,
        author: sampleRubai.fields.shaer,
        url: "https://jahan-numa.org/Rubai",
        datePublished: sampleRubai.createdTime,
      });
    }
  } catch (error) {
    console.error("Error fetching Rubai data for SSR:", error);
    // Component will handle the error state
  }

  // Serialize data for client-side hydration
  const serializedData = initialData ? JSON.stringify(initialData) : null;

  return (
    <ErrorBoundary>
      <div>
        {/* Structured data for SEO */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        
        <RubaiComponent 
          initialData={serializedData}
          fallbackData={getBuildSafeFallback("rubai", "list")}
        />
      </div>
    </ErrorBoundary>
  );
};

export default RubaiPage;
