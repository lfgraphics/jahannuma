/**
 * Performance optimization utilities for Core Web Vitals and page loading.
 * Focuses on improving LCP, FID, CLS, and overall user experience.
 */

import { Metadata } from "next";

export interface PerformanceConfig {
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enableResourcePreloading: boolean;
  enableCriticalCSS: boolean;
  lazyLoadImages: boolean;
  preloadCriticalResources: boolean;
}

export interface CriticalResource {
  href: string;
  as: "style" | "script" | "font" | "image";
  type?: string;
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface FontOptimizationConfig {
  fontDisplay: "auto" | "block" | "swap" | "fallback" | "optional";
  preloadFonts: string[];
  fallbackFonts: string[];
}

/**
 * Generate performance-optimized metadata with resource hints
 */
export function generatePerformanceOptimizedMetadata(params: {
  baseMetadata: Metadata;
  criticalResources?: CriticalResource[];
  fontConfig?: FontOptimizationConfig;
  enableDNSPrefetch?: boolean;
}): Metadata {
  const { baseMetadata, criticalResources = [], fontConfig, enableDNSPrefetch = true } = params;

  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://api.airtable.com",
  ];

  // Resource preloading
  const preloadLinks = criticalResources.map(resource => ({
    rel: "preload" as const,
    href: resource.href,
    as: resource.as,
    type: resource.type,
    crossOrigin: resource.crossOrigin,
  }));

  // Font preloading
  const fontPreloadLinks = fontConfig?.preloadFonts.map(fontUrl => ({
    rel: "preload" as const,
    href: fontUrl,
    as: "font" as const,
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  })) || [];

  // DNS prefetch links
  const dnsPrefetchLinks = enableDNSPrefetch ? dnsPrefetchDomains.map(domain => ({
    rel: "dns-prefetch" as const,
    href: domain,
  })) : [];

