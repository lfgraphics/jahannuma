/**
 * Comprehensive SEO utilities that combine metadata and structured data
 * for optimal search engine optimization across all content types.
 */

import { generatePageMetadata } from "@/src";
import { Metadata } from "next";
import {
  DynamicContentMetadata,
  generateAuthorMetadata,
  generateDynamicContentMetadata,
  generateIndividualContentMetadata
} from "./metadata";
import {
  createComprehensivePageJSONLD
} from "./structured-data";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOContentItem {
  id: string;
  title: string;
  author: string;
  content?: string;
  excerpt?: string;
  datePublished?: string;
  tags?: string[];
  image?: string;
  url?: string;
}

export interface SEOPageData {
  url: string;
  title: string;
  description: string;
  language?: "ur" | "en" | "hi";
  image?: string;
}

export interface SEOAuthorData {
  name: string;
  bio?: string;
  worksCount?: number;
  birthYear?: string;
  deathYear?: string;
  genres?: string[];
  image?: string;
}

/**
 * Generate complete SEO package for collection pages (Ashaar, Ghazlen, etc.)
 */
export async function generateCollectionPageSEO(params: {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  language?: "ur" | "en" | "hi";
  items: SEOContentItem[];
  totalCount?: number;
  featuredAuthors?: string[];
  popularTags?: string[];
  breadcrumbs?: BreadcrumbItem[];
}): Promise<{
  metadata: Metadata;
  structuredData: string;
}> {
  const {
    contentType,
    language = "ur",
    items,
    totalCount,
    featuredAuthors,
    popularTags,
    breadcrumbs
  } = params;

  // Generate dynamic content metadata
  const dynamicContent: DynamicContentMetadata = {
    contentType,
    totalCount,
    featuredAuthors,
    recentContent: items.slice(0, 5).map(item => ({
      title: item.title,
      author: item.author,
      excerpt: item.excerpt,
    })),
    popularTags,
  };

  // Generate base metadata using the available function
  const baseMetadata = generatePageMetadata({
    title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Collection`,
    description: `Explore our collection of ${contentType}`,
    keywords: featuredAuthors || [],
    url: `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
    language,
  });

  // Enhance with dynamic content
  const metadata = generateDynamicContentMetadata({
    ...baseMetadata,
    url: `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
    title: (typeof baseMetadata.title === 'string' ? baseMetadata.title : baseMetadata.title?.toString()) || `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} - Jahannuma`,
    description: baseMetadata.description || `Explore ${contentType} collection on Jahannuma`,
    keywords: Array.isArray(baseMetadata.keywords) ? baseMetadata.keywords : (baseMetadata.keywords ? [baseMetadata.keywords] : undefined)
  }, dynamicContent);

  // Generate structured data
  const pageData: SEOPageData = {
    url: `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
    title: metadata.title as string,
    description: metadata.description as string,
    language,
  };

  const structuredData = createComprehensivePageJSONLD({
    pageType: "collection",
    page: pageData,
    content: {
      type: contentType,
      items: items.map(item => ({
        name: item.title,
        author: item.author,
        url: item.url,
        datePublished: item.datePublished,
        description: item.excerpt,
        image: item.image,
      })),
      totalCount,
    },
    breadcrumbs,
  });

  return { metadata, structuredData };
}

/**
 * Generate complete SEO package for individual content pages
 */
export async function generateIndividualContentSEO(params: {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai";
  item: SEOContentItem;
  language?: "ur" | "en" | "hi";
  breadcrumbs?: BreadcrumbItem[];
  relatedItems?: SEOContentItem[];
}): Promise<{
  metadata: Metadata;
  structuredData: string;
}> {
  const { contentType, item, language = "ur", breadcrumbs, relatedItems } = params;

  // Generate metadata
  const metadata = generateIndividualContentMetadata({
    contentType,
    title: item.title,
    author: item.author,
    content: item.content || item.excerpt || "",
    id: item.id,
    language,
    datePublished: item.datePublished,
    tags: item.tags,
  });

  // Generate structured data
  const pageData: SEOPageData = {
    url: `/${contentType}/${item.id}`,
    title: metadata.title as string,
    description: metadata.description as string,
    language,
  };

  const structuredData = createComprehensivePageJSONLD({
    pageType: "individual",
    page: pageData,
    content: {
      type: contentType,
      items: [{
        name: item.title,
        author: item.author,
        url: item.url || `/${contentType}/${item.id}`,
        datePublished: item.datePublished,
        description: item.content || item.excerpt,
        image: item.image,
      }],
    },
    breadcrumbs,
  });

  return { metadata, structuredData };
}

