import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import AshaarComponent from "./Component";
import AshaarErrorBoundary from "./ErrorBoundary";

// Generate dynamic metadata with server-side data for Hindi
export async function generateMetadata(): Promise<Metadata> {
  try {
    const dynamicKeywords = [
      "अशआर",
      "उर्दू शायरी",
      "हिंदी उर्दू शायरी",
      "शायरी के दोहे",
      "उर्दू साहित्य",
      "उर्दू शेर",
    ];

    return generatePageMetadata({
      title: "अशआर - शायरी के दोहे",
      description:
        "प्रसिद्ध कवियों के सुंदर अशआर (शायरी के दोहे) का अन्वेषण करें। उर्दू साहित्य में कालजयी छंदों की खोज करें।",
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
      title: "अशआर - शायरी के दोहे",
      description:
        "प्रसिद्ध कवियों के सुंदर अशआर (शायरी के दोहे) का अन्वेषण करें। उर्दू साहित्य में कालजयी छंदों की खोज करें।",
      keywords: ["अशआर", "उर्दू शायरी", "शायरी के दोहे", "उर्दू साहित्य"],
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

  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाँ नुमा - अशआर",
    description: "सुंदर उर्दू शायरी और अशआर का संग्रह हिंदी में",
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
        <AshaarComponent initialData={initialData} />
      </AshaarErrorBoundary>
    </div>
  );
};

export default AshaarPage;
