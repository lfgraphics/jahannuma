import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";

// Generate comprehensive metadata for English Bazme Urdu page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Bazme Urdu | Jahannuma - Urdu Literary Circle",
    description: "Explore Bazme Urdu - The heart of Jahannuma's Urdu literature and poetry collection. Discover classical and contemporary Urdu literary works, poetry, and cultural heritage.",
    keywords: [
      "bazme urdu",
      "urdu literature",
      "urdu poetry",
      "literary circle",
      "urdu cultural content",
      "urdu literary works",
      "classical urdu poetry",
      "urdu writers",
      "urdu heritage"
    ],
    url: "/EN/bazmeurdu",
    image: "/metaImages/bazmeurdu.jpg",
    language: "en",
    alternateLanguages: {
      ur: "https://jahan-numa.org/bazmeurdu",
      hi: "https://jahan-numa.org/HI/bazmeurdu",
    },
  });
}

export default function Bazmeurdu() {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Bazme Urdu",
    description: "Urdu literary circle and poetry collection",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/bazmeurdu",
    language: "en",
  });

  // Create literary circle structured data
  const literaryCircleStructuredData = {
    "@type": "Organization",
    "@id": "https://jahan-numa.org/EN/bazmeurdu#circle",
    "name": "Bazme Urdu",
    "description": "Urdu literary circle dedicated to preserving and promoting Urdu literature and poetry",
    "url": "https://jahan-numa.org/EN/bazmeurdu",
    "parentOrganization": {
      "@type": "Organization",
      "name": "Jahannuma"
    },
    "foundingDate": "2020",
    "knowsAbout": ["Urdu Literature", "Urdu Poetry", "Classical Poetry", "Cultural Heritage"]
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
        "name": "Bazme Urdu",
        "item": "https://jahan-numa.org/EN/bazmeurdu"
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
      <div>Bazme Urdu</div>
    </>
  );
}
