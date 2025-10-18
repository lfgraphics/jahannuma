/**
 * Core Web Vitals optimization component that implements various performance
 * improvements for LCP, FID, CLS, and overall user experience.
 */

"use client";

import { useEffect } from "react";

interface CoreWebVitalsOptimizerProps {
  enableResourceHints?: boolean;
  enableCriticalResourcePreload?: boolean;
  enableLayoutShiftPrevention?: boolean;
  enablePerformanceMonitoring?: boolean;
}

export default function CoreWebVitalsOptimizer({
  enableResourceHints = true,
  enableCriticalResourcePreload = true,
  enableLayoutShiftPrevention = true,
  enablePerformanceMonitoring = true,
}: CoreWebVitalsOptimizerProps) {
  useEffect(() => {
    // Preload critical resources for better LCP
    if (enableCriticalResourcePreload) {
      preloadCriticalResources();
    }

    // Prevent layout shifts
    if (enableLayoutShiftPrevention) {
      preventLayoutShifts();
    }

    // Monitor Core Web Vitals
    if (enablePerformanceMonitoring && typeof window !== "undefined") {
      monitorCoreWebVitals();
    }

    // Optimize font loading
    optimizeFontLoading();

    // Optimize images
    optimizeImageLoading();
  }, [
    enableCriticalResourcePreload,
    enableLayoutShiftPrevention,
    enablePerformanceMonitoring,
  ]);

  return null; // This component doesn't render anything
}

/**
 * Preload critical resources for better LCP
 */
function preloadCriticalResources() {
  const criticalResources = [
    { href: "/Mehr_Nastaliq.ttf", as: "font", type: "font/truetype" },
    { href: "/globals.css", as: "style" },
    { href: "/logo.png", as: "image" },
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.as === "font") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/**
 * Prevent layout shifts by reserving space for dynamic content
 */
function preventLayoutShifts() {
  // Add CSS to prevent layout shifts
  const style = document.createElement("style");
  style.textContent = `
    /* Prevent layout shift for images */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Reserve space for loading content */
    .loading-placeholder {
      min-height: 200px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* Prevent shift during font loading */
    .font-loading {
      visibility: hidden;
    }
    
    .font-loaded .font-loading {
      visibility: visible;
    }
    
    /* Stable dimensions for dynamic content */
    .content-container {
      contain: layout style;
    }
    
    /* Optimize for mobile viewport */
    @media (max-width: 768px) {
      .mobile-optimized {
        contain: layout;
        content-visibility: auto;
        contain-intrinsic-size: 0 200px;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Monitor Core Web Vitals and send to analytics
 */
function monitorCoreWebVitals() {
  if (!("PerformanceObserver" in window)) return;

  // Largest Contentful Paint (LCP)
  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;

      console.log("LCP:", lcp);

      // Send to analytics (implement your analytics here)
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "web_vitals", {
          event_category: "Performance",
          event_label: "LCP",
          value: Math.round(lcp),
        });
      }
    }).observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (error) {
    console.warn("LCP monitoring failed:", error);
  }

  // First Input Delay (FID)
  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as any; // FID entries have processingStart property
        const fid = fidEntry.processingStart - fidEntry.startTime;

        console.log("FID:", fid);

        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "web_vitals", {
            event_category: "Performance",
            event_label: "FID",
            value: Math.round(fid),
          });
        }
      });
    }).observe({ entryTypes: ["first-input"] });
  } catch (error) {
    console.warn("FID monitoring failed:", error);
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const clsEntry = entry as any; // CLS entries have hadRecentInput property
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      });

      console.log("CLS:", clsValue);

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "web_vitals", {
          event_category: "Performance",
          event_label: "CLS",
          value: Math.round(clsValue * 1000) / 1000,
        });
      }
    }).observe({ entryTypes: ["layout-shift"] });
  } catch (error) {
    console.warn("CLS monitoring failed:", error);
  }

  // Time to First Byte (TTFB)
  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const navigationEntry = entry as any; // Navigation entries have responseStart/requestStart
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;

        console.log("TTFB:", ttfb);

        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "web_vitals", {
            event_category: "Performance",
            event_label: "TTFB",
            value: Math.round(ttfb),
          });
        }
      });
    }).observe({ entryTypes: ["navigation"] });
  } catch (error) {
    console.warn("TTFB monitoring failed:", error);
  }
}

/**
 * Optimize font loading to reduce CLS
 */
function optimizeFontLoading() {
  // Check if fonts are already loaded
  if (document.fonts && document.fonts.check) {
    if (document.fonts.check('1em "Noto Nastaliq Urdu"')) {
      document.documentElement.classList.add("font-loaded");
      return;
    }
  }

  // Set up font loading with timeout
  const fontTimeout = setTimeout(() => {
    document.documentElement.classList.add("font-timeout");
  }, 3000);

  if (document.fonts && document.fonts.load) {
    document.fonts
      .load('1em "Noto Nastaliq Urdu"')
      .then(() => {
        clearTimeout(fontTimeout);
        document.documentElement.classList.add("font-loaded");
      })
      .catch(() => {
        clearTimeout(fontTimeout);
        document.documentElement.classList.add("font-error");
      });
  }
}

/**
 * Optimize image loading for better LCP
 */
function optimizeImageLoading() {
  // Prioritize above-the-fold images
  const heroImages = document.querySelectorAll('img[data-priority="high"]');
  heroImages.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      img.loading = "eager";
      (img as any).fetchPriority = "high";
    }
  });

  // Lazy load below-the-fold images
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));
  }
}

/**
 * Resource hints component for better performance
 */
export function ResourceHints() {
  useEffect(() => {
    // DNS prefetch for external domains
    const domains = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "https://api.airtable.com",
    ];

    domains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const preconnectDomains = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];

    preconnectDomains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

/**
 * Critical CSS injection component
 */
export function CriticalCSS({ css }: { css: string }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    style.setAttribute("data-critical", "true");
    document.head.appendChild(style);

    return () => {
      const criticalStyles = document.querySelectorAll('style[data-critical="true"]');
      criticalStyles.forEach((style) => style.remove());
    };
  }, [css]);

  return null;
}

/**
 * Service Worker registration for caching
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  return null;
}

/**
 * Performance budget monitoring
 */
export function PerformanceBudgetMonitor() {
  useEffect(() => {
    // Monitor bundle size and performance metrics
    const checkPerformanceBudget = () => {
      if (typeof performance !== "undefined" && performance.getEntriesByType) {
        const resources = performance.getEntriesByType("resource");
        let totalSize = 0;

        resources.forEach((resource: any) => {
          if (resource.transferSize) {
            totalSize += resource.transferSize;
          }
        });

        // Log warning if bundle size exceeds budget (2MB)
        const budgetMB = 2;
        const totalMB = totalSize / (1024 * 1024);

        if (totalMB > budgetMB) {
          console.warn(
            `Performance budget exceeded: ${totalMB.toFixed(2)}MB > ${budgetMB}MB`
          );
        }

        // Monitor JavaScript execution time
        const navigationTiming = performance.getEntriesByType("navigation")[0] as any;
        if (navigationTiming) {
          const jsExecutionTime = navigationTiming.loadEventEnd - navigationTiming.domContentLoadedEventStart;

          if (jsExecutionTime > 1000) {
            console.warn(
              `JavaScript execution time high: ${jsExecutionTime}ms`
            );
          }
        }
      }
    };

    // Check budget after page load
    if (document.readyState === "complete") {
      setTimeout(checkPerformanceBudget, 1000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(checkPerformanceBudget, 1000);
      });
    }
  }, []);

  return null;
}