// Base interfaces for structured data
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface Person {
  "@type": "Person";
  "@id"?: string;
  name: string;
  description?: string;
  url?: string;
  image?: any;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  jobTitle?: string[];
  knowsAbout?: string[];
  worksFor?: {
    "@type": "Organization";
    name: string;
  };
  additionalProperty?: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string | number;
  }>;
  mainEntityOfPage?: any[];
  publisher?: {
    "@type": "Organization";
    name: string;
  };
}

export interface Organization {
  "@type": "Organization";
  "@id"?: string;
  name: string;
  description?: string;
  url?: string;
  logo?: any;
  foundingDate?: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    email?: string;
    contactType?: string;
  };
}

export interface SchemaOrgThing {
  "@type": string;
  "@id"?: string;
  name?: string;
  url?: string;
}

export interface WebsiteStructuredDataOptions {
  name: string;
  description: string;
  url: string;
  searchUrl?: string;
  language?: string;
  logo?: string;
  sameAs?: string[];
}

export interface OrganizationStructuredDataOptions {
  name: string;
  description: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface ArticleStructuredDataOptions {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  publisher: {
    name: string;
    logo?: string;
  };
  mainEntityOfPage?: string;
  articleSection?: string;
  keywords?: string[];
}

export interface PoemStructuredDataOptions {
  name: string;
  author: string;
  text: string[];
  dateCreated?: string;
  inLanguage?: string;
  genre?: string;
  url?: string;
  publisher?: {
    name: string;
    url?: string;
  };
}

export function generateWebsiteStructuredData(options: WebsiteStructuredDataOptions) {
  const {
    name,
    description,
    url,
    searchUrl,
    language = "ur",
    logo = "/logo.png",
    sameAs = [],
  } = options;

  const baseUrl = "https://jahan-numa.org";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const fullLogoUrl = logo.startsWith("http") ? logo : `${baseUrl}${logo}`;

  return {
    "@type": "WebSite",
    "@id": `${fullUrl}#website`,
    name,
    description,
    url: fullUrl,
    inLanguage: language,
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}#organization`,
      name,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: fullLogoUrl,
      },
      sameAs,
    },
    potentialAction: searchUrl
      ? {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}${searchUrl}?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      }
      : undefined,
  };
}

export function generateOrganizationStructuredData(options: OrganizationStructuredDataOptions) {
  const {
    name,
    description,
    url,
    logo = "/logo.png",
    contactPoint,
    sameAs = [],
  } = options;

  const baseUrl = "https://jahan-numa.org";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const fullLogoUrl = logo.startsWith("http") ? logo : `${baseUrl}${logo}`;

  return {
    "@type": "Organization",
    "@id": `${fullUrl}#organization`,
    name,
    description,
    url: fullUrl,
    logo: {
      "@type": "ImageObject",
      url: fullLogoUrl,
    },
    contactPoint: contactPoint
      ? {
        "@type": "ContactPoint",
        ...contactPoint,
      }
      : undefined,
    sameAs,
  };
}

export function generateArticleStructuredData(options: ArticleStructuredDataOptions) {
  const {
    headline,
    description,
    author,
    datePublished,
    dateModified,
    url,
    image,
    publisher,
    mainEntityOfPage,
    articleSection,
    keywords = [],
  } = options;

  const baseUrl = "https://jahan-numa.org";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const fullImageUrl = image && image.startsWith("http") ? image : `${baseUrl}${image || "/logo.png"}`;
  const fullPublisherLogo = publisher.logo && publisher.logo.startsWith("http")
    ? publisher.logo
    : `${baseUrl}${publisher.logo || "/logo.png"}`;

  return {
    "@type": "Article",
    "@id": `${fullUrl}#article`,
    headline,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: mainEntityOfPage || fullUrl,
    image: {
      "@type": "ImageObject",
      url: fullImageUrl,
    },
    publisher: {
      "@type": "Organization",
      name: publisher.name,
      logo: {
        "@type": "ImageObject",
        url: fullPublisherLogo,
      },
    },
    articleSection,
    keywords: keywords.join(", "),
  };
}