/**
 * Generate complete SEO package for author pages
 */
export async function generateAuthorPageSEO(params: {
  author: SEOAuthorData;
  works: SEOContentItem[];
  language?: "ur" | "en" | "hi";
  breadcrumbs?: BreadcrumbItem[];
}): Promise<{
  metadata: Metadata;
  structuredData: string;
}> {
  const { author, works, language = "ur", breadcrumbs } = params;

  // Generate metadata
  const metadata = generateAuthorMetadata({
    name: author.name,
    bio: author.bio,
    worksCount: author.worksCount || works.length,
    language,
    birthYear: author.birthYear,
    deathYear: author.deathYear,
    genres: author.genres,
  });

  // Generate structured data
  const pageData: SEOPageData = {
    url: `/shaer/${encodeURIComponent(author.name)}`,
    title: metadata.title as string,
    description: metadata.description as string,
    language,
  };

  const structuredData = createComprehensivePageJSONLD({
    pageType: "author",
    page: pageData,
    author: {
      name: author.name,
      description: author.bio,
      worksCount: author.worksCount || works.length,
      birthDate: author.birthYear,
      deathDate: author.deathYear,
    },
    breadcrumbs,
  });

  return { metadata, structuredData };
}

/**
 * Generate SEO-optimized breadcrumbs for any page
 */
export function generateSEOBreadcrumbs(params: {
  contentType?: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  itemTitle?: string;
  authorName?: string;
  language?: "ur" | "en" | "hi";
}): BreadcrumbItem[] {
  const { contentType, itemTitle, authorName, language = "ur" } = params;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: language === "ur" ? "ہوم" : language === "hi" ? "होम" : "Home",
      url: "/",
    },
  ];

  if (contentType) {
    const contentNames = {
      ashaar: { ur: "اشعار", en: "Ashaar", hi: "अशार" },
      ghazlen: { ur: "غزلیں", en: "Ghazlen", hi: "ग़ज़ल" },
      nazmen: { ur: "نظمیں", en: "Nazmen", hi: "नज़्म" },
      rubai: { ur: "رباعیاں", en: "Rubai", hi: "रुबाई" },
      ebooks: { ur: "کتابیں", en: "E-Books", hi: "पुस्तकें" },
    };

    breadcrumbs.push({
      name: contentNames[contentType][language],
      url: `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
    });

    if (authorName) {
      breadcrumbs.push({
        name: authorName,
        url: `/shaer/${encodeURIComponent(authorName)}`,
      });
    }

    if (itemTitle) {
      breadcrumbs.push({
        name: itemTitle.length > 50 ? itemTitle.substring(0, 50) + "..." : itemTitle,
        url: "", // Current page, no URL needed
      });
    }
  }

  return breadcrumbs;
}

/**
 * Extract SEO-relevant keywords from content
 */
export function extractSEOKeywords(content: string, language: "ur" | "en" | "hi" = "ur"): string[] {
  if (!content) return [];

  // Common poetry-related keywords by language
  const commonKeywords = {
    ur: ["شعر", "شاعری", "غزل", "نظم", "رباعی", "اشعار", "ادب", "کلام"],
    en: ["poetry", "poem", "verse", "literature", "ghazal", "nazm", "rubai", "ashaar"],
    hi: ["शायरी", "कविता", "साहित्य", "ग़ज़ल", "नज़्म", "रुबाई", "अशार"],
  };

  // Extract words from content (simple approach)
  const words = content
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF\u0900-\u097F]/g, " ") // Keep Urdu, Hindi, and English characters
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10); // Limit to first 10 meaningful words

  return [...commonKeywords[language], ...words];
}

/**
 * Generate canonical URLs with proper language handling
 */
export function generateCanonicalURL(params: {
  path: string;
  language?: "ur" | "en" | "hi";
  baseUrl?: string;
}): string {
  const { path, language = "ur", baseUrl = "https://jahan-numa.org" } = params;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (language === "ur") {
    return `${baseUrl}${cleanPath}`;
  }

  return `${baseUrl}/${language.toUpperCase()}${cleanPath}`;
}

/**
 * Generate alternate language links for i18n SEO
 */
export function generateAlternateLanguageLinks(path: string): Record<string, string> {
  const baseUrl = "https://jahan-numa.org";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return {
    "ur": `${baseUrl}${cleanPath}`,
    "en": `${baseUrl}/EN${cleanPath}`,
    "hi": `${baseUrl}/HI${cleanPath}`,
    "x-default": `${baseUrl}${cleanPath}`, // Default to Urdu
  };
}