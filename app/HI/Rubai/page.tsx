import { getBuildSafeFallback } from "@/lib/build-safe-fallbacks";
import { generatePoetryMetadata } from "@/lib/seo/metadata";
import { generatePoetryStructuredData } from "@/lib/seo/structured-data";
import { fetchList } from "@/lib/universal-data-fetcher";
import type { Rubai } from "../../types";
import RubaiComponent from "./Component";
import ErrorBoundary from "./ErrorBoundary";

// Generate metadata for SEO - Hindi version
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
      title: "रुबाई - हिंदी कविता संग्रह | जहाँनुमा",
      author: sampleRubai?.fields?.hiShaer || sampleRubai?.fields?.shaer || "विभिन्न कवि",
      excerpt: "यह पृष्ठ सभी युवा कवियों की रुबाइयों का संग्रह है",
      id: "rubai-collection-hi",
    });
  } catch (error) {
    console.error("Error generating Rubai metadata:", error);
    
    // Fallback metadata
    return {
      title: "रुबाई - हिंदी कविता संग्रह | जहाँनुमा",
      description: "यह पृष्ठ सभी युवा कवियों की रुबाइयों का संग्रह है",
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
        title: sampleRubai.fields.hiUnwan || sampleRubai.fields.unwan || "हिंदी रुबाई संग्रह",
        content: sampleRubai.fields.hiBody || sampleRubai.fields.body,
        author: sampleRubai.fields.hiShaer || sampleRubai.fields.shaer,
        url: "https://jahan-numa.org/HI/Rubai",
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
          language="HI"
        />
      </div>
    </ErrorBoundary>
  );
};

export default RubaiPage;