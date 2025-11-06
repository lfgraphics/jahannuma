/**
 * TypeScript interfaces for multilingual page components and routing.
 * Provides type safety for language-aware components and pages.
 */

import type { Language } from "@/lib/multilingual-texts";

/**
 * Base interface for all multilingual page components
 */
export interface MultilingualPageProps {
  /** Current language from route */
  language: Language;
  /** Dynamic route parameters */
  params?: Record<string, string>;
  /** Search parameters */
  searchParams?: Record<string, string>;
}

/**
 * Extended interface for multilingual pages with content
 */
export interface MultilingualPageWithContentProps extends MultilingualPageProps {
  /** Page content */
  children: React.ReactNode;
}

/**
 * Configuration options for multilingual page behavior
 */
export interface MultilingualPageConfig {
  /** Whether to sync language context with route language */
  syncLanguageWithRoute?: boolean;
  /** Whether to apply font configuration automatically */
  applyFontConfig?: boolean;
  /** Custom CSS classes to apply */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Text direction override (auto-detected if not provided) */
  dir?: "ltr" | "rtl";
  /** Whether to enable font loading transitions */
  enableFontTransitions?: boolean;
}

/**
 * Route parameters for multilingual dynamic routes
 */
export interface MultilingualRouteParams {
  /** Language prefix (EN, HI, or undefined for UR) */
  lang?: Language;
  /** Dynamic route segments */
  [key: string]: string | string[] | undefined;
}

/**
 * Ashaar page parameters with multilingual support
 */
export interface MultilingualAshaarPageParams extends MultilingualPageProps {
  params: {
    id: string;
    slug?: string;
  };
}

/**
 * Ghazlen page parameters with multilingual support
 */
export interface MultilingualGhazlenPageParams extends MultilingualPageProps {
  params: {
    id: string;
    slug?: string;
  };
}

/**
 * Nazmen page parameters with multilingual support
 */
export interface MultilingualNazmenPageParams extends MultilingualPageProps {
  params: {
    id: string;
    slug?: string;
  };
}

/**
 * Rubai page parameters with multilingual support
 */
export interface MultilingualRubaiPageParams extends MultilingualPageProps {
  params: {
    id: string;
    slug?: string;
  };
}

/**
 * E-Books page parameters with multilingual support
 */
export interface MultilingualEBooksPageParams extends MultilingualPageProps {
  params: {
    slug: string;
    id: string;
  };
}

/**
 * Shaer (poet) page parameters with multilingual support
 */
export interface MultilingualShaerPageParams extends MultilingualPageProps {
  params: {
    name: string;
  };
}

/**
 * Mozu (theme) page parameters with multilingual support
 */
export interface MultilingualMozuPageParams extends MultilingualPageProps {
  params: {
    unwan: string;
  };
}

/**
 * Static page parameters with multilingual support
 */
export interface MultilingualStaticPageParams extends MultilingualPageProps {
  // No additional params for static pages
}

/**
 * Authentication page parameters with multilingual support
 */
export interface MultilingualAuthPageParams extends MultilingualPageProps {
  // May include redirect parameters
  searchParams?: {
    redirect?: string;
    error?: string;
  };
}

/**
 * SEO metadata for multilingual pages
 */
export interface MultilingualSEOMetadata {
  /** Page title in current language */
  title: string;
  /** Page description in current language */
  description: string;
  /** Keywords for current language */
  keywords: string[];
  /** Current page language */
  language: Language;
  /** Alternate language versions */
  alternateLanguages: AlternateLanguage[];
  /** Canonical URL */
  canonical?: string;
  /** Open Graph metadata */
  openGraph?: {
    title: string;
    description: string;
    image?: string;
    locale: string;
  };
}

/**
 * Alternate language version information
 */
export interface AlternateLanguage {
  /** Language code */
  language: Language;
  /** URL for this language version */
  url: string;
  /** Human-readable language name */
  label: string;
}

/**
 * Font loading state for multilingual pages
 */
export interface MultilingualFontState {
  /** Whether font is currently loading */
  isLoading: boolean;
  /** Whether font has loaded successfully */
  isLoaded: boolean;
  /** Whether this is a web font (requires loading) */
  isWebFont: boolean;
  /** Current font family name */
  fontFamily: string;
  /** Current language */
  language: Language;
  /** Font loading error if any */
  error?: Error;
}

/**
 * Navigation context for multilingual pages
 */
export interface MultilingualNavigationContext {
  /** Current language */
  currentLanguage: Language;
  /** Available languages for current route */
  availableLanguages: Language[];
  /** Generate URL for different language */
  generateLanguageUrl: (language: Language, path?: string) => string;
  /** Check if route supports multilingual */
  hasMultilingualSupport: (path?: string) => boolean;
  /** Whether current route is multilingual */
  isMultilingualRoute: boolean;
}

/**
 * Error information for multilingual pages
 */
export interface MultilingualError {
  /** Error type */
  type: 'route' | 'font' | 'content' | 'language';
  /** Error message */
  message: string;
  /** Language context when error occurred */
  language: Language;
  /** Recovery suggestions */
  recovery?: {
    action: 'redirect' | 'fallback' | 'retry';
    target?: string;
  };
}

/**
 * Performance metrics for multilingual pages
 */
export interface MultilingualPerformanceMetrics {
  /** Font loading time in milliseconds */
  fontLoadTime?: number;
  /** Language switching time */
  languageSwitchTime?: number;
  /** Route resolution time */
  routeResolutionTime?: number;
  /** Total page load time */
  pageLoadTime?: number;
}