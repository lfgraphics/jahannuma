import { Language } from "@/lib/multilingual-texts";

/**
 * Navigation utilities for multilingual routing
 */

export interface RouteInfo {
  /** Base route without language prefix */
  basePath: string;
  /** Full path with language prefix */
  fullPath: string;
  /** Language extracted from path */
  language: Language;
  /** Route segments */
  segments: string[];
  /** Whether this is a dynamic route */
  isDynamic: boolean;
  /** Dynamic parameters if any */
  params: Record<string, string>;
}

/**
 * Parse a pathname to extract route information
 */
export function parseRoute(pathname: string): RouteInfo {
  const segments = pathname.split("/").filter(Boolean);

  // Check if first segment is a language
  const firstSegment = segments[0];
  const isLanguageRoute = ["EN", "HI"].includes(firstSegment);

  const language: Language = isLanguageRoute ? (firstSegment as Language) : "UR";
  const pathSegments = isLanguageRoute ? segments.slice(1) : segments;

  // Reconstruct base path
  const basePath = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "/";

  // Check for dynamic segments
  const isDynamic = pathSegments.some(segment =>
    segment.includes("[") ||
    segment.match(/^[a-f0-9-]{36}$/) || // UUID pattern
    segment.match(/^\d+$/) // Numeric ID
  );

  // Extract dynamic parameters (simplified)
  const params: Record<string, string> = {};
  pathSegments.forEach((segment, index) => {
    if (segment.includes("[") && segment.includes("]")) {
      const paramName = segment.replace(/[\[\]]/g, "");
      const nextSegment = pathSegments[index + 1];
      if (nextSegment) {
        params[paramName] = decodeURIComponent(nextSegment);
      }
    }
  });

  return {
    basePath,
    fullPath: pathname,
    language,
    segments: pathSegments,
    isDynamic,
    params,
  };
}

/**
 * Generate language-specific URL
 */