export function generatePoemStructuredData(options: PoemStructuredDataOptions) {
  const {
    name,
    author,
    text,
    dateCreated,
    inLanguage = "ur",
    genre = "Poetry",
    url,
    publisher,
  } = options;

  const baseUrl = "https://jahan-numa.org";
  const fullUrl = url && url.startsWith("http") ? url : `${baseUrl}${url || ""}`;

  return {
    "@type": "CreativeWork",
    "@id": fullUrl ? `${fullUrl}#poem` : undefined,
    name,
    author: {
      "@type": "Person",
      name: author,
    },
    text: text.join("\n"),
    dateCreated,
    inLanguage,
    genre,
    url: fullUrl || undefined,
    publisher: publisher
      ? {
        "@type": "Organization",
        name: publisher.name,
        url: publisher.url,
      }
      : undefined,
  };
}

export function generatePoetryStructuredData(options: {
  type: string;
  title: string;
  content: string;
  author: string;
  url: string;
  datePublished?: string;
  language: string;
}) {
  const {
    type,
    title,
    content,
    author,
    url,
    datePublished,
    language = "ur"
  } = options;

  const baseUrl = "https://jahan-numa.org";
  const fullUrl = url && url.startsWith("http") ? url : `${baseUrl}${url || ""}`;

  return {
    "@type": "CreativeWork",
    "@id": fullUrl ? `${fullUrl}#${type}` : undefined,
    name: title,
    author: {
      "@type": "Person",
      name: author,
    },
    text: content,
    dateCreated: datePublished,
    inLanguage: language,
    genre: type.charAt(0).toUpperCase() + type.slice(1),
    url: fullUrl || undefined,
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = "https://jahan-numa.org";

  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export interface CollectionStructuredDataOptions {
  type: "CollectionPage" | "ItemList";
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
  items?: Array<{
    "@type": string;
    name: string;
    author?: string;
    description?: string;
    datePublished?: string;
    url?: string;
    image?: string;
  }>;
}

export function generateCollectionStructuredData(options: CollectionStructuredDataOptions) {
  const {
    type = "CollectionPage",
    name,
    description,
    url,
    numberOfItems,
    items = [],
  } = options;

  const baseUrl = "https://jahan-numa.org";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  const structuredData: any = {
    "@type": type,
    "@id": `${fullUrl}#collection`,
    name,
    description,
    url: fullUrl,
  };

  if (numberOfItems !== undefined) {
    structuredData.numberOfItems = numberOfItems;
  }

  if (items.length > 0) {
    structuredData.mainEntity = {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          ...item,
          url: item.url && item.url.startsWith("http") ? item.url : `${baseUrl}${item.url || ""}`,
          image: item.image && item.image.startsWith("http") ? item.image : `${baseUrl}${item.image || "/logo.png"}`,
        },
      })),
    };
  }

  return structuredData;
}/**
 
* Generate enhanced book structured data for E-Books.
 */
export function generateBookStructuredData(params: {
  name: string;
  author: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string;
  publisher?: string;
  isbn?: string;
  numberOfPages?: number;
  inLanguage?: string;
  genre?: string[];
  downloadUrl?: string;
}): any {
  const {
    name,
    author,
    description,
    url,
    image,
    datePublished,
    publisher = "Jahannuma",
    isbn,
    numberOfPages,
    inLanguage = "ur",
    genre = ["Poetry", "Literature"],
    downloadUrl,
  } = params;

  const structuredData = {
    "@type": "Book",
    "@id": `${url}/#book`,
    name,
    author: {
      "@type": "Person",
      name: author,
    },
    description,
    url,
    image: image ? {
      "@type": "ImageObject",
      url: image,
    } : undefined,
    datePublished,
    publisher: {
      "@type": "Organization",
      name: publisher,
      url: "https://jahan-numa.org",
    },
    isbn,
    numberOfPages,
    inLanguage,
    genre,
    // Add download action if available
    potentialAction: downloadUrl ? {
      "@type": "DownloadAction",
      target: downloadUrl,
      name: "Download Book",
    } : undefined,
    // Additional properties for digital books
    bookFormat: "EBook",
    isAccessibleForFree: true,
  };

  return structuredData;
}

