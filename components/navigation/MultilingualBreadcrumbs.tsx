"use client";

import { Language } from "@/lib/multilingual-texts";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  /** Display name for the breadcrumb */
  name: string;
  /** URL for the breadcrumb link */
  url: string;
  /** Whether this is the current page (no link) */
  isCurrent?: boolean;
}

export interface MultilingualBreadcrumbsProps {
  /** Current language */
  language: Language;
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom home URL (defaults to language-specific home) */
  homeUrl?: string;
  /** Custom separator component */
  separator?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Multilingual breadcrumb navigation component
 */
export function MultilingualBreadcrumbs({
  language,
  items,
  homeUrl,
  separator,
  className = "",
}: MultilingualBreadcrumbsProps) {
  // Generate language-specific home URL
  const defaultHomeUrl = getLanguageHomeUrl(language);
  const finalHomeUrl = homeUrl || defaultHomeUrl;

  // Get language-specific home label
  const homeLabel = getHomeLabel(language);

  const defaultSeparator = separator || <ChevronRight className="w-4 h-4 text-gray-400" />;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      {/* Home link */}
      <Link
        href={finalHomeUrl}
        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        aria-label={homeLabel}
      >
        <Home className="w-4 h-4 mr-1" />
        <span>{homeLabel}</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {defaultSeparator}
          {item.isCurrent ? (
            <span
              className="text-gray-700 font-medium"
              aria-current="page"
            >
              {item.name}
            </span>
          ) : (
            <Link
              href={item.url}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Generate language-specific home URL
 */
function getLanguageHomeUrl(language: Language): string {
  switch (language) {
    case "EN":
      return "/EN";
    case "HI":
      return "/HI";
    case "UR":
    default:
      return "/";
  }
}

/**
 * Get language-specific home label
 */
function getHomeLabel(language: Language): string {
  switch (language) {
    case "EN":
      return "Home";
    case "HI":
      return "होम";
    case "UR":
    default:
      return "ہوم";
  }
}

/**
 * Generate breadcrumbs for content pages
 */
export function generateContentBreadcrumbs(params: {
  language: Language;
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  contentTitle?: string;
  authorName?: string;
  contentId?: string;
}): BreadcrumbItem[] {
  const { language, contentType, contentTitle, authorName, contentId } = params;

  const breadcrumbs: BreadcrumbItem[] = [];

  // Content type labels
  const contentTypeLabels: Record<string, Record<Language, string>> = {
    ashaar: { UR: "اشعار", EN: "Ashaar", HI: "अशार" },
    ghazlen: { UR: "غزلیں", EN: "Ghazlen", HI: "ग़ज़ल" },
    nazmen: { UR: "نظمیں", EN: "Nazmen", HI: "नज़्म" },
    rubai: { UR: "رباعیاں", EN: "Rubai", HI: "रुबाई" },
    ebooks: { UR: "کتابیں", EN: "E-Books", HI: "पुस्तकें" },
  };

  const sectionLabel = contentTypeLabels[contentType][language];
  const sectionUrl = getLanguageUrl(language, `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`);

  // Add section breadcrumb
  breadcrumbs.push({
    name: sectionLabel,
    url: sectionUrl,
  });

  // Add content-specific breadcrumb if available
  if (contentTitle) {
    const contentUrl = contentId
      ? getLanguageUrl(language, `/${contentType}/${contentId}`)
      : sectionUrl;

    breadcrumbs.push({
      name: contentTitle,
      url: contentUrl,
      isCurrent: true,
    });
  }

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for author pages
 */
export function generateAuthorBreadcrumbs(params: {
  language: Language;
  authorName: string;
  isCurrentPage?: boolean;
}): BreadcrumbItem[] {
  const { language, authorName, isCurrentPage = true } = params;

  const breadcrumbs: BreadcrumbItem[] = [];

  // Poets section labels
  const poetsLabels: Record<Language, string> = {
    UR: "شعراء",
    EN: "Poets",
    HI: "कवि",
  };

  const poetsLabel = poetsLabels[language];
  const poetsUrl = getLanguageUrl(language, "/shaer");

  // Add poets section breadcrumb
  breadcrumbs.push({
    name: poetsLabel,
    url: poetsUrl,
  });

  // Add author breadcrumb
  breadcrumbs.push({
    name: authorName,
    url: getLanguageUrl(language, `/shaer/${encodeURIComponent(authorName)}`),
    isCurrent: isCurrentPage,
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for nested dynamic routes
 */
export function generateNestedRouteBreadcrumbs(params: {
  language: Language;
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai";
  routeType: "shaer" | "mozu";
  routeValue: string;
  contentTitle?: string;
  contentId?: string;
}): BreadcrumbItem[] {
  const { language, contentType, routeType, routeValue, contentTitle, contentId } = params;

  const breadcrumbs: BreadcrumbItem[] = [];

  // Content type labels
  const contentTypeLabels: Record<string, Record<Language, string>> = {
    ashaar: { UR: "اشعار", EN: "Ashaar", HI: "अशार" },
    ghazlen: { UR: "غزلیں", EN: "Ghazlen", HI: "ग़ज़ल" },
    nazmen: { UR: "نظمیں", EN: "Nazmen", HI: "नज़्म" },
    rubai: { UR: "رباعیاں", EN: "Rubai", HI: "रुबाई" },
  };

  // Route type labels
  const routeTypeLabels: Record<string, Record<Language, string>> = {
    shaer: { UR: "شاعر", EN: "Poet", HI: "कवि" },
    mozu: { UR: "موضوع", EN: "Topic", HI: "विषय" },
  };

  const sectionLabel = contentTypeLabels[contentType][language];
  const sectionUrl = getLanguageUrl(language, `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`);

  // Add section breadcrumb
  breadcrumbs.push({
    name: sectionLabel,
    url: sectionUrl,
  });

  // Add route type breadcrumb
  const routeTypeLabel = routeTypeLabels[routeType][language];
  const routeTypeUrl = getLanguageUrl(language, `/${contentType}/${routeType}`);

  breadcrumbs.push({
    name: routeTypeLabel,
    url: routeTypeUrl,
  });

  // Add specific route value breadcrumb
  const routeValueUrl = getLanguageUrl(language, `/${contentType}/${routeType}/${encodeURIComponent(routeValue)}`);

  breadcrumbs.push({
    name: routeValue,
    url: routeValueUrl,
    isCurrent: !contentTitle,
  });

  // Add content-specific breadcrumb if available
  if (contentTitle && contentId) {
    const contentUrl = getLanguageUrl(language, `/${contentType}/${contentId}`);

    breadcrumbs.push({
      name: contentTitle,
      url: contentUrl,
      isCurrent: true,
    });
  }

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for static pages
 */
export function generateStaticPageBreadcrumbs(params: {
  language: Language;
  pageType: "favorites" | "founders" | "interview" | "contact" | "about" | "privacy" | "terms" | "cancellation" | "shipping";
  isCurrentPage?: boolean;
}): BreadcrumbItem[] {
  const { language, pageType, isCurrentPage = true } = params;

  const breadcrumbs: BreadcrumbItem[] = [];

  // Page labels
  const pageLabels: Record<string, Record<Language, string>> = {
    favorites: { UR: "پسندیدہ", EN: "Favorites", HI: "पसंदीदा" },
    founders: { UR: "بانی", EN: "Founders", HI: "संस्थापक" },
    interview: { UR: "انٹرویو", EN: "Interview", HI: "साक्षात्कार" },
    contact: { UR: "رابطہ", EN: "Contact", HI: "संपर्क" },
    about: { UR: "تعارف", EN: "About", HI: "परिचय" },
    privacy: { UR: "پرائیویسی پالیسی", EN: "Privacy Policy", HI: "गोपनीयता नीति" },
    terms: { UR: "شرائط و ضوابط", EN: "Terms & Conditions", HI: "नियम और शर्तें" },
    cancellation: { UR: "منسوخی اور واپسی", EN: "Cancellation & Refund", HI: "रद्दीकरण और वापसी" },
    shipping: { UR: "شپنگ اور ڈیلیوری", EN: "Shipping & Delivery", HI: "शिपिंग और डिलीवरी" },
  };

  const pageLabel = pageLabels[pageType][language];
  const pageUrl = getLanguageUrl(language, `/${pageType}`);

  breadcrumbs.push({
    name: pageLabel,
    url: pageUrl,
    isCurrent: isCurrentPage,
  });

  return breadcrumbs;
}

/**
 * Generate language-specific URL
 */
function getLanguageUrl(language: Language, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  switch (language) {
    case "EN":
      return `/EN${cleanPath}`;
    case "HI":
      return `/HI${cleanPath}`;
    case "UR":
    default:
      return cleanPath;
  }
}

/**
 * Hook for generating breadcrumbs based on current route
 */
export function useBreadcrumbs(params: {
  language: Language;
  pathname: string;
  contentType?: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  contentTitle?: string;
  authorName?: string;
  contentId?: string;
}): BreadcrumbItem[] {
  const { language, pathname, contentType, contentTitle, authorName, contentId } = params;

  // Parse pathname to determine breadcrumb structure
  const pathSegments = pathname.split("/").filter(Boolean);

  // Remove language prefix if present
  const cleanSegments = pathSegments[0] === language.toUpperCase() ? pathSegments.slice(1) : pathSegments;

  if (cleanSegments.length === 0) {
    // Home page - no breadcrumbs needed
    return [];
  }

  // Handle different route patterns
  if (contentType) {
    if (cleanSegments.includes("shaer") || cleanSegments.includes("mozu")) {
      // Nested route (e.g., /ashaar/shaer/[name])
      const routeType = cleanSegments.includes("shaer") ? "shaer" : "mozu";
      const routeValue = cleanSegments[cleanSegments.indexOf(routeType) + 1];

      if (routeValue && (contentType === "ashaar" || contentType === "ghazlen" || contentType === "nazmen" || contentType === "rubai")) {
        return generateNestedRouteBreadcrumbs({
          language,
          contentType,
          routeType,
          routeValue: decodeURIComponent(routeValue),
          contentTitle,
          contentId,
        });
      }
    }

    // Regular content page
    return generateContentBreadcrumbs({
      language,
      contentType,
      contentTitle,
      authorName,
      contentId,
    });
  }

  if (cleanSegments[0] === "shaer" && authorName) {
    // Author page
    return generateAuthorBreadcrumbs({
      language,
      authorName,
    });
  }

  // Static pages
  const staticPageTypes = ["favorites", "founders", "interview", "contact", "about", "privacypolicy", "terms&conditions", "cancellation&refund", "shipping&delivery"];
  const pageType = cleanSegments[0];

  if (staticPageTypes.includes(pageType)) {
    // Normalize page type for mapping
    let normalizedPageType = pageType;
    if (pageType === "privacypolicy") normalizedPageType = "privacy";
    else if (pageType === "terms&conditions") normalizedPageType = "terms";
    else if (pageType === "cancellation&refund") normalizedPageType = "cancellation";
    else if (pageType === "shipping&delivery") normalizedPageType = "shipping";

    return generateStaticPageBreadcrumbs({
      language,
      pageType: normalizedPageType as any,
    });
  }

  return [];
}