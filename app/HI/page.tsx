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
    // Add language parameter for HI
    const searchParams = new URLSearchParams({ ...params, lang: 'HI' });
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

// Generate dynamic metadata for Hindi home page
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
    "उर्दू शायरी",
    "उर्दू साहित्य",
    "urdu poetry",
    "urdu literature",
    "उर्दू गज़ल",
    "उर्दू नज़्म",
    "jahannuma",
    "जहाँ नुमा",
    ...poetNames,
  ];

  return generatePageMetadata({
    title:
      "जहाँ नुमा - उर्दू साहित्य और शायरी का खजाना | Jahannuma - Treasury of Urdu Literature",
    description:
      "उर्दू साहित्य की समृद्ध दुनिया का अन्वेषण करें। सुंदर शायरी, गज़लें, नज़्में और साहित्यिक कृतियों की खोज करें। क्लासिकल और समकालीन उर्दू कवियों और उनकी कृतियों को जानें।",
    keywords: dynamicKeywords,
    url: "/HI",
    image: "/metaImages/logo.png",
    language: "hi",
    alternateLanguages: {
      ur: "https://jahan-numa.org/",
      en: "https://jahan-numa.org/EN",
    },
  });
}

export default async function Home() {
  const homeData = await getHomePageData();

  // Generate comprehensive structured data for homepage
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाँ नुमा - उर्दू साहित्य का खजाना",
    description:
      "उर्दू शायरी, साहित्य और सांस्कृतिक सामग्री का व्यापक संग्रह",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/search",
    language: "hi",
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
      "@id": "https://jahan-numa.org/HI/Ashaar#collection",
      "name": "अशआर संग्रह",
      "description": "प्रसिद्ध उर्दू कवियों के सुंदर शायरी के दोहे",
      "url": "https://jahan-numa.org/HI/Ashaar",
      "genre": "Poetry",
      "inLanguage": "hi",
      "author": {
        "@type": "Organization",
        "name": "Jahannuma"
      }
    },
    {
      "@type": "CreativeWork",
      "@id": "https://jahan-numa.org/HI/Ghazlen#collection",
      "name": "गज़लें संग्रह",
      "description": "क्लासिकल और समकालीन उर्दू गज़लें",
      "url": "https://jahan-numa.org/HI/Ghazlen",
      "genre": "Poetry",
      "inLanguage": "hi",
      "author": {
        "@type": "Organization",
        "name": "Jahannuma"
      }
    },
    {
      "@type": "Book",
      "@id": "https://jahan-numa.org/HI/E-Books#collection",
      "name": "डिजिटल पुस्तकालय",
      "description": "उर्दू साहित्य और शायरी की पुस्तकों का संग्रह",
      "url": "https://jahan-numa.org/HI/E-Books",
      "genre": ["Literature", "Poetry"],
      "inLanguage": "hi",
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
        "name": "होम",
        "item": "https://jahan-numa.org/HI"
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
            "name": "जहाँ नुमा क्या है?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "जहाँ नुमा उर्दू शायरी, साहित्य और सांस्कृतिक सामग्री के लिए एक व्यापक डिजिटल प्लेटफॉर्म है जिसमें अशआर, गज़लें, नज़्में और ई-बुक्स शामिल हैं।"
            }
          },
          {
            "@type": "Question",
            "name": "क्या सामग्री मुफ्त में उपलब्ध है?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "हाँ, जहाँ नुमा पर सभी शायरी और साहित्य सामग्री उर्दू भाषा और संस्कृति को बढ़ावा देने के लिए मुफ्त में उपलब्ध है।"
            }
          },
          {
            "@type": "Question",
            "name": "किस प्रकार की शायरी उपलब्ध है?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "जहाँ नुमा में उर्दू शायरी के विभिन्न रूप शामिल हैं जैसे अशआर (दोहे), गज़लें, नज़्में और रुबाई क्लासिकल और समकालीन कवियों से।"
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
