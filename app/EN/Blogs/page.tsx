import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Content from "./Content";

// Generate comprehensive metadata for English Blogs page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Blogs | Jahannuma - Urdu Literature Insights",
    description: "Explore our collection of insightful blogs about Urdu poetry, literature, cultural heritage, and literary analysis. Discover articles on classical and contemporary poets.",
    keywords: [
      "urdu literature blogs",
      "poetry articles",
      "literary insights",
      "cultural heritage",
      "urdu poetry analysis",
      "literature reviews",
      "poet biographies",
      "literary criticism",
      "urdu culture"
    ],
    url: "/EN/Blogs",
    image: "/metaImages/blogs.jpg",
    language: "en",
    alternateLanguages: {
      ur: "https://jahan-numa.org/Blogs",
      hi: "https://jahan-numa.org/HI/Blogs",
    },
  });
}

const BlogsPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Literature Blogs",
    description: "Insightful blogs about Urdu poetry, literature, and cultural heritage",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/Blogs",
    language: "en",
  });

  // Create blog collection structured data
  const blogCollectionStructuredData = {
    "@type": "Blog",
    "@id": "https://jahan-numa.org/EN/Blogs#blog",
    "name": "Jahannuma Literature Blog",
    "description": "Insightful articles about Urdu poetry, literature, and cultural heritage",
    "url": "https://jahan-numa.org/EN/Blogs",
    "inLanguage": "en",
    "genre": ["Literature", "Poetry", "Culture"],
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
        "name": "Blogs",
        "item": "https://jahan-numa.org/EN/Blogs"
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
