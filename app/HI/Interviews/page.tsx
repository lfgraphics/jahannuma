import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Content from "./Content";

// Generate comprehensive metadata for Hindi Interviews page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "इंटरव्यूज़ | जहाननुमा - कविता की बातचीत",
    description: "जहाननुमा द्वारा साक्षात्कार किए गए कवियों, लेखकों और साहित्यिक व्यक्तित्वों के विशेष साक्षात्कार और पॉडकास्ट वीडियो देखें। उर्दू साहित्य और कविता की अंतर्दृष्टि खोजें।",
    keywords: [
      "कविता साक्षात्कार",
      "उर्दू कवि इंटरव्यू",
      "साहित्य पॉडकास्ट",
      "लेखक बातचीत",
      "साहित्यिक चर्चा",
      "कवि वार्ता",
      "जहाननुमा इंटरव्यू",
      "उर्दू साहित्य वीडियो",
      "सांस्कृतिक साक्षात्कार"
    ],
    url: "/HI/Interviews",
    image: "/metaImages/interview.jpg",
    language: "hi",
    alternateLanguages: {
      ur: "https://jahan-numa.org/Interviews",
      en: "https://jahan-numa.org/EN/Interviews",
    },
  });
}

const InterviewsPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाननुमा - कविता साक्षात्कार",
    description: "कवियों, लेखकों और साहित्यिक व्यक्तित्वों के साथ विशेष साक्षात्कार",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/Interviews",
    language: "hi",
  });

  // Create interview collection structured data
  const interviewCollectionStructuredData = {
    "@type": "VideoObject",
    "@id": "https://jahan-numa.org/HI/Interviews#collection",
    "name": "जहाननुमा कविता साक्षात्कार",
    "description": "कवियों, लेखकों और साहित्यिक व्यक्तित्वों के साथ विशेष साक्षात्कार और बातचीत",
    "url": "https://jahan-numa.org/HI/Interviews",
    "inLanguage": "hi",
    "genre": ["साक्षात्कार", "साहित्य", "कविता"],
    "author": {
      "@type": "Organization",
      "name": "जहाननुमा"
    },
    "publisher": {
      "@type": "Organization",
      "name": "जहाननुमा",
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
        "name": "होम",
        "item": "https://jahan-numa.org/HI"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "इंटरव्यूज़",
        "item": "https://jahan-numa.org/HI/Interviews"
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
