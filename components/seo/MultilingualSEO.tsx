import { Language } from "@/lib/multilingual-texts";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbStructuredData, generateOrganizationStructuredData, generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";

export interface AlternateLanguage {
  language: Language;
  url: string;
}

export interface MultilingualSEOProps {
  /** Current page language */
  language: Language;
  /** Page title in current language */
  title: string;
  /** Page description in current language */
  description: string;
  /** Current page path (without language prefix) */
  path: string;
  /** Keywords for the page */
  keywords?: string[];
  /** Page image */
  image?: string;
  /** Page type */
  type?: "website" | "article";
  /** Author name for articles */
  author?: string;
  /** Published date for articles */
  publishedTime?: string;
  /** Modified date for articles */
  modifiedTime?: string;
  /** Article section */
  section?: string;
  /** Article tags */
  tags?: string[];
  /** Word count for articles */
  wordCount?: number;
  /** Breadcrumb items */
  breadcrumbs?: Array<{ name: string; url: string }>;
  /** Additional alternate languages (beyond default EN/HI/UR) */
  additionalAlternates?: AlternateLanguage[];
}

/**
 * Generate comprehensive multilingual SEO metadata
 */
export function generateMultilingualSEO(props: MultilingualSEOProps): Metadata {
  const {
    language,
    title,
    description,
    path,
    keywords = [],
    image,
    type = "website",
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    wordCount,
    breadcrumbs = [],
    additionalAlternates = [],
  } = props;

  // Generate alternate language URLs
  const alternateLanguages = generateAlternateLanguageUrls(path, additionalAlternates);

  // Generate canonical URL
  const canonicalUrl = generateCanonicalUrl(path, language);

  // Enhanced keywords with language-specific terms
  const enhancedKeywords = [
    ...keywords,
    ...getLanguageSpecificKeywords(language),
  ];

  // Convert language to lowercase for metadata
  const metadataLanguage = language.toLowerCase() as "ur" | "en" | "hi";

  // Generate base metadata
  const metadata = generatePageMetadata({
    title,
    description,
    keywords: enhancedKeywords,
    url: canonicalUrl,
    image,
    language: metadataLanguage,
    alternateLanguages,
    author,
    publishedTime,
    modifiedTime,
    section,
    wordCount,
  });

  // Add structured data
  const structuredData = generateStructuredDataForPage({
    language,
    title,
    description,
    url: canonicalUrl,
    breadcrumbs,
    type,
    author,
    publishedTime,
  });

  const otherMetadata = {
    ...(metadata.other || {}),
    // Add structured data as JSON-LD
    "application/ld+json": JSON.stringify(structuredData),
  };

  // Filter out undefined values
  const filteredOther = Object.fromEntries(
    Object.entries(otherMetadata).filter(([, value]) => value !== undefined)
  );

  return {
    ...metadata,
    other: filteredOther,
  };
}

/**
 * Generate alternate language URLs for hreflang
 */
function generateAlternateLanguageUrls(
  path: string,
  additionalAlternates: AlternateLanguage[] = []
): Record<string, string> {
  const baseUrl = "https://jahan-numa.org";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Default language mappings
  const defaultAlternates: Record<string, string> = {
    ur: `${baseUrl}${cleanPath}`,
    en: `${baseUrl}/EN${cleanPath}`,
    hi: `${baseUrl}/HI${cleanPath}`,
  };

  // Merge with additional alternates
  const allAlternates = { ...defaultAlternates };
  additionalAlternates.forEach(alt => {
    allAlternates[alt.language.toLowerCase()] = alt.url;
  });

  return allAlternates;
}

/**
 * Generate canonical URL based on language and path
 */
function generateCanonicalUrl(path: string, language: Language): string {
  const baseUrl = "https://jahan-numa.org";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  switch (language) {
    case "EN":
      return `${baseUrl}/EN${cleanPath}`;
    case "HI":
      return `${baseUrl}/HI${cleanPath}`;
    case "UR":
    default:
      return `${baseUrl}${cleanPath}`;
  }
}

/**
 * Get language-specific keywords
 */
function getLanguageSpecificKeywords(language: Language): string[] {
  const commonKeywords = ["جہان نما", "Jahannuma", "اردو ادب", "urdu literature", "poetry", "شاعری"];

  switch (language) {
    case "EN":
      return [
        ...commonKeywords,
        "english poetry",
        "urdu to english",
        "poetry translation",
        "literature in english",
      ];
    case "HI":
      return [
        ...commonKeywords,
        "हिंदी शायरी",
        "उर्दू साहित्य",
        "काव्य संग्रह",
        "शायरी हिंदी में",
      ];
    case "UR":
    default:
      return [
        ...commonKeywords,
        "اردو شاعری",
        "کلاسیکی ادب",
        "جدید شاعری",
        "غزل و نظم",
      ];
  }
}

/**
 * Generate structured data for the page
 */
