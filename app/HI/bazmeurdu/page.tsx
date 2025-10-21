import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";

// Generate comprehensive metadata for Hindi Bazme Urdu page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "बज़्मे उर्दू | जहाननुमा - उर्दू साहित्यिक मंडली",
    description: "बज़्मे उर्दू का अन्वेषण करें - जहाननुमा के उर्दू साहित्य और कविता संग्रह का हृदय। क्लासिकल और समकालीन उर्दू साहित्यिक कृतियों, कविता और सांस्कृतिक विरासत की खोज करें।",
    keywords: [
      "बज़्मे उर्दू",
      "उर्दू साहित्य",
      "उर्दू कविता",
      "साहित्यिक मंडली",
      "उर्दू सांस्कृतिक सामग्री",
      "उर्दू साहित्यिक कृतियां",
      "क्लासिकल उर्दू कविता",
      "उर्दू लेखक",
      "उर्दू विरासत"
    ],
    url: "/HI/bazmeurdu",
    image: "/metaImages/bazmeurdu.jpg",
    language: "hi",
    alternateLanguages: {
      ur: "https://jahan-numa.org/bazmeurdu",
      en: "https://jahan-numa.org/EN/bazmeurdu",
    },
  });
}

export default function Bazmeurdu() {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाननुमा - बज़्मे उर्दू",
    description: "उर्दू साहित्यिक मंडली और कविता संग्रह",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/bazmeurdu",
    language: "hi",
  });

  // Create literary circle structured data
  const literaryCircleStructuredData = {
    "@type": "Organization",
    "@id": "https://jahan-numa.org/HI/bazmeurdu#circle",
    "name": "बज़्मे उर्दू",
    "description": "उर्दू साहित्य और कविता के संरक्षण और प्रचार के लिए समर्पित उर्दू साहित्यिक मंडली",
    "url": "https://jahan-numa.org/HI/bazmeurdu",
    "parentOrganization": {
      "@type": "Organization",
      "name": "जहाननुमा"
    },
    "foundingDate": "2020",
    "knowsAbout": ["उर्दू साहित्य", "उर्दू कविता", "क्लासिकल कविता", "सांस्कृतिक विरासत"]
  };

  // Create breadcrumb structured data
  const breadcrumbData = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "होम",
        "item": "https://jahan-numa.org/HI"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "बज़्मे उर्दू",
        "item": "https://jahan-numa.org/HI/bazmeurdu"
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
      <div>
        Bazme Urdu
      </div>
    </>
  );
}
