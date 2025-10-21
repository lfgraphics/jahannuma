import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";

// Generate comprehensive metadata for Hindi Bazme Hindi page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "बज़्मे हिंदी | जहाननुमा - हिंदी साहित्यिक मंडली",
    description: "बज़्मे हिंदी का अन्वेषण करें - जहाननुमा के भीतर हिंदी साहित्य और कविता के लिए एक समर्पित अनुभाग। हिंदी साहित्यिक कृतियों, कविता और सांस्कृतिक सामग्री की खोज करें।",
    keywords: [
      "बज़्मे हिंदी",
      "हिंदी साहित्य",
      "हिंदी कविता",
      "साहित्यिक मंडली",
      "हिंदी सांस्कृतिक सामग्री",
      "हिंदी साहित्यिक कृतियां",
      "कविता संग्रह",
      "हिंदी लेखक"
    ],
    url: "/HI/bazmehindi",
    image: "/metaImages/bazmehindi.jpg",
    language: "hi",
    alternateLanguages: {
      ur: "https://jahan-numa.org/bazmehindi",
      en: "https://jahan-numa.org/EN/bazmehindi",
    },
  });
}

export default function Bazmehindi() {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाननुमा - बज़्मे हिंदी",
    description: "हिंदी साहित्यिक मंडली और कविता संग्रह",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/bazmehindi",
    language: "hi",
  });

  // Create literary circle structured data
  const literaryCircleStructuredData = {
    "@type": "Organization",
    "@id": "https://jahan-numa.org/HI/bazmehindi#circle",
    "name": "बज़्मे हिंदी",
    "description": "हिंदी साहित्य और कविता को बढ़ावा देने के लिए समर्पित हिंदी साहित्यिक मंडली",
    "url": "https://jahan-numa.org/HI/bazmehindi",
    "parentOrganization": {
      "@type": "Organization",
      "name": "जहाननुमा"
    },
    "foundingDate": "2020",
    "knowsAbout": ["हिंदी साहित्य", "हिंदी कविता", "सांस्कृतिक विरासत"]
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
        "name": "बज़्मे हिंदी",
        "item": "https://jahan-numa.org/HI/bazmehindi"
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
        Bazme Hindi
      </div>
    </>
  );
}
