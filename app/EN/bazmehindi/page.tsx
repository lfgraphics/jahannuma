import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";

// Generate comprehensive metadata for English Bazme Hindi page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Bazme Hindi | Jahannuma - Hindi Literary Circle",
    description: "Explore Bazme Hindi - A dedicated section for Hindi literature and poetry within Jahannuma. Discover Hindi literary works, poetry, and cultural content.",
    keywords: [
      "bazme hindi",
      "hindi literature",
      "hindi poetry",
      "literary circle",
      "hindi cultural content",
      "hindi literary works",
      "poetry collection",
      "hindi writers"
    ],
    url: "/EN/bazmehindi",
    image: "/metaImages/bazmehindi.jpg",
    language: "en",
    alternateLanguages: {
      ur: "https://jahan-numa.org/bazmehindi",
      hi: "https://jahan-numa.org/HI/bazmehindi",
    },
  });
}

export default function Bazmehindi() {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Bazme Hindi",
    description: "Hindi literary circle and poetry collection",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/bazmehindi",
    language: "en",
  });

  // Create literary circle structured data
  const literaryCircleStructuredData = {
    "@type": "Organization",
    "@id": "https://jahan-numa.org/EN/bazmehindi#circle",
    "name": "Bazme Hindi",
    "description": "Hindi literary circle dedicated to promoting Hindi literature and poetry",
    "url": "https://jahan-numa.org/EN/bazmehindi",
    "parentOrganization": {
      "@type": "Organization",
      "name": "Jahannuma"
    },
    "foundingDate": "2020",
    "knowsAbout": ["Hindi Literature", "Hindi Poetry", "Cultural Heritage"]
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
        "name": "Bazme Hindi",
        "item": "https://jahan-numa.org/EN/bazmehindi"
      }
    ]
  };

  // Create comprehensive structured data graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      websiteStructuredData,
      literaryCircleStructuredData,
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
      <div>Bazme Hindi</div>
    </>
  );
}
