/**
 * SEO utilities specifically for individual content pages (poems, books, etc.)
 */

import { Metadata } from "next";
import {
  generateAuthorMetadata,
  generateIndividualContentMetadata
} from "./metadata";
import {
  BreadcrumbItem,
  generateBookStructuredData,
  generateBreadcrumbStructuredData,
  generatePoetStructuredData,
  generatePoetryStructuredData,
  generateStructuredDataGraph
} from "./structured-data";

export interface IndividualContentData {
  id: string;
  title: string;
  content: string;
  author: string;
  datePublished?: string;
  dateModified?: string;
  tags?: string[];
  category?: string;
  language?: "ur" | "en" | "hi";
  image?: string;
  wordCount?: number;
  meter?: string; // For poetry
  rhymeScheme?: string; // For poetry
  theme?: string[];
}

export interface BookContentData extends IndividualContentData {
  isbn?: string;
  numberOfPages?: number;
  publisher?: string;
  downloadUrl?: string;
  fileSize?: string;
  format?: string;
}

export interface AuthorData {
  name: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  image?: string;
  worksCount?: number;
  genres?: string[];
  famousWorks?: Array<{
    title: string;
    type: "ashaar" | "ghazlen" | "nazmen" | "rubai";
    url?: string;
  }>;
}

/**
 * Generate complete SEO for individual poetry content
 */
export async function generatePoetrySEO(params: {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai";
  content: IndividualContentData;
  author?: AuthorData;
  breadcrumbs?: BreadcrumbItem[];
  relatedContent?: IndividualContentData[];
}): Promise<{
  metadata: Metadata;
  structuredData: string;
}> {
  const { contentType, content, author, breadcrumbs, relatedContent } = params;

  // Generate metadata
  const metadata = generateIndividualContentMetadata({
    contentType,
    title: content.title,
    author: content.author,
    content: content.content,
    id: content.id,
    language: content.language,
    datePublished: content.datePublished,
    tags: content.tags,
  });

  // Generate structured data components
  const baseUrl = "https://jahan-numa.org";
  const contentUrl = `${baseUrl}/${contentType}/${content.id}`;

  const structuredDataItems: any[] = [
    // Poetry content
    generatePoetryStructuredData({
      type: contentType,
      title: content.title,
      content: content.content,
      author: content.author,
      url: contentUrl,
      datePublished: content.datePublished,
      language: content.language || 'ur',
      // meter: content.meter,
      // rhymeScheme: content.rhymeScheme,
      // theme: content.theme,
    }),

    // Article wrapper for the page
    {
      "@type": "Article",
      "@id": `${contentUrl}#article`,
      "headline": content.title,
      "description": content.content.substring(0, 160) + "...",
      "author": {
        "@type": "Person",
        "name": content.author,
      },
      "datePublished": content.datePublished,
      "dateModified": content.dateModified || content.datePublished,
      "publisher": {
        "@type": "Organization",
        "name": "Jahannuma",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
        },
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": contentUrl,
      },
      "wordCount": content.wordCount,
      "inLanguage": content.language || "ur",
      "genre": "Poetry",
      "keywords": content.tags?.join(", "),
    },
  ];

  // Add author structured data if available
  if (author) {
    structuredDataItems.push(generatePoetStructuredData({
      name: author.name,
      description: author.bio,
      url: `${baseUrl}/shaer/${encodeURIComponent(author.name)}`,
      image: author.image,
      birthDate: author.birthDate,
      deathDate: author.deathDate,
      nationality: author.nationality,
      worksCount: author.worksCount,
      genres: author.genres,
      famousWorks: author.famousWorks?.map(work => ({
        name: work.title,
        url: work.url,
        type: work.type
      })),
    }));
  }

  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredDataItems.push(generateBreadcrumbStructuredData(breadcrumbs));
  }

  // Add related content as collection
  if (relatedContent && relatedContent.length > 0) {
    structuredDataItems.push({
      "@type": "ItemList",
      "name": "Related Content",
      "itemListElement": relatedContent.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": item.title,
          "author": {
            "@type": "Person",
            "name": item.author,
          },
          "url": `${baseUrl}/${contentType}/${item.id}`,
          "genre": "Poetry",
        },
      })),
    });
  }

  const structuredData = JSON.stringify(generateStructuredDataGraph(structuredDataItems));

  return { metadata, structuredData };
}

/**
 * Generate complete SEO for individual book content
 */
