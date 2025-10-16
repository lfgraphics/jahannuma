import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  generateArticleStructuredData,
  generateWebsiteStructuredData,
} from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Ghazlen from "./Component";

// Server-side data fetching for initial content
async function getInitialGhazlenData() {
  try {
    const response = await fetch("/api/airtable/ghazlen?pageSize=6", {
      cache: "no-store",
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${response.statusText} ${text}`);
    }

    const data = await response.json();
    return data.success ? data.data.records : [];
  } catch (error) {
    console.error("Failed to fetch initial Ghazlen data:", error);
    return [];
  }
}

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const initialData = await getInitialGhazlenData();
  const recentPoetNames = initialData
    .map((record: any) => record.fields?.shaer)
    .filter(Boolean)
    .slice(0, 3);

  const dynamicKeywords = [
    "غزلیں",
    "اردو غزل",
    "ghazal",
    "urdu ghazal",
    "ghazlen",
    ...recentPoetNames,
  ];

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
}

// Server component with SSR data
const GhazlenPage = async () => {
  const initialData = await getInitialGhazlenData();

  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Ghazlen",
    description: "Collection of beautiful Urdu ghazals and poetry",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/Ghazlen",
    language: "ur",
  });

  // Generate article structured data for featured content
  const featuredGhazal = initialData[0];
  const articleStructuredData = featuredGhazal
    ? generateArticleStructuredData({
        headline: `Ghazal by ${featuredGhazal.fields?.shaer || "Unknown Poet"}`,
        description: `Beautiful ghazal: ${
          featuredGhazal.fields?.sher || "Ghazal collection"
        }`,
        url: `https://jahan-numa.org/Ghazlen/${featuredGhazal.fields?.id}`,
        author: featuredGhazal.fields?.shaer || "Unknown Poet",
        datePublished: featuredGhazal.createdTime || new Date().toISOString(),
        genre: "Ghazal",
        language: "ur",
      })
    : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      websiteStructuredData,
      ...(articleStructuredData ? [articleStructuredData] : []),
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Ghazlen initialData={initialData} />
    </div>
  );
};

export default GhazlenPage;