/**
 * Generate enhanced collection page structured data.
 */
export function generateCollectionPageStructuredData(params: {
  name: string;
  description: string;
  url: string;
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  numberOfItems: number;
  items: Array<{
    name: string;
    author: string;
    url?: string;
    datePublished?: string;
    description?: string;
    image?: string;
  }>;
  language?: string;
}): any {
  const {
    name,
    description,
    url,
    contentType,
    numberOfItems,
    items,
    language = "ur",
  } = params;

  const itemTypes = {
    ashaar: "CreativeWork",
    ghazlen: "CreativeWork",
    nazmen: "CreativeWork",
    rubai: "CreativeWork",
    ebooks: "Book",
  };

  const structuredData = {
    "@type": "CollectionPage",
    "@id": `${url}/#collection`,
    name,
    description,
    url,
    inLanguage: language,
    numberOfItems,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: Math.min(items.length, 20), // Limit to first 20 items
      itemListElement: items.slice(0, 20).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": itemTypes[contentType],
          name: item.name,
          author: {
            "@type": "Person",
            name: item.author,
          },
          url: item.url,
          datePublished: item.datePublished,
          description: item.description,
          image: item.image ? {
            "@type": "ImageObject",
            url: item.image,
          } : undefined,
          inLanguage: language,
          genre: contentType === "ebooks" ? ["Literature", "Poetry"] : "Poetry",
          publisher: {
            "@type": "Organization",
            name: "Jahannuma",
            url: "https://jahan-numa.org",
          },
        },
      })),
    },
    // Add search functionality
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return structuredData;
}

/**
 * Generate comprehensive author/poet structured data.
 */
export function generatePoetStructuredData(params: {
  name: string;
  description?: string;
  url?: string;
  image?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  worksCount?: number;
  genres?: string[];
  famousWorks?: Array<{
    name: string;
    url?: string;
    type: "ashaar" | "ghazlen" | "nazmen" | "rubai";
  }>;
}): Person {
  const {
    name,
    description,
    url,
    image,
    birthDate,
    deathDate,
    nationality = "Pakistani",
    worksCount,
    genres = ["Poetry", "Literature"],
    famousWorks = [],
  } = params;

  const structuredData: Person = {
    "@type": "Person",
    "@id": url ? `${url}/#person` : undefined,
    name,
    description,
    url,
    image: image ? {
      "@type": "ImageObject",
      url: image,
    } : undefined,
    birthDate,
    deathDate,
    nationality,
    jobTitle: ["Poet", "Writer", "Author"],
    knowsAbout: ["Poetry", "Urdu Literature", "Classical Literature", ...genres],
    worksFor: {
      "@type": "Organization",
      name: "Jahannuma",
    },
    // Add works count as additional property
    ...(worksCount || famousWorks.length > 0 ? {
      additionalProperty: [
        ...(worksCount ? [{
          "@type": "PropertyValue" as const,
          name: "Published Works",
          value: worksCount,
        }] : []),
        ...(famousWorks.length > 0 ? [{
          "@type": "PropertyValue" as const,
          name: "Famous Works",
          value: famousWorks.map(work => work.name).join(", "),
        }] : []),
      ]
    } : {}),
    // Add famous works as creative works
    ...(famousWorks.length > 0 && {
      mainEntityOfPage: famousWorks.map(work => ({
        "@type": "CreativeWork",
        name: work.name,
        url: work.url,
        author: {
          "@type": "Person",
          name,
        },
        genre: "Poetry",
      })),
    }),
  };

  return structuredData;
}

/**
 * Generate comprehensive website organization data.
 */
export function generateJahannumaOrganizationData(): Organization {
  return {
    "@type": "Organization",
    "@id": "https://jahan-numa.org/#organization",
    name: "Jahannuma",
    description: "Digital platform for Urdu poetry, literature, and cultural heritage preservation",
    url: "https://jahan-numa.org",
    logo: {
      "@type": "ImageObject",
      url: "https://jahan-numa.org/logo.png",
    },
    foundingDate: "2020",
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@jahan-numa.org",
      contactType: "Customer Support",
    },
  };
}