  return {
    ...baseMetadata,
    other: {
      // Performance hints
      "theme-color": "#F0D586",
      "color-scheme": "light dark",
      // Viewport optimization for mobile
      "viewport": "width=device-width, initial-scale=1, viewport-fit=cover",
      // Preconnect to critical domains
      "preconnect": "https://fonts.googleapis.com",
      // Merge existing other properties (filter out undefined values)
      ...Object.fromEntries(
        Object.entries(baseMetadata.other || {}).filter(([_, value]) => value !== undefined)
      ),
    },
    // Add resource hints (Note: Next.js handles these differently, this is for reference)
    icons: {
      ...(typeof baseMetadata.icons === 'object' && baseMetadata.icons !== null ? baseMetadata.icons : {}),
      // Optimized favicon sizes
      icon: [
        { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [
        { url: "/favicon/apple-icon-57x57.png", sizes: "57x57" },
        { url: "/favicon/apple-icon-60x60.png", sizes: "60x60" },
        { url: "/favicon/apple-icon-72x72.png", sizes: "72x72" },
        { url: "/favicon/apple-icon-76x76.png", sizes: "76x76" },
        { url: "/favicon/apple-icon-114x114.png", sizes: "114x114" },
        { url: "/favicon/apple-icon-120x120.png", sizes: "120x120" },
        { url: "/favicon/apple-icon-144x144.png", sizes: "144x144" },
        { url: "/favicon/apple-icon-152x152.png", sizes: "152x152" },
        { url: "/favicon/apple-icon-180x180.png", sizes: "180x180" },
      ],
    },
  };
}

/**
 * Generate critical CSS for above-the-fold content
 */
export function generateCriticalCSS(contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks"): string {
  // Base critical styles for all pages
  const baseCriticalCSS = `
    /* Critical font loading */
    @font-face {
      font-family: 'Noto Nastaliq Urdu';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/Mehr_Nastaliq.ttf') format('truetype');
    }

    /* Critical layout styles */
    body {
      font-family: 'Noto Nastaliq Urdu', serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    /* Header styles */
    header {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }

    /* Main content area */
    main {
      margin-top: 96px;
      min-height: calc(100vh - 96px);
    }

    @media (min-width: 1024px) {
      main {
        margin-top: 60px;
        min-height: calc(100vh - 60px);
      }
    }

    /* Loading states */
    .loading-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  // Content-specific critical styles
  const contentSpecificCSS = {
    ashaar: `
      .ashaar-card {
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `,
    ghazlen: `
      .ghazal-verse {
        text-align: right;
        font-size: 1.125rem;
        line-height: 1.8;
        margin-bottom: 0.5rem;
      }
    `,
    nazmen: `
      .nazm-content {
        text-align: right;
        font-size: 1rem;
        line-height: 1.7;
        white-space: pre-line;
      }
    `,
    rubai: `
      .rubai-verse {
        text-align: center;
        font-size: 1.125rem;
        line-height: 1.6;
        margin: 0.5rem 0;
      }
    `,
    ebooks: `
      .ebook-card {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .ebook-cover {
        width: 80px;
        height: 120px;
        object-fit: cover;
        border-radius: 4px;
      }
    `,
  };

  return baseCriticalCSS + (contentSpecificCSS[contentType] || "");
}

/**
 * Generate resource preloading configuration
 */
export function generateResourcePreloadConfig(params: {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  hasImages?: boolean;
  hasFonts?: boolean;
}): CriticalResource[] {
  const { contentType, hasImages = true, hasFonts = true } = params;

  const resources: CriticalResource[] = [];

  // Always preload critical fonts
  if (hasFonts) {
    resources.push({
      href: "/Mehr_Nastaliq.ttf",
      as: "font",
      type: "font/truetype",
      crossOrigin: "anonymous",
    });
  }

  // Preload critical CSS
  resources.push({
    href: "/globals.css",
    as: "style",
  });

  // Content-specific resources
  if (hasImages) {
    const contentImages = {
      ashaar: "/metaImages/ashaar.jpg",
      ghazlen: "/metaImages/ghazlen.jpg",
      nazmen: "/metaImages/nazme.jpg",
      rubai: "/metaImages/rubai.jpg",
      ebooks: "/metaImages/ebooks.jpg",
    };

    resources.push({
      href: contentImages[contentType],
      as: "image",
    });
  }

  return resources;
}

/**
 * Generate image optimization configuration
 */
export interface ImageOptimizationConfig {
  sizes: string;
  priority: boolean;
  quality: number;
  placeholder: "blur" | "empty";
  blurDataURL?: string;
}

export function generateImageOptimizationConfig(params: {
  imageType: "hero" | "thumbnail" | "avatar" | "cover";
  isCritical?: boolean;
}): ImageOptimizationConfig {
  const { imageType, isCritical = false } = params;

  const configs = {
    hero: {
      sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
      priority: true,
      quality: 85,
      placeholder: "blur" as const,
    },
    thumbnail: {
      sizes: "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px",
      priority: false,
      quality: 75,
      placeholder: "empty" as const,
    },
    avatar: {
      sizes: "64px",
      priority: false,
      quality: 80,
      placeholder: "empty" as const,
    },
    cover: {
      sizes: "(max-width: 768px) 100px, 150px",
      priority: isCritical,
      quality: 80,
      placeholder: "blur" as const,
    },
  };

  return configs[imageType];
}

/**
 * Generate font optimization configuration
 */
export function generateFontOptimizationConfig(): FontOptimizationConfig {
  return {
    fontDisplay: "swap",
    preloadFonts: [
      "/Mehr_Nastaliq.ttf",
    ],
    fallbackFonts: [
      "Noto Nastaliq Urdu",
      "serif",
      "system-ui",
    ],
  };
}

/**
 * Generate performance monitoring script
 */
export function generatePerformanceMonitoringScript(): string {
  return `
    // Core Web Vitals monitoring
    function measureCoreWebVitals() {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Run monitoring in production only
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      measureCoreWebVitals();
    }
  `;
}

/**
 * Generate lazy loading configuration for images
 */
export function generateLazyLoadingConfig(params: {
  rootMargin?: string;
  threshold?: number;
  enableNativeLazyLoading?: boolean;
}) {
  const { rootMargin = "50px", threshold = 0.1, enableNativeLazyLoading = true } = params;

  return {
    rootMargin,
    threshold,
    enableNativeLazyLoading,
    // Intersection Observer configuration
    observerConfig: {
      rootMargin,
      threshold,
    },
    // Placeholder configuration
    placeholder: {
      blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      color: "#f0f0f0",
    },
  };
}

/**
 * Generate service worker configuration for caching
 */
export function generateServiceWorkerConfig() {
  return {
    // Cache strategies
    cacheStrategies: {
      images: "CacheFirst",
      fonts: "CacheFirst",
      api: "NetworkFirst",
      pages: "StaleWhileRevalidate",
    },
    // Cache names
    cacheNames: {
      images: "jahannuma-images-v1",
      fonts: "jahannuma-fonts-v1",
      api: "jahannuma-api-v1",
      pages: "jahannuma-pages-v1",
    },
    // Cache expiration
    expiration: {
      images: 30 * 24 * 60 * 60, // 30 days
      fonts: 365 * 24 * 60 * 60, // 1 year
      api: 5 * 60, // 5 minutes
      pages: 24 * 60 * 60, // 1 day
    },
  };
}