import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Ads from "./Components/Ads";
import Branches from "./Components/Branches";
import Carousel from "./Components/Carosel";
import HorizontalBooks from "./Components/HorizontalBooks";
import HorizontalShura from "./Components/HorizontalShura";
import InstallPWAButton from "./Components/InstallAppBtn";
import Mutala from "./Components/Mutala";
import Quiz from "./Components/Quiz";
import RandCard from "./Components/RandCard";
import DoYouKnow from "./Components/doyoouknow/DoYouKnow";

// Helper function to fetch from API routes
async function fetchFromAPI(
  endpoint: string,
  params: Record<string, string> = {}
) {
  try {
    // Simple relative URL for server-side fetching
    const searchParams = new URLSearchParams(params);
    const url = `/api/airtable/${endpoint}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
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
      fetchFromAPI("ebooks", { maxRecords: "3" }), // Use ebooks instead of books
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

// Generate dynamic metadata for home page
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
    "اردو نظمیں",
    "اردو شاعری",
    "urdu poetry",
    "urdu shayari",
    "urdu literature",
    "urdu ghazal",
    "jahannuma",
    "جہاں نما",
    ...poetNames,
  ];

  return generatePageMetadata({
    title:
      "جہاں نما - اردو ادب اور شاعری کا خزانہ | Jahannuma - Treasury of Urdu Literature",
    description:
      "Explore the rich world of Urdu literature with beautiful poetry, ghazals, nazms, and literary works. Discover classical and contemporary Urdu poets and their masterpieces.",
    keywords: dynamicKeywords,
    url: "/",
    image: "/metaImages/logo.png",
    language: "ur",
    alternateLanguages: {
      en: "https://jahan-numa.org/EN",
      hi: "https://jahan-numa.org/HI",
    },
  });
}

export default async function Home() {
  const homeData = await getHomePageData();

  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - جہاں نما",
    description:
      "Comprehensive collection of Urdu poetry, literature, and cultural content",
    url: "https://jahan-numa.org",
    searchUrl: "https://jahan-numa.org/search",
    language: "ur",
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [websiteStructuredData],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div>
        <Carousel />
        <RandCard />
        <HorizontalShura />
        <HorizontalBooks />
        <Branches />
        <div className="w-full flex justify-center my-3">
          <InstallPWAButton />
        </div>
        <Quiz />
        <Ads />
        <Mutala />
        <DoYouKnow />
      </div>
    </>
  );
}