/**
 * Generate search results structured data.
 */
export function generateSearchResultsStructuredData(params: {
  query: string;
  results: Array<{
    name: string;
    url: string;
    description?: string;
    author?: string;
    type: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks" | "author";
  }>;
  totalResults: number;
  url: string;
}): any {
  const { query, results, totalResults, url } = params;

  return {
    "@type": "SearchResultsPage",
    "@id": `${url}/#search`,
    name: `Search Results for "${query}"`,
    description: `Found ${totalResults} results for "${query}" on Jahannuma`,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: results.length,
      itemListElement: results.map((result, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": result.type === "author" ? "Person" :
            result.type === "ebooks" ? "Book" : "CreativeWork",
          name: result.name,
          url: result.url,
          description: result.description,
          ...(result.author && {
            author: {
              "@type": "Person",
              name: result.author,
            },
          }),
        },
      })),
    },
    potentialAction: {
      "@type": "SearchAction",
      query,
      target: url,
    },
  };
}

/**
 * Create complete JSON-LD for any page type with comprehensive SEO data.
 */
export function createComprehensivePageJSONLD(params: {
  pageType: "collection" | "individual" | "author" | "search" | "home";
  page: {
    url: string;
    title: string;
    description: string;
    language?: string;
  };
  content?: {
    type: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
    items?: Array<{
      name: string;
      author: string;
      url?: string;
      datePublished?: string;
      description?: string;
      image?: string;
    }>;
    totalCount?: number;
  };
  author?: {
    name: string;
    description?: string;
    worksCount?: number;
    birthDate?: string;
    deathDate?: string;
  };
  breadcrumbs?: BreadcrumbItem[];
}): string {
  const { pageType, page, content, author, breadcrumbs } = params;
  const baseUrl = "https://jahan-numa.org";

  const items: SchemaOrgThing[] = [
    // Always include website and organization data
    generateWebsiteStructuredData({
      name: "Jahannuma",
      description: "Discover the beauty of Urdu poetry, ghazals, nazms, and literary works",
      url: baseUrl,
      searchUrl: `${baseUrl}/search`,
      language: page.language || "ur",
    }),
    generateJahannumaOrganizationData(),
  ];

  // Add page-specific structured data
  switch (pageType) {
    case "collection":
      if (content && content.items) {
        items.push(generateCollectionPageStructuredData({
          name: page.title,
          description: page.description,
          url: `${baseUrl}${page.url}`,
          contentType: content.type,
          numberOfItems: content.totalCount || content.items.length,
          items: content.items,
          language: page.language,
        }));
      }
      break;

    case "individual":
      if (content && content.items && content.items[0]) {
        const item = content.items[0];
        if (content.type === "ebooks") {
          items.push(generateBookStructuredData({
            name: item.name,
            author: item.author,
            description: item.description,
            url: `${baseUrl}${item.url}`,
            image: item.image,
            datePublished: item.datePublished,
            inLanguage: page.language,
          }));
        } else {
          items.push(generatePoetryStructuredData({
            type: content.type,
            title: item.name,
            content: item.description || "",
            author: item.author,
            url: `${baseUrl}${item.url}`,
            datePublished: item.datePublished,
            language: page.language || "ur",
          }));
        }
      }
      break;

    case "author":
      if (author) {
        items.push(generatePoetStructuredData({
          name: author.name,
          description: author.description,
          url: `${baseUrl}${page.url}`,
          worksCount: author.worksCount,
          birthDate: author.birthDate,
          deathDate: author.deathDate,
        }));
      }
      break;
  }

  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    items.push(generateBreadcrumbStructuredData(breadcrumbs));
  }

  const graph = generateStructuredDataGraph(items);
  return toJSONLD(graph);
}

export function generateStructuredDataGraph(items: any[]) {
  return {
    "@context": "https://schema.org",
    "@graph": items
  };
}

export function toJSONLD(data: any): string {
  return JSON.stringify(data, null, 2);
}