export function generateLanguageUrl(basePath: string, language: Language): string {
  const cleanPath = basePath.startsWith("/") ? basePath : `/${basePath}`;

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
 * Generate alternate language URLs for the current page
 */
export function generateAlternateUrls(basePath: string): Record<Language, string> {
  return {
    UR: generateLanguageUrl(basePath, "UR"),
    EN: generateLanguageUrl(basePath, "EN"),
    HI: generateLanguageUrl(basePath, "HI"),
  };
}

/**
 * Check if a route is active based on current path
 */
export function isRouteActive(currentPath: string, targetPath: string, exact = false): boolean {
  const current = parseRoute(currentPath);
  const target = parseRoute(targetPath);

  if (exact) {
    return current.basePath === target.basePath;
  }

  return current.basePath.startsWith(target.basePath);
}

/**
 * Generate navigation items for a specific content type
 */
export function generateContentNavigation(params: {
  language: Language;
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  includeSubRoutes?: boolean;
}) {
  const { language, contentType, includeSubRoutes = true } = params;

  const baseUrl = generateLanguageUrl("", language);
  const contentPath = `${baseUrl}/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`;

  const navigation = [
    {
      name: getContentTypeLabel(contentType, language),
      url: contentPath,
      isMain: true,
    },
  ];

  if (includeSubRoutes && contentType !== "ebooks") {
    // Add poet/author navigation for poetry sections
    navigation.push({
      name: getPoetLabel(language),
      url: `${contentPath}/shaer`,
      isMain: false,
    });

    // Add topic navigation for some content types
    if (["ashaar", "ghazlen"].includes(contentType)) {
      navigation.push({
        name: getTopicLabel(language),
        url: `${contentPath}/mozu`,
        isMain: false,
      });
    }
  }

  return navigation;
}

/**
 * Get content type label in specified language
 */
function getContentTypeLabel(contentType: string, language: Language): string {
  const labels: Record<string, Record<Language, string>> = {
    ashaar: { UR: "اشعار", EN: "Ashaar", HI: "अशार" },
    ghazlen: { UR: "غزلیں", EN: "Ghazlen", HI: "ग़ज़ल" },
    nazmen: { UR: "نظمیں", EN: "Nazmen", HI: "नज़्म" },
    rubai: { UR: "رباعیاں", EN: "Rubai", HI: "रुबाई" },
    ebooks: { UR: "کتابیں", EN: "E-Books", HI: "पुस्तकें" },
  };

  return labels[contentType]?.[language] || contentType;
}

/**
 * Get poet label in specified language
 */
function getPoetLabel(language: Language): string {
  const labels: Record<Language, string> = {
    UR: "شعراء",
    EN: "Poets",
    HI: "कवि",
  };

  return labels[language];
}

/**
 * Get topic label in specified language
 */
function getTopicLabel(language: Language): string {
  const labels: Record<Language, string> = {
    UR: "موضوعات",
    EN: "Topics",
    HI: "विषय",
  };

  return labels[language];
}

/**
 * Generate sitemap-style navigation structure
 */
export function generateSiteNavigation(language: Language) {
  const baseUrl = generateLanguageUrl("", language);

  const contentTypes = ["ashaar", "ghazlen", "nazmen", "rubai", "ebooks"] as const;

  const navigation = {
    home: {
      name: getHomeLabel(language),
      url: baseUrl || "/",
    },
    content: contentTypes.map(type => ({
      name: getContentTypeLabel(type, language),
      url: `${baseUrl}/${type.charAt(0).toUpperCase() + type.slice(1)}`,
      children: type !== "ebooks" ? [
        {
          name: getPoetLabel(language),
          url: `${baseUrl}/${type.charAt(0).toUpperCase() + type.slice(1)}/shaer`,
        },
        ...(["ashaar", "ghazlen"].includes(type) ? [{
          name: getTopicLabel(language),
          url: `${baseUrl}/${type.charAt(0).toUpperCase() + type.slice(1)}/mozu`,
        }] : []),
      ] : [],
    })),
    pages: [
      {
        name: getFavoritesLabel(language),
        url: `${baseUrl}/Favorites`,
      },
      {
        name: getFoundersLabel(language),
        url: `${baseUrl}/Founders`,
      },
      {
        name: getInterviewLabel(language),
        url: `${baseUrl}/Interview`,
      },
      {
        name: getContactLabel(language),
        url: `${baseUrl}/Contact`,
      },
    ],
  };

  return navigation;
}

/**
 * Helper functions for labels
 */
function getHomeLabel(language: Language): string {
  const labels: Record<Language, string> = {
    UR: "ہوم",
    EN: "Home",
    HI: "होम",
  };
  return labels[language];
}

function getFavoritesLabel(language: Language): string {
  const labels: Record<Language, string> = {
    UR: "پسندیدہ",
    EN: "Favorites",
    HI: "पसंदीदा",
  };
  return labels[language];
}

function getFoundersLabel(language: Language): string {
  const labels: Record<Language, string> = {
    UR: "بانی",
    EN: "Founders",
    HI: "संस्थापक",
  };
  return labels[language];
}

function getInterviewLabel(language: Language): string {
  const labels: Record<Language, string> = {
    UR: "انٹرویو",
    EN: "Interview",
    HI: "साक्षात्कार",
  };
  return labels[language];
}

function getContactLabel(language: Language): string {
  const labels: Record<Language, string> = {
    UR: "رابطہ",
    EN: "Contact",
    HI: "संपर्क",
  };
  return labels[language];
}

/**
 * Validate if a route exists in the multilingual structure
 */
export function validateMultilingualRoute(pathname: string): {
  isValid: boolean;
  language: Language;
  basePath: string;
  suggestions?: string[];
} {
  const route = parseRoute(pathname);

  // Basic validation - check if it follows expected patterns
  const validPatterns = [
    /^\/$/,                                    // Home
    /^\/[A-Z][a-z]+$/,                        // Main sections
    /^\/[A-Z][a-z]+\/shaer$/,                 // Poet listings
    /^\/[A-Z][a-z]+\/shaer\/[^\/]+$/,         // Individual poets
    /^\/[A-Z][a-z]+\/mozu$/,                  // Topic listings
    /^\/[A-Z][a-z]+\/mozu\/[^\/]+$/,          // Individual topics
    /^\/[A-Z][a-z]+\/[^\/]+\/[^\/]+$/,        // Individual content
    /^\/Favorites$/,                          // Static pages
    /^\/Founders$/,
    /^\/Interview$/,
    /^\/Contact$/,
  ];

  const isValid = validPatterns.some(pattern => pattern.test(route.basePath));

  const result = {
    isValid,
    language: route.language,
    basePath: route.basePath,
  };

  if (!isValid) {
    // Generate suggestions for invalid routes
    const suggestions = generateRouteSuggestions(route.basePath);
    return { ...result, suggestions };
  }

  return result;
}

/**
 * Generate route suggestions for invalid routes
 */
function generateRouteSuggestions(basePath: string): string[] {
  const segments = basePath.split("/").filter(Boolean);
  const suggestions: string[] = [];

  // Common corrections
  const corrections: Record<string, string> = {
    "ashaar": "Ashaar",
    "ghazlen": "Ghazlen",
    "nazmen": "Nazmen",
    "rubai": "Rubai",
    "ebooks": "E-Books",
    "shaer": "shaer",
    "mozu": "mozu",
    "favorites": "Favorites",
    "founders": "Founders",
    "interview": "Interview",
    "contact": "Contact",
  };

  if (segments.length > 0) {
    const firstSegment = segments[0].toLowerCase();
    if (corrections[firstSegment]) {
      const corrected = [corrections[firstSegment], ...segments.slice(1)];
      suggestions.push(`/${corrected.join("/")}`);
    }
  }

  return suggestions;
}