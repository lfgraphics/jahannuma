import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization and remote patterns
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v5.airtableusercontent.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "blogger.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jahannuma.vercel.app",
        pathname: "/metaImages/**",
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimizePackageImports for better bundle size
    optimizePackageImports: ["@clerk/nextjs", "swr"],

    // Enable partial prerendering for better performance
    ppr: false, // Enable when stable
  },

  // Redirects for SEO and URL management (empty for now)
  async redirects() {
    return [];
  },

  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Enable powered by header removal for security
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        // CSS files should have proper MIME type
        source: "/:path*.css",
        headers: [
          {
            key: "Content-Type",
            value: "text/css",
          },
        ],
      },
      {
        // JavaScript files should have proper MIME type
        source: "/:path*.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
        ],
      },
      {
        // All other routes get security headers
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Service Worker should not be cached
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        // Manifest is now handled by app/manifest.ts
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
    ];
  },

  // Trailing slash handling
  trailingSlash: false,
};

export default nextConfig;