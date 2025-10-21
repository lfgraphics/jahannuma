import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  generateOrganizationStructuredData,
  generateWebsiteStructuredData
} from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Ads from "../Components/Ads";
import Branches from "../Components/Branches";
import Carousel from "../Components/Carosel";
import DoYouKnow from "../Components/doyoouknow/DoYouKnow";
import RandCard from "./Components/RandCard";

// Helper function to fetch from API routes with language awareness
async function fetchFromAPI(
  endpoint: string,
  params: Record<string, string> = {}
) {
  try {
    // Add language parameter for EN
    const searchParams = new URLSearchParams({ ...params, lang: 'EN' });
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://jahan-numa.org';

    const url = `${baseUrl}/api/airtable/${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;

    const response = await fetch(url, {
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch ${endpoint}:`,
        response.status,
        response.statusText
      );
      return { records: [] };
    }

    const data = await response.json();
    return data.success ? data.data : { records: [] };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { records: [] };
  }
}

// Server-side data fetching for home page content
async function getHomePageData() {
  try {
    // Fetch recent content from multiple collections for home page
    const [ashaarData, ghazlenData, bookData] = await Promise.allSettled([
      fetchFromAPI("ashaar", { maxRecords: "3" }),
      fetchFromAPI("ghazlen", { maxRecords: "3" }),
      fetchFromAPI("ebooks", { maxRecords: "3" }),
    ]);

    return {
      ashaar:
        ashaarData.status === "fulfilled"
          ? ashaarData.value?.records || []
          : [],
      ghazlen:
        ghazlenData.status === "fulfilled"
          ? ghazlenData.value?.records || []
          : [],
      books:
        bookData.status === "fulfilled" ? bookData.value?.records || [] : [],
    };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return { ashaar: [], ghazlen: [], books: [] };
  }
}

// Generate dynamic metadata for English home page
export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomePageData();

  // Extract poet names for dynamic keywords
  const poetNames = [
    ...data.ashaar.map((r: any) => r.fields?.shaer),
    ...data.ghazlen.map((r: any) => r.fields?.shaer),
  ]
    .filter(Boolean)
    .slice(0, 5);

  const dynamicKeywords = [
    "urdu poetry",
    "urdu literature",
    "english urdu poetry",
    "urdu ghazal",
    "urdu nazm",
    "jahannuma",
    "urdu shayari",
    ...poetNames,
  ];

  return generatePageMetadata({
    title:
      "Jahannuma - Treasury of Urdu Literature and Poetry",
    description:
      "Explore the rich world of Urdu literature with beautiful poetry, ghazals, nazms, and literary works. Discover classical and contemporary Urdu poets and their masterpieces in English.",
    keywords: dynamicKeywords,
    url: "/EN",
    image: "/metaImages/logo.png",
    language: "en",
    alternateLanguages: {
      ur: "https://jahan-numa.org/",
      hi: "https://jahan-numa.org/HI",
    },
  });
}

export default async function Home() {
  const homeData = await getHomePageData();

  // Generate comprehensive structured data for homepage
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Treasury of Urdu Literature",
    description:
      "Comprehensive collection of Urdu poetry, literature, and cultural content in English",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/search",
    language: "en",
  });

  const organizationData = generateOrganizationStructuredData({
    name: "Jahan Numa",
    description: "A comprehensive digital library of Urdu poetry and literature",
    url: "https://jahannuma.vercel.app",
    logo: "https://jahannuma.vercel.app/logo.png"
  });

  // Create featured content collections for structured data
  const featuredCollections = [
    {
      "@type": "CreativeWork",
      "@id": "https://jahan-numa.org/EN/Ashaar#collection",
      "name": "Ashaar Collection",
      "description": "Beautiful poetry couplets from renowned Urdu poets",
      "url": "https://jahan-numa.org/EN/Ashaar",
      "genre": "Poetry",
      "inLanguage": "en",
      "author": {
        "@type": "Organization",
        "name": "Jahannuma"
      }
    },
    {
      "@type": "CreativeWork",
      "@id": "https://jahan-numa.org/EN/Ghazlen#collection",
      "name": "Ghazlen Collection",
      "description": "Classical and contemporary Urdu ghazals",
      "url": "https://jahan-numa.org/EN/Ghazlen",
      "genre": "Poetry",
      "inLanguage": "en",
      "author": {
        "@type": "Organization",
        "name": "Jahannuma"
      }
    },
    {
      "@type": "Book",
      "@id": "https://jahan-numa.org/EN/E-Books#collection",
      "name": "Digital Library",
      "description": "Collection of Urdu literature and poetry books",
      "url": "https://jahan-numa.org/EN/E-Books",
      "genre": ["Literature", "Poetry"],
      "inLanguage": "en",
      "publisher": {
        "@type": "Organization",
        "name": "Jahannuma"
      }
    }
  ];

  // Add breadcrumb for homepage
  const breadcrumbData = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://jahan-numa.org/EN"
      }
    ]
  };

  // Create comprehensive structured data graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      websiteStructuredData,
      organizationData,
      breadcrumbData,
      ...featuredCollections,
      // Add FAQ structured data for common questions
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Jahannuma?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Jahannuma is a comprehensive digital platform for Urdu poetry, literature, and cultural content featuring ashaar, ghazals, nazms, and e-books."
            }
          },
          {
            "@type": "Question",
            "name": "Is the content free to access?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, all poetry and literature content on Jahannuma is freely accessible to promote Urdu language and culture."
            }
          },
          {
            "@type": "Question",
            "name": "What types of poetry are available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Jahannuma features various forms of Urdu poetry including Ashaar (couplets), Ghazals, Nazms (poems), and Rubai (quatrains) from classical and contemporary poets."
            }
          }
        ]
      }
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="bg-background text-foreground">
        <Carousel />
        <RandCard />
        <Branches />
        <Ads />
        <DoYouKnow />
      </div>
    </>
  );
}
