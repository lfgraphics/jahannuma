/**
 * Enhanced SEO component that provides comprehensive meta tags,
 * structured data, and performance optimizations.
 */

import { generateCriticalCSS } from "@/lib/seo/performance-optimization";

interface SEOEnhancedProps {
  structuredData: string;
  contentType?: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  criticalCSS?: string;
  preloadResources?: Array<{
    href: string;
    as: "style" | "script" | "font" | "image";
    type?: string;
    crossOrigin?: "anonymous" | "use-credentials";
  }>;
  children: React.ReactNode;
}

export default function SEOEnhanced({
  structuredData,
  contentType,
  criticalCSS,
  preloadResources = [],
  children,
}: SEOEnhancedProps) {
  // Generate critical CSS if not provided
  const inlineCriticalCSS = criticalCSS || (contentType ? generateCriticalCSS(contentType) : "");

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      {/* Critical CSS for above-the-fold content */}
      {inlineCriticalCSS && (
        <style
          dangerouslySetInnerHTML={{ __html: inlineCriticalCSS }}
        />
      )}

      {/* Resource preloading */}
      {preloadResources.map((resource, index) => (
        <link
          key={index}
          rel="preload"
          href={resource.href}
          as={resource.as}
          type={resource.type}
          crossOrigin={resource.crossOrigin}
        />
      ))}

      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://api.airtable.com" />

      {/* Preconnect to critical domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {children}
    </>
  );
}

/**
 * SEO-optimized image component with lazy loading and performance hints
 */
interface SEOImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
}

export function SEOImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = "100vw",
  quality = 75,
}: SEOImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      sizes={sizes}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
}

/**
 * Performance monitoring component for Core Web Vitals
 */
export function PerformanceMonitor() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Core Web Vitals monitoring
          function measureCoreWebVitals() {
            // Largest Contentful Paint (LCP)
            if ('PerformanceObserver' in window) {
              try {
                new PerformanceObserver((entryList) => {
                  const entries = entryList.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  if (lastEntry && lastEntry.startTime) {
                    console.log('LCP:', lastEntry.startTime);
                    // Send to analytics if needed
                  }
                }).observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay (FID)
                new PerformanceObserver((entryList) => {
                  const entries = entryList.getEntries();
                  entries.forEach((entry) => {
                    const fid = entry.processingStart - entry.startTime;
                    console.log('FID:', fid);
                    // Send to analytics if needed
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
                  // Send to analytics if needed
                }).observe({ entryTypes: ['layout-shift'] });
              } catch (error) {
                console.warn('Performance monitoring failed:', error);
              }
            }
          }

          // Run monitoring after page load
          if (document.readyState === 'complete') {
            measureCoreWebVitals();
          } else {
            window.addEventListener('load', measureCoreWebVitals);
          }
        `,
      }}
    />
  );
}

/**
 * Font optimization component
 */
export function FontOptimization() {
  return (
    <>
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/Mehr_Nastaliq.ttf"
        as="font"
        type="font/truetype"
        crossOrigin="anonymous"
      />

      {/* Font display optimization */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Noto Nastaliq Urdu';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url('/Mehr_Nastaliq.ttf') format('truetype');
            }
          `,
        }}
      />
    </>
  );
}

/**
 * Critical resource hints component
 */
export function CriticalResourceHints({ contentType }: { contentType?: string }) {
  const contentImages: Record<string, string> = {
    ashaar: "/metaImages/ashaar.jpg",
    ghazlen: "/metaImages/ghazlen.jpg",
    nazmen: "/metaImages/nazme.jpg",
    rubai: "/metaImages/rubai.jpg",
    ebooks: "/metaImages/ebooks.jpg",
  };

  return (
    <>
      {/* Preload critical CSS */}
      <link rel="preload" href="/globals.css" as="style" />

      {/* Preload hero image if content type is specified */}
      {contentType && contentImages[contentType] && (
        <link
          rel="preload"
          href={contentImages[contentType]}
          as="image"
        />
      )}

      {/* Prefetch likely navigation targets */}
      <link rel="prefetch" href="/Ashaar" />
      <link rel="prefetch" href="/Ghazlen" />
      <link rel="prefetch" href="/Nazmen" />
      <link rel="prefetch" href="/Rubai" />
      <link rel="prefetch" href="/E-Books" />
    </>
  );
}