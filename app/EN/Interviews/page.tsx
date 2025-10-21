import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Content from "./Content";

// Generate comprehensive metadata for English Interviews page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Interviews | Jahannuma - Poetry Conversations",
    description: "Watch exclusive interviews and podcast videos featuring poets, writers, and literary figures interviewed by Jahannuma. Discover insights into Urdu literature and poetry.",
    keywords: [
      "poetry interviews",
      "urdu poet interviews",
      "literature podcasts",
      "writer conversations",
      "literary discussions",
      "poet talks",
      "jahannuma interviews",
      "urdu literature videos",
      "cultural interviews"
    ],
    url: "/EN/Interviews",
    image: "/metaImages/interview.jpg",
    language: "en",
    alternateLanguages: {
      ur: "https://jahan-numa.org/Interviews",
      hi: "https://jahan-numa.org/HI/Interviews",
    },
  });
}

const InterviewsPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Poetry Interviews",
    description: "Exclusive interviews with poets, writers, and literary figures",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/Interviews",
    language: "en",
  });

  // Create interview collection structured data
  const interviewCollectionStructuredData = {
    "@type": "VideoObject",
    "@id": "https://jahan-numa.org/EN/Interviews#collection",
    "name": "Jahannuma Poetry Interviews",
    "description": "Exclusive interviews and conversations with poets, writers, and literary figures",
    "url": "https://jahan-numa.org/EN/Interviews",
    "inLanguage": "en",
    "genre": ["Interview", "Literature", "Poetry"],
    "author": {
      "@type": "Organization",
      "name": "Jahannuma"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jahannuma",
      "url": "https://jahan-numa.org"
    }
  };

  // Create breadcrumb structured data
  const breadcrumbData = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://jahan-numa.org/EN"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Interviews",
        "item": "https://jahan-numa.org/EN/Interviews"
      }
    ]
  };

  // Create comprehensive structured data graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      websiteStructuredData,
      interviewCollectionStructuredData,
      breadcrumbData
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
      <Content />
    </>
  );
};

export default InterviewsPage;
