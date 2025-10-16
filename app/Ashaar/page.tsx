import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  generateArticleStructuredData,
  generateWebsiteStructuredData,
} from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Ashaar from "./Component";

// Server-side data fetching for initial content
async function getInitialAshaarData() {
  try {
    const response = await fetch("/api/airtable/ashaar?pageSize=6", {
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
    console.error("Failed to fetch initial Ashaar data:", error);
    return [];
  }
}

// Generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const initialData = await getInitialAshaarData();
  const recentPoetNames = initialData
    .map((record: any) => record.fields?.shaer)
    .filter(Boolean)
    .slice(0, 3);

  const dynamicKeywords = [
    "اشعار",
    "اردو شاعری",
    "poetry",
    "urdu poetry",
    "ashaar",
    ...recentPoetNames,
  ];

  return generatePageMetadata({
    title: "Ashaar - اشعار",
    description:
      "Explore beautiful Ashaar (poetry couplets) from renowned poets. Discover timeless verses in Urdu literature with likes, comments and sharing features.",
    keywords: dynamicKeywords,
    url: "/Ashaar",
    image: "/metaImages/ashaar.jpg",
    language: "ur",
    alternateLanguages: {
      en: "https://jahan-numa.org/EN/Ashaar",
      hi: "https://jahan-numa.org/HI/Ashaar",
    },
  });
}

// Server component with SSR data
const AshaarPage = async () => {
  const initialData = await getInitialAshaarData();

  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Ashaar",
    description: "Collection of beautiful Urdu poetry and ashaar",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/Ashaar",
    language: "ur",
  });

  // Generate article structured data for featured content
  const featuredPoem = initialData[0];
  const articleStructuredData = featuredPoem
    ? generateArticleStructuredData({
        headline: `Ashaar by ${featuredPoem.fields?.shaer || "Unknown Poet"}`,
        description: `Beautiful poetry: ${
          featuredPoem.fields?.sher || "Poetry collection"
        }`,
        url: `https://jahan-numa.org/Ashaar/${featuredPoem.fields?.id}`,
        author: featuredPoem.fields?.shaer || "Unknown Poet",
        datePublished: featuredPoem.createdTime || new Date().toISOString(),
        genre: "Poetry",
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
      <Ashaar initialData={initialData} />
    </div>
  );
};

export default AshaarPage;