export async function generateBookSEO(params: {
  content: BookContentData;
  author?: AuthorData;
  breadcrumbs?: BreadcrumbItem[];
  relatedBooks?: BookContentData[];
}): Promise<{
  metadata: Metadata;
  structuredData: string;
}> {
  const { content, author, breadcrumbs, relatedBooks } = params;

  // Generate metadata
  const metadata = generateIndividualContentMetadata({
    contentType: "ebooks" as any, // Type assertion for compatibility
    title: content.title,
    author: content.author,
    content: content.content,
    id: content.id,
    language: content.language,
    datePublished: content.datePublished,
    tags: content.tags,
  });

  // Generate structured data components
  const baseUrl = "https://jahan-numa.org";
  const bookUrl = `${baseUrl}/E-Books/${content.id}`;

  const structuredDataItems: any[] = [
    // Book content
    generateBookStructuredData({
      name: content.title,
      author: content.author,
      description: content.content,
      url: bookUrl,
      image: content.image,
      datePublished: content.datePublished,
      publisher: content.publisher,
      isbn: content.isbn,
      numberOfPages: content.numberOfPages,
      inLanguage: content.language,
      downloadUrl: content.downloadUrl,
    }),

    // Article wrapper for the page
    {
      "@type": "Article",
      "@id": `${bookUrl}#article`,
      "headline": content.title,
      "description": content.content.substring(0, 160) + "...",
      "author": {
        "@type": "Person",
        "name": content.author,
      },
      "datePublished": content.datePublished,
      "dateModified": content.dateModified || content.datePublished,
      "publisher": {
        "@type": "Organization",
        "name": content.publisher || "Jahannuma",
        "url": baseUrl,
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": bookUrl,
      },
      "wordCount": content.wordCount,
      "inLanguage": content.language || "ur",
      "genre": ["Literature", "Poetry"],
    },
  ];

  // Add author structured data if available
  if (author) {
    structuredDataItems.push(generatePoetStructuredData({
      name: author.name,
      description: author.bio,
      url: `${baseUrl}/shaer/${encodeURIComponent(author.name)}`,
      image: author.image,
      birthDate: author.birthDate,
      deathDate: author.deathDate,
      nationality: author.nationality,
      worksCount: author.worksCount,
      genres: author.genres,
    }));
  }

  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredDataItems.push(generateBreadcrumbStructuredData(breadcrumbs));
  }

  // Add related books as collection
  if (relatedBooks && relatedBooks.length > 0) {
    structuredDataItems.push({
      "@type": "ItemList",
      "name": "Related Books",
      "numberOfItems": relatedBooks.length,
      "itemListElement": relatedBooks.map((book, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Book",
          "name": book.title,
          "author": {
            "@type": "Person",
            "name": book.author,
          },
          "url": `${baseUrl}/E-Books/${book.id}`,
          "genre": ["Literature", "Poetry"],
        },
      })),
    });
  }

  const structuredData = JSON.stringify(generateStructuredDataGraph(structuredDataItems));

  return { metadata, structuredData };
}

/**
 * Generate complete SEO for author pages
 */
export async function generateAuthorPageSEO(params: {
  author: AuthorData;
  works: IndividualContentData[];
  breadcrumbs?: BreadcrumbItem[];
  language?: "ur" | "en" | "hi";
}): Promise<{
  metadata: Metadata;
  structuredData: string;
}> {
  const { author, works, breadcrumbs, language = "ur" } = params;

  // Generate metadata
  const metadata = generateAuthorMetadata({
    name: author.name,
    bio: author.bio,
    worksCount: author.worksCount || works.length,
    language,
    birthYear: author.birthDate?.split("-")[0],
    deathYear: author.deathDate?.split("-")[0],
    genres: author.genres,
  });

  // Generate structured data components
  const baseUrl = "https://jahan-numa.org";
  const authorUrl = `${baseUrl}/shaer/${encodeURIComponent(author.name)}`;

  const structuredDataItems: any[] = [
    // Author/Poet data
    generatePoetStructuredData({
      name: author.name,
      description: author.bio,
      url: authorUrl,
      image: author.image,
      birthDate: author.birthDate,
      deathDate: author.deathDate,
      nationality: author.nationality,
      worksCount: author.worksCount || works.length,
      genres: author.genres,
      famousWorks: author.famousWorks?.map(work => ({
        name: work.title,
        url: work.url,
        type: work.type
      })),
    }),

    // Profile page wrapper
    {
      "@type": "ProfilePage",
      "@id": `${authorUrl}#page`,
      "mainEntity": {
        "@type": "Person",
        "name": author.name,
      },
      "url": authorUrl,
      "name": `${author.name} - Profile`,
      "description": author.bio || `Complete works and biography of ${author.name}`,
    },

    // Works collection
    {
      "@type": "ItemList",
      "name": `Works by ${author.name}`,
      "numberOfItems": works.length,
      "itemListElement": works.slice(0, 20).map((work, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": work.title,
          "author": {
            "@type": "Person",
            "name": work.author,
          },
          "datePublished": work.datePublished,
          "genre": "Poetry",
          "inLanguage": work.language || "ur",
        },
      })),
    },
  ];

  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredDataItems.push(generateBreadcrumbStructuredData(breadcrumbs));
  }

  const structuredData = JSON.stringify(generateStructuredDataGraph(structuredDataItems));

  return { metadata, structuredData };
}

/**
 * Extract structured data from content for SEO optimization
 */
export function extractContentMetrics(content: string): {
  wordCount: number;
  readingTime: number;
  complexity: "simple" | "moderate" | "complex";
} {
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / 200); // Average reading speed

  // Simple complexity analysis based on word count and sentence structure
  const sentences = content.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;

  let complexity: "simple" | "moderate" | "complex" = "simple";
  if (avgWordsPerSentence > 15 || words > 500) {
    complexity = "moderate";
  }
  if (avgWordsPerSentence > 25 || words > 1000) {
    complexity = "complex";
  }

  return {
    wordCount: words,
    readingTime,
    complexity,
  };
}

/**
 * Generate social sharing structured data
 */
export function generateSocialSharingData(params: {
  title: string;
  description: string;
  url: string;
  image?: string;
  author: string;
  contentType: "poetry" | "book" | "author";
}) {
  const { title, description, url, image, author, contentType } = params;
  const baseUrl = "https://jahan-numa.org";

  return {
    "@type": "SocialMediaPosting",
    "headline": title,
    "description": description,
    "url": url,
    "image": image ? `${baseUrl}${image}` : `${baseUrl}/logo.png`,
    "author": {
      "@type": "Person",
      "name": author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jahannuma",
      "url": baseUrl,
    },
    "genre": contentType === "poetry" ? "Poetry" : contentType === "book" ? "Literature" : "Biography",
    "inLanguage": "ur",
  };
}