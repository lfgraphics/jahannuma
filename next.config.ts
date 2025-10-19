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
        source: "/service-worker.js",
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

  // Bundle analyzer configuration
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
      if (!isServer) {
        // Only analyze client-side bundles
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../bundle-analysis/client.html',
            openAnalyzer: false,
          })
        );
      } else {
        // Analyze server-side bundles separately
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../bundle-analysis/server.html',
            openAnalyzer: false,
          })
        );
      }

      // Optimize chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Separate vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Separate common chunks
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
            // Separate data fetching utilities
            dataFetching: {
              test: /[\\/](lib|hooks)[\\/].*\.(ts|tsx|js|jsx)$/,
              name: 'data-fetching',
              chunks: 'all',
              priority: 8,
            },
          },
        },
      };

      return config;
    },
  }),
};

export default nextConfig;