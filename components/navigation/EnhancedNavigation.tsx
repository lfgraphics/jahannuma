"use client";

import { Language } from "@/lib/multilingual-texts";
import { usePathname } from "next/navigation";
import React from "react";
import { MultilingualBreadcrumbs, useBreadcrumbs } from "./MultilingualBreadcrumbs";

export interface EnhancedNavigationProps {
  /** Current language */
  language: Language;
  /** Whether to show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Content type for breadcrumb generation */
  contentType?: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  /** Content title for breadcrumbs */
  contentTitle?: string;
  /** Author name for breadcrumbs */
  authorName?: string;
  /** Content ID for breadcrumbs */
  contentId?: string;
  /** Custom breadcrumb items */
  customBreadcrumbs?: Array<{ name: string; url: string; isCurrent?: boolean }>;
  /** Additional CSS classes for breadcrumbs */
  breadcrumbClassName?: string;
  /** Children to render below breadcrumbs */
  children?: React.ReactNode;
}

/**
 * Enhanced navigation wrapper that adds breadcrumbs to existing navigation
 */
export function EnhancedNavigation({
  language,
  showBreadcrumbs = true,
  contentType,
  contentTitle,
  authorName,
  contentId,
  customBreadcrumbs,
  breadcrumbClassName = "",
  children,
}: EnhancedNavigationProps) {
  const pathname = usePathname();

  // Generate breadcrumbs automatically if not provided
  const autoBreadcrumbs = useBreadcrumbs({
    language,
    pathname,
    contentType,
    contentTitle,
    authorName,
    contentId,
  });

  const breadcrumbs = customBreadcrumbs || autoBreadcrumbs;

  // Don't show breadcrumbs on home pages
  const isHomePage = pathname === "/" || pathname === "/EN" || pathname === "/HI";
  const shouldShowBreadcrumbs = showBreadcrumbs && !isHomePage && breadcrumbs.length > 0;

  return (
    <div className="enhanced-navigation">
      {shouldShowBreadcrumbs && (
        <div className="breadcrumb-container bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-3">
            <MultilingualBreadcrumbs
              language={language}
              items={breadcrumbs}
              className={`text-sm ${breadcrumbClassName}`}
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Navigation enhancement hook for pages
 */
export function useNavigationEnhancement(params: {
  language: Language;
  contentType?: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  contentTitle?: string;
  authorName?: string;
  contentId?: string;
}) {
  const pathname = usePathname();

  const breadcrumbs = useBreadcrumbs({
    language: params.language,
    pathname,
    contentType: params.contentType,
    contentTitle: params.contentTitle,
    authorName: params.authorName,
    contentId: params.contentId,
  });

  const navigationData = {
    breadcrumbs,
    isHomePage: pathname === "/" || pathname === "/EN" || pathname === "/HI",
    shouldShowBreadcrumbs: breadcrumbs.length > 0,
  };

  return navigationData;
}

/**
 * Page wrapper component that automatically adds enhanced navigation
 */
export function PageWithNavigation({
  language,
  contentType,
  contentTitle,
  authorName,
  contentId,
  showBreadcrumbs = true,
  breadcrumbClassName,
  children,
}: EnhancedNavigationProps) {
  return (
    <EnhancedNavigation
      language={language}
      showBreadcrumbs={showBreadcrumbs}
      contentType={contentType}
      contentTitle={contentTitle}
      authorName={authorName}
      contentId={contentId}
      breadcrumbClassName={breadcrumbClassName}
    >
      {children}
    </EnhancedNavigation>
  );
}

/**
 * Utility component for adding breadcrumbs to existing pages
 */
export function BreadcrumbsOnly({
  language,
  contentType,
  contentTitle,
  authorName,
  contentId,
  customBreadcrumbs,
  breadcrumbClassName = "",
}: Omit<EnhancedNavigationProps, "children" | "showBreadcrumbs"> & { breadcrumbClassName?: string }) {
  const pathname = usePathname();

  const autoBreadcrumbs = useBreadcrumbs({
    language,
    pathname,
    contentType,
    contentTitle,
    authorName,
    contentId,
  });

  const breadcrumbs = customBreadcrumbs || autoBreadcrumbs;
  const isHomePage = pathname === "/" || pathname === "/EN" || pathname === "/HI";

  if (isHomePage || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={`breadcrumbs-container bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${breadcrumbClassName}`}>
      <div className="container mx-auto px-4 py-3">
        <MultilingualBreadcrumbs
          language={language}
          items={breadcrumbs}
          className="text-sm"
        />
      </div>
    </div>
  );
}