function generateStructuredDataForPage(params: {
  language: Language;
  title: string;
  description: string;
  url: string;
  breadcrumbs: Array<{ name: string; url: string }>;
  type: "website" | "article";
  author?: string;
  publishedTime?: string;
}): any {
  const { language, title, description, url, breadcrumbs, type, author, publishedTime } = params;

  const structuredData: any[] = [];

  // Website structured data
  structuredData.push(generateWebsiteStructuredData({
    name: "Jahannuma",
    description: "Discover the beauty of Urdu poetry, ghazals, nazms, and literary works",
    url: "https://jahan-numa.org",
    searchUrl: "/search",
    language: language.toLowerCase(),
  }));

  // Organization structured data
  structuredData.push(generateOrganizationStructuredData({
    name: "Jahannuma",
    description: "Digital platform for Urdu poetry, literature, and cultural heritage preservation",
    url: "https://jahan-numa.org",
    logo: "/logo.png",
    contactEmail: "contact@jahan-numa.org",
  }));

  // Breadcrumb structured data
  if (breadcrumbs.length > 0) {
    structuredData.push(generateBreadcrumbStructuredData(breadcrumbs, "https://jahan-numa.org"));
  }

  // Article structured data for article pages
  if (type === "article" && author && publishedTime) {
    structuredData.push({
      "@type": "Article",
      "@id": `${url}#article`,
      headline: title,
      description,
      author: {
        "@type": "Person",
        name: author,
      },
      datePublished: publishedTime,
      mainEntityOfPage: url,
      publisher: {
        "@type": "Organization",
        name: "Jahannuma",
        logo: {
          "@type": "ImageObject",
          url: "https://jahan-numa.org/logo.png",
        },
      },
      inLanguage: language.toLowerCase(),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": structuredData,
  };
}

/**
 * Generate hreflang tags for Next.js metadata
 */
export function generateHreflangTags(path: string, additionalAlternates: AlternateLanguage[] = []): Record<string, string> {
  return generateAlternateLanguageUrls(path, additionalAlternates);
}

/**
 * Generate multilingual metadata for collection pages
 */
export function generateCollectionSEO(params: {
  language: Language;
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  totalCount?: number;
  featuredAuthors?: string[];
  path?: string;
}): Metadata {
  const { language, contentType, totalCount, featuredAuthors, path } = params;

  // Content type configurations
  const contentConfig = {
    ashaar: {
      title: { UR: "اشعار", EN: "Ashaar - Poetry Couplets", HI: "अशार" },
      description: {
        UR: "خوبصورت اشعار اور شعری اقوال کا مجموعہ۔ مشہور شعراء کے بہترین اشعار پڑھیں۔",
        EN: "Beautiful poetry couplets and verses from renowned poets. Explore timeless Urdu literature.",
        HI: "प्रसिद्ध कवियों के सुंदर अशार और काव्य पंक्तियों का संग्रह।"
      },
      keywords: ["اشعار", "شعری اقوال", "poetry couplets", "urdu poetry", "ashaar"],
    },
    ghazlen: {
      title: { UR: "غزلیں", EN: "Ghazlen - Urdu Ghazals", HI: "ग़ज़ल" },
      description: {
        UR: "کلاسیکی اور جدید غزلوں کا خزانہ۔ مشہور شعراء کی بہترین غزلیں پڑھیں۔",
        EN: "Treasury of classical and modern Urdu ghazals from renowned poets.",
        HI: "प्रसिद्ध कवियों की क्लासिकल और आधुनिक ग़ज़लों का खजाना।"
      },
      keywords: ["غزلیں", "اردو غزل", "ghazal", "urdu ghazal", "classical poetry"],
    },
    nazmen: {
      title: { UR: "نظمیں", EN: "Nazmen - Urdu Poems", HI: "नज़्म" },
      description: {
        UR: "اردو نظموں کا بہترین مجموعہ۔ مختلف موضوعات پر لکھی گئی نظمیں پڑھیں۔",
        EN: "Finest collection of Urdu poems on various themes and subjects.",
        HI: "विभिन्न विषयों पर लिखी गई उर्दू नज़्मों का बेहतरीन संग्रह।"
      },
      keywords: ["نظمیں", "اردو نظم", "nazm", "urdu poems", "poetry"],
    },
    rubai: {
      title: { UR: "رباعیاں", EN: "Rubai - Quatrains", HI: "रुबाई" },
      description: {
        UR: "چار مصرعوں کی خوبصورت رباعیاں۔ حکیمانہ اور فلسفیانہ اشعار پڑھیں۔",
        EN: "Beautiful four-line quatrains with wisdom and philosophical insights.",
        HI: "चार पंक्तियों की सुंदर रुबाइयां। ज्ञान और दर्शन से भरे अशार।"
      },
      keywords: ["رباعیاں", "چار مصرعے", "rubai", "quatrains", "wisdom poetry"],
    },
    ebooks: {
      title: { UR: "کتابیں", EN: "E-Books - Digital Library", HI: "पुस्तकें" },
      description: {
        UR: "ڈیجیٹل کتابوں کا مجموعہ۔ شاعری، ادب اور تاریخ کی کتابیں پڑھیں اور ڈاؤن لوڈ کریں۔",
        EN: "Digital library of books on poetry, literature and history. Read and download for free.",
        HI: "शायरी, साहित्य और इतिहास की डिजिटल पुस्तकों का संग्रह।"
      },
      keywords: ["کتابیں", "ڈیجیٹل لائبریری", "ebooks", "digital books", "urdu books"],
    },
  };

  const config = contentConfig[contentType];
  const title = (config.title as any)[language];
  let description = (config.description as any)[language];

  // Add dynamic content to description
  if (totalCount) {
    description += ` ${totalCount} items available.`;
  }
  if (featuredAuthors && featuredAuthors.length > 0) {
    const authors = featuredAuthors.slice(0, 3).join(", ");
    description += ` Featured: ${authors}.`;
  }

  const pagePath = path || `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`;

  return generateMultilingualSEO({
    language,
    title,
    description,
    path: pagePath,
    keywords: [
      ...config.keywords,
      ...(featuredAuthors || []).slice(0, 5),
    ],
    image: `/metaImages/${contentType}.jpg`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: title, url: pagePath },
    ],
  });
}

/**
 * Generate multilingual metadata for individual content pages
 */
export function generateIndividualContentSEO(params: {
  language: Language;
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  title: string;
  author: string;
  content: string;
  id: string;
  datePublished?: string;
  tags?: string[];
}): Metadata {
  const { language, contentType, title, author, content, id, datePublished, tags = [] } = params;

  // Extract excerpt from content
  const excerpt = content.length > 150 ? content.substring(0, 150) + "..." : content;

  const contentTypeNames = {
    ashaar: { UR: "شعر", EN: "Poetry", HI: "अशार" },
    ghazlen: { UR: "غزل", EN: "Ghazal", HI: "ग़ज़ल" },
    nazmen: { UR: "نظم", EN: "Nazm", HI: "नज़्म" },
    rubai: { UR: "رباعی", EN: "Rubai", HI: "रुबाई" },
    ebooks: { UR: "کتاب", EN: "Book", HI: "पुस्तक" },
  };

  const typeName = (contentTypeNames[contentType] as any)[language];
  const fullTitle = `${title} - ${typeName} by ${author}`;
  const description = `${excerpt} Read this beautiful ${typeName.toLowerCase()} by ${author} on Jahannuma.`;
  const pagePath = `/${contentType}/${id}`;

  return generateMultilingualSEO({
    language,
    title: fullTitle,
    description,
    path: pagePath,
    keywords: [
      typeName,
      author,
      title,
      "اردو شاعری",
      "urdu poetry",
      "جہان نما",
      ...tags,
    ],
    image: `/metaImages/${contentType}.jpg`,
    type: "article",
    author,
    publishedTime: datePublished,
    section: "Poetry",
    tags,
    wordCount: content.split(/\s+/).length,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: contentType.charAt(0).toUpperCase() + contentType.slice(1), url: `/${contentType}` },
      { name: title, url: pagePath },
    ],
  });
}

/**
 * Generate multilingual metadata for author pages
 */
export function generateAuthorSEO(params: {
  language: Language;
  name: string;
  bio?: string;
  worksCount?: number;
  birthYear?: string;
  deathYear?: string;
  genres?: string[];
}): Metadata {
  const { language, name, bio, worksCount, birthYear, deathYear, genres = [] } = params;

  const titles = {
    UR: `${name} - شاعر`,
    EN: `${name} - Poet`,
    HI: `${name} - कवि`,
  };

  const descriptions = {
    UR: `${name} کی مکمل شاعری پڑھیں۔ ${worksCount ? `${worksCount} تخلیقات` : "تمام کلام"} جہان نما پر دستیاب۔`,
    EN: `Complete poetry collection of ${name}. ${worksCount ? `${worksCount} works` : "All works"} available on Jahannuma.`,
    HI: `${name} की संपूर्ण शायरी पढ़ें। ${worksCount ? `${worksCount} रचनाएं` : "सभी रचनाएं"} जहाननुमा पर उपलब्ध।`,
  };

  let description = (descriptions as any)[language];
  if (bio) {
    description = bio.length > 150 ? bio.substring(0, 150) + "..." : bio;
    description += ` ${(descriptions as any)[language]}`;
  }

  const lifeSpan = birthYear && deathYear ? `${birthYear}-${deathYear}` :
    birthYear ? `b. ${birthYear}` : "";

  const pagePath = `/shaer/${encodeURIComponent(name)}`;

  return generateMultilingualSEO({
    language,
    title: (titles as any)[language],
    description,
    path: pagePath,
    keywords: [
      name,
      "شاعر",
      "poet",
      "اردو شاعری",
      "urdu poetry",
      lifeSpan,
      ...genres,
    ].filter(Boolean),
    author: name,
    type: "article",
    section: "Author",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Poets", url: "/shaer" },
      { name: name, url: pagePath },
    ],
  });
}