/**
 * SEO metadata utilities for generating Next.js metadata objects.
 * Provides comprehensive SEO support with Open Graph, Twitter Cards, and more.
 */

import type { Metadata } from "next";

export interface PageMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  language?: "en" | "ur" | "hi";
  alternateLanguages?: Record<string, string>;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  defaultLanguage: "en" | "ur" | "hi";
  supportedLanguages: string[];
  defaultImage: string;
  twitterHandle?: string;
  fbAppId?: string;
}

// Default site configuration
export const defaultSiteConfig: SiteConfig = {
  name: "Jahannuma",
  description:
    "Discover the beauty of Urdu poetry, ghazals, nazms, and literary works",
  url: "https://jahan-numa.org",
  defaultLanguage: "ur",
  supportedLanguages: ["en", "ur", "hi"],
  defaultImage: "/metaImages/default-og.jpg",
  twitterHandle: "@jahannuma",
};

/**
 * Generate comprehensive page metadata for Next.js.
 */
export function generatePageMetadata(
  params: PageMetadataParams,
  siteConfig: SiteConfig = defaultSiteConfig
): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    author,
    publishedTime,
    modifiedTime,
    section = "website",
    language = siteConfig.defaultLanguage,
    alternateLanguages = {},
  } = params;

  const fullTitle = title.includes(siteConfig.name)
    ? title
    : `${title} | ${siteConfig.name}`;
  const canonicalUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const ogImage = image
    ? `${siteConfig.url}${image}`
    : `${siteConfig.url}${siteConfig.defaultImage}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    authors: author ? [{ name: author }] : undefined,
    creator: siteConfig.name,
    publisher: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
      languages:
        Object.keys(alternateLanguages).length > 0
          ? alternateLanguages
          : undefined,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: getOpenGraphLocale(language),
      type: section === "article" ? "article" : "website",
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };

  return metadata;
}

/**
 * Generate Open Graph metadata specifically.
 */
export function generateOpenGraph(
  params: PageMetadataParams,
  siteConfig: SiteConfig = defaultSiteConfig
) {
  const {
    title,
    description,
    image,
    url,
    author,
    publishedTime,
    modifiedTime,
    section = "website",
    language = siteConfig.defaultLanguage,
  } = params;

  const canonicalUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const ogImage = image
    ? `${siteConfig.url}${image}`
    : `${siteConfig.url}${siteConfig.defaultImage}`;

  return {
    title,
    description,
    url: canonicalUrl,
    siteName: siteConfig.name,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: getOpenGraphLocale(language),
    type: section === "article" ? "article" : "website",
    publishedTime,
    modifiedTime,
    authors: author ? [author] : undefined,
    section,
  };
}

/**
 * Generate Twitter Card metadata.
 */
export function generateTwitterCard(
  params: PageMetadataParams,
  siteConfig: SiteConfig = defaultSiteConfig
) {
  const { title, description, image } = params;
  const ogImage = image
    ? `${siteConfig.url}${image}`
    : `${siteConfig.url}${siteConfig.defaultImage}`;

  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [ogImage],
    creator: siteConfig.twitterHandle,
    site: siteConfig.twitterHandle,
  };
}

/**
 * Generate alternate language links for i18n.
 */
export function generateAlternateLanguages(
  basePath: string,
  supportedLanguages: string[] = defaultSiteConfig.supportedLanguages,
  siteConfig: SiteConfig = defaultSiteConfig
): Record<string, string> {
  const alternates: Record<string, string> = {};

  for (const lang of supportedLanguages) {
    if (lang === siteConfig.defaultLanguage) {
      alternates[lang] = `${siteConfig.url}${basePath}`;
    } else {
      alternates[lang] = `${siteConfig.url}/${lang}${basePath}`;
    }
  }

  return alternates;
}

/**
 * Generate canonical URL for a page.
 */
export function generateCanonicalUrl(
  path: string,
  language?: string,
  siteConfig: SiteConfig = defaultSiteConfig
): string {
  const basePath = path.startsWith("/") ? path : `/${path}`;

  if (language && language !== siteConfig.defaultLanguage) {
    return `${siteConfig.url}/${language}${basePath}`;
  }

  return `${siteConfig.url}${basePath}`;
}

/**
 * Convert language code to Open Graph locale format.
 */
function getOpenGraphLocale(language: string): string {
  const localeMap: Record<string, string> = {
    en: "en_US",
    ur: "ur_PK",
    hi: "hi_IN",
  };

  return localeMap[language] || "en_US";
}

/**
 * Generate metadata for poetry pages (Ashaar, Ghazlen, etc.).
 */
export function generatePoetryMetadata(params: {
  type: "ashaar" | "ghazlen" | "nazmen" | "rubai";
  title: string;
  author: string;
  excerpt?: string;
  id: string;
  language?: "en" | "ur" | "hi";
}): Metadata {
  const { type, title, author, excerpt, id, language = "ur" } = params;

  const typeNames = {
    ashaar: language === "ur" ? "اشعار" : language === "hi" ? "अशार" : "Poetry",
    ghazlen: language === "ur" ? "غزل" : language === "hi" ? "ग़ज़ल" : "Ghazal",
    nazmen: language === "ur" ? "نظم" : language === "hi" ? "नज़्म" : "Nazm",
    rubai: language === "ur" ? "رباعی" : language === "hi" ? "रुबाई" : "Rubai",
  };

  const typeName = typeNames[type];
  const fullTitle = `${title} - ${typeName} by ${author}`;
  const description = excerpt
    ? `${excerpt.substring(
        0,
        150
      )}... Read the complete ${typeName.toLowerCase()} by ${author} on Jahannuma.`
    : `Read this beautiful ${typeName.toLowerCase()} by ${author} on Jahannuma - Your gateway to Urdu literature.`;

  return generatePageMetadata({
    title: fullTitle,
    description,
    url: `/${type}/${id}`,
    author,
    section: "article",
    language,
    keywords: [typeName, author, "Urdu poetry", "Literature", "جہان نما"],
  });
}

/**
 * Generate metadata for author/poet pages.
 */
export function generateAuthorMetadata(params: {
  name: string;
  bio?: string;
  worksCount?: number;
  language?: "en" | "ur" | "hi";
}): Metadata {
  const { name, bio, worksCount, language = "ur" } = params;

  const title =
    language === "ur"
      ? `${name} - شاعر`
      : language === "hi"
      ? `${name} - कवि`
      : `${name} - Poet`;

  const description = bio
    ? `${bio.substring(0, 150)}...`
    : `Explore the complete collection of ${name}'s poetry on Jahannuma. ${
        worksCount ? `${worksCount} works available.` : ""
      }`;

  return generatePageMetadata({
    title,
    description,
    url: `/shaer/${encodeURIComponent(name)}`,
    author: name,
    language,
    keywords: [name, "poet", "شاعر", "Urdu poetry", "Literature"],
  });
}
