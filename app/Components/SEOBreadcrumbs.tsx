/**
 * SEO-optimized breadcrumb component with structured data support
 */

import { BreadcrumbItem, generateBreadcrumbStructuredData } from "@/lib/seo/structured-data";

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showStructuredData?: boolean;
}

export default function SEOBreadcrumbs({
  items,
  className = "",
  showStructuredData = true
}: SEOBreadcrumbsProps) {
  const baseUrl = "https://jahan-numa.org";

  // Generate structured data for breadcrumbs
  const structuredData = showStructuredData
    ? generateBreadcrumbStructuredData(items, baseUrl)
    : null;

  return (
    <>
      {/* Structured data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Visual breadcrumb navigation */}
      <nav
        className={`breadcrumbs ${className}`}
        aria-label="Breadcrumb navigation"
      >
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  /
                </span>
              )}
              {item.url && index < items.length - 1 ? (
                <a
                  href={item.url}
                  className="hover:text-blue-600 transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{item.name}</span>
                </a>
              ) : (
                <span
                  className="text-gray-900 font-medium"
                  itemProp="name"
                  aria-current={index === items.length - 1 ? "page" : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Generate breadcrumbs for content pages
 */
export function generateContentBreadcrumbs(params: {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
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

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for author pages
 */
export function generateAuthorBreadcrumbs(params: {
  authorName: string;
  language?: "ur" | "en" | "hi";
}): BreadcrumbItem[] {
  const { authorName, language = "ur" } = params;

  return [
    {
      name: language === "ur" ? "ہوم" : language === "hi" ? "होम" : "Home",
      url: "/",
    },
    {
      name: language === "ur" ? "شعراء" : language === "hi" ? "कवि" : "Poets",
      url: "/shaer",
    },
    {
      name: authorName,
      url: "", // Current page
    },
  ];
}

/**
 * Generate breadcrumbs for search pages
 */
export function generateSearchBreadcrumbs(params: {
  query: string;
  language?: "ur" | "en" | "hi";
}): BreadcrumbItem[] {
  const { query, language = "ur" } = params;

  return [
    {
      name: language === "ur" ? "ہوم" : language === "hi" ? "होम" : "Home",
      url: "/",
    },
    {
      name: language === "ur" ? "تلاش" : language === "hi" ? "खोज" : "Search",
      url: "/search",
    },
    {
      name: `"${query}"`,
      url: "", // Current page
    },
  ];
}