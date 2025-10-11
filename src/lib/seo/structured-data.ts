/**
 * Structured data utilities for generating JSON-LD schema markup.
 * Provides SEO-optimized structured data for better search engine understanding.
 */

// Basic schema.org types for JSON-LD
export interface SchemaOrgThing {
  "@type": string;
  "@id"?: string;
  name?: string;
  description?: string;
  url?: string;
  image?: string | { "@type": "ImageObject"; url: string };
}

export interface WebSite extends SchemaOrgThing {
  "@type": "WebSite";
  inLanguage?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: { "@type": "EntryPoint"; urlTemplate: string };
    "query-input": string;
  };
}

export interface Article extends SchemaOrgThing {
  "@type": "Article";
  headline?: string;
  author?: { "@type": "Person"; name: string };
  publisher?: {
    "@type": "Organization";
    name: string;
    url: string;
    logo?: { "@type": "ImageObject"; url: string };
  };
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  genre?: string;
  wordCount?: number;
  mainEntityOfPage?: { "@type": "WebPage"; "@id": string };
}

export interface Person extends SchemaOrgThing {
  "@type": "Person";
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  jobTitle?: string[];
  knowsAbout?: string[];
  worksFor?: { "@type": "Organization"; name: string };
  additionalProperty?: {
    "@type": "PropertyValue";
    name: string;
    value: number | string;
  };
}

export interface Organization extends SchemaOrgThing {
  "@type": "Organization";
  logo?: { "@type": "ImageObject"; url: string };
  contactPoint?: {
    "@type": "ContactPoint";
    email: string;
    contactType: string;
  };
  foundingDate?: string;
  sameAs?: string[];
}

