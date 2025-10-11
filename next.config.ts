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
        pathname: "/metaimages/**",
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

  // Headers for better SEO and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
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

  // Trailing slash handling
  trailingSlash: false,
};

export default nextConfig;