/**
 * SEO barrel export for all SEO-related utilities.
 * Centralizes metadata generation, structured data, and SEO helpers.
 */

export * from "./metadata";
export * from "./structured-data";

// Re-export commonly used types and functions
export type { PageMetadataParams, SiteConfig } from "./metadata";

export type {
  Article,
  ArticleStructuredDataParams,
  BreadcrumbItem,
  BreadcrumbList,
  Graph,
  Organization,
  Person,
  PersonStructuredDataParams,
  SchemaOrgThing,
  WebSite,
} from "./structured-data";

export {
  defaultSiteConfig,
  generateAlternateLanguages,
  generateAuthorMetadata,
  generateCanonicalUrl,
  generateOpenGraph,
  generatePageMetadata,
  generatePoetryMetadata,
  generateTwitterCard,
} from "./metadata";

export {
  createPoetryPageJSONLD,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateOrganizationStructuredData,
  generatePersonStructuredData,
  generatePoetryCollectionStructuredData,
  generatePoetryStructuredData,
  generateStructuredDataGraph,
  generateWebsiteStructuredData,
  toJSONLD,
} from "./structured-data";