export interface BreadcrumbList extends SchemaOrgThing {
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export interface Graph {
  "@context": string;
  "@graph": SchemaOrgThing[];
}

export interface StructuredDataParams {
  type: "website" | "article" | "person" | "organization" | "breadcrumb";
  url: string;
  name: string;
  description?: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  language?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleStructuredDataParams {
  headline: string;
  description: string;
  url: string;
  image?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  wordCount?: number;
  language?: string;
  genre?: string;
}

export interface PersonStructuredDataParams {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  occupation?: string[];
  worksCount?: number;
}

/**
 * Generate basic website structured data.
 */
export function generateWebsiteStructuredData(params: {
  name: string;
  description: string;
  url: string;
  searchUrl?: string;
  language?: string;
}): WebSite {
  const { name, description, url, searchUrl, language = "ur" } = params;

  const structuredData: WebSite = {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name,
    description,
    url,
    inLanguage: language,
    potentialAction: searchUrl
      ? {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${searchUrl}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        }
      : undefined,
  };

  return structuredData;
}

/**
 * Generate article structured data for poetry content.
 */
export function generateArticleStructuredData(
  params: ArticleStructuredDataParams
): Article {
  const {
    headline,
    description,
    url,
    image,
    author,
    datePublished,
    dateModified,
    wordCount,
    language = "ur",
    genre = "Poetry",
  } = params;

  const structuredData: Article = {
    "@type": "Article",
    "@id": `${url}/#article`,
    headline,
    description,
    url,
    image: image
      ? {
          "@type": "ImageObject",
          url: image,
        }
      : undefined,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Jahannuma",
      url: "https://jahan-numa.org",
      logo: {
        "@type": "ImageObject",
        url: "https://jahan-numa.org/favicon/android-chrome-192x192.png",
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    inLanguage: language,
    genre,
    wordCount,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return structuredData;
}

/**
 * Generate person structured data for poets/authors.
 */
export function generatePersonStructuredData(
  params: PersonStructuredDataParams
): Person {
  const {
    name,
    description,
    image,
    url,
    birthDate,
    deathDate,
    nationality,
    occupation = ["Poet", "Writer"],
    worksCount,
  } = params;

  const structuredData: Person = {
    "@type": "Person",
    "@id": url ? `${url}/#person` : undefined,
    name,
    description,
    image: image
      ? {
          "@type": "ImageObject",
          url: image,
        }
      : undefined,
    url,
    birthDate,
    deathDate,
    nationality,
    jobTitle: occupation,
    knowsAbout: ["Poetry", "Literature", "Urdu Language"],
    worksFor: {
      "@type": "Organization",
      name: "Jahannuma",
    },
    // Add custom property for works count
    additionalProperty: worksCount
      ? {
          "@type": "PropertyValue",
          name: "Published Works",
          value: worksCount,
        }
      : undefined,
  };

  return structuredData;
}

/**
 * Generate organization structured data.
 */
export function generateOrganizationStructuredData(params: {
  name: string;
  description: string;
  url: string;
  logo?: string;
  contactEmail?: string;
  foundingDate?: string;
}): Organization {
  const { name, description, url, logo, contactEmail, foundingDate } = params;

  const structuredData: Organization = {
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name,
    description,
    url,
    logo: logo
      ? {
          "@type": "ImageObject",
          url: logo,
        }
      : undefined,
    contactPoint: contactEmail
      ? {
          "@type": "ContactPoint",
          email: contactEmail,
          contactType: "Customer Support",
        }
      : undefined,
    foundingDate,
    sameAs: [
      // Add social media URLs when available
    ],
  };

  return structuredData;
}

/**
 * Generate breadcrumb structured data.
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: BreadcrumbItem[],
  baseUrl: string
): BreadcrumbList {
  const structuredData: BreadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };

  return structuredData;
}

/**
 * Generate poetry collection structured data.
 */
export function generatePoetryCollectionStructuredData(params: {
  name: string;
  description: string;
  url: string;
  author: string;
  datePublished?: string;
  poems: Array<{ title: string; url: string }>;
  language?: string;
}) {
  const {
    name,
    description,
    url,
    author,
    datePublished,
    poems,
    language = "ur",
  } = params;

  const structuredData = {
    "@type": "CreativeWork",
    "@id": `${url}/#collection`,
    name,
    description,
    url,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished,
    inLanguage: language,
    genre: "Poetry",
    hasPart: poems.map((poem) => ({
      "@type": "CreativeWork",
      name: poem.title,
      url: poem.url,
      author: {
        "@type": "Person",
        name: author,
      },
      genre: "Poetry",
    })),
    publisher: {
      "@type": "Organization",
      name: "Jahannuma",
      url: "https://jahan-numa.org",
    },
  };

  return structuredData;
}

/**
 * Generate FAQ structured data.
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
) {
  const structuredData = {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return structuredData;
}

/**
 * Generate complete structured data graph for a page.
 */
export function generateStructuredDataGraph(items: SchemaOrgThing[]): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": items,
  };
}

/**
 * Convert structured data to JSON-LD script tag content.
 */
export function toJSONLD(structuredData: SchemaOrgThing | Graph): string {
  return JSON.stringify(structuredData, null, 2);
}

/**
 * Generate poetry-specific structured data with rich metadata.
 */
export function generatePoetryStructuredData(params: {
  type: "ashaar" | "ghazlen" | "nazmen" | "rubai";
  title: string;
  content: string;
  author: string;
  url: string;
  datePublished?: string;
  language?: string;
  meter?: string; // Poetry meter/bahr
  rhymeScheme?: string;
  theme?: string[];
}) {
  const {
    type,
    title,
    content,
    author,
    url,
    datePublished,
    language = "ur",
    meter,
    rhymeScheme,
    theme = [],
  } = params;

  const poetryTypes = {
    ashaar: "Poetry",
    ghazlen: "Ghazal",
    nazmen: "Nazm",
    rubai: "Rubai",
  };

  const structuredData = {
    "@type": "CreativeWork",
    "@id": `${url}/#poem`,
    name: title,
    text: content,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished,
    inLanguage: language,
    genre: poetryTypes[type],
    about: theme,
    // Custom poetry properties
    additionalProperty: [
      meter
        ? {
            "@type": "PropertyValue",
            name: "Meter",
            value: meter,
          }
        : null,
      rhymeScheme
        ? {
            "@type": "PropertyValue",
            name: "Rhyme Scheme",
            value: rhymeScheme,
          }
        : null,
    ].filter(Boolean),
    publisher: {
      "@type": "Organization",
      name: "Jahannuma",
      url: "https://jahan-numa.org",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return structuredData;
}

/**
 * Utility to create a complete JSON-LD for a poetry page.
 */
export function createPoetryPageJSONLD(params: {
  poetry: {
    type: "ashaar" | "ghazlen" | "nazmen" | "rubai";
    title: string;
    content: string;
    author: string;
    datePublished?: string;
    meter?: string;
    rhymeScheme?: string;
    theme?: string[];
  };
  page: {
    url: string;
    title: string;
    description: string;
    language?: string;
  };
  breadcrumbs?: BreadcrumbItem[];
  author?: PersonStructuredDataParams;
}): string {
  const { poetry, page, breadcrumbs, author } = params;
  const baseUrl = "https://jahan-numa.org";

  const items: SchemaOrgThing[] = [
    // Website
    generateWebsiteStructuredData({
      name: "Jahannuma",
      description:
        "Discover the beauty of Urdu poetry, ghazals, nazms, and literary works",
      url: baseUrl,
      searchUrl: `${baseUrl}/search`,
      language: page.language,
    }),
    // Poetry content
    generatePoetryStructuredData({
      ...poetry,
      url: `${baseUrl}${page.url}`,
      language: page.language,
    }),
    // Article wrapper
    generateArticleStructuredData({
      headline: page.title,
      description: page.description,
      url: `${baseUrl}${page.url}`,
      author: poetry.author,
      datePublished: poetry.datePublished || new Date().toISOString(),
      language: page.language,
      genre: "Poetry",
    }),
  ];

  // Add author if provided
  if (author) {
    items.push(generatePersonStructuredData(author));
  }

  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    items.push(generateBreadcrumbStructuredData(breadcrumbs, baseUrl));
  }

  const graph = generateStructuredDataGraph(items);
  return toJSONLD(graph);
}
