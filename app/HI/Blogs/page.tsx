import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Content from "./Content";

// Generate comprehensive metadata for Hindi Blogs page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "ब्लॉग्स | जहाननुमा - उर्दू साहित्य की अंतर्दृष्टि",
    description: "उर्दू कविता, साहित्य, सांस्कृतिक विरासत और साहित्यिक विश्लेषण के बारे में हमारे अंतर्दृष्टिपूर्ण ब्लॉग्स का संग्रह देखें। क्लासिकल और समकालीन कवियों पर लेख खोजें।",
    keywords: [
      "उर्दू साहित्य ब्लॉग्स",
      "कविता लेख",
      "साहित्यिक अंतर्दृष्टि",
      "सांस्कृतिक विरासत",
      "उर्दू कविता विश्लेषण",
      "साहित्य समीक्षा",
      "कवि जीवनी",
      "साहित्यिक आलोचना",
      "उर्दू संस्कृति"
    ],
    url: "/HI/Blogs",
    image: "/metaImages/blogs.jpg",
    language: "hi",
    alternateLanguages: {
      ur: "https://jahan-numa.org/Blogs",
      en: "https://jahan-numa.org/EN/Blogs",
    },
  });
}

const BlogsPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाननुमा - साहित्य ब्लॉग्स",
    description: "उर्दू कविता, साहित्य और सांस्कृतिक विरासत के बारे में अंतर्दृष्टिपूर्ण ब्लॉग्स",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/Blogs",
    language: "hi",
  });

  // Create blog collection structured data
  const blogCollectionStructuredData = {
    "@type": "Blog",
    "@id": "https://jahan-numa.org/HI/Blogs#blog",
    "name": "जहाननुमा साहित्य ब्लॉग",
    "description": "उर्दू कविता, साहित्य और सांस्कृतिक विरासत के बारे में अंतर्दृष्टिपूर्ण लेख",
    "url": "https://jahan-numa.org/HI/Blogs",
    "inLanguage": "hi",
    "genre": ["साहित्य", "कविता", "संस्कृति"],
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
        "name": "ब्लॉग्स",
        "item": "https://jahan-numa.org/HI/Blogs"
      }
    ]
  };

  // Create comprehensive structured data graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      websiteStructuredData,
      blogCollectionStructuredData,
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

export default BlogsPage;
