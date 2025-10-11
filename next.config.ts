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

    // Turbo mode (when using --turbo)
    turbo: {
      rules: {
        "*.tsx": ["swc-loader"],
        "*.ts": ["swc-loader"],
      },
    },
  },

  // Webpack configuration for path aliases and optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size in production
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Internationalization configuration for multi-language support
  i18n: {
    locales: ["en", "ur", "hi"],
    defaultLocale: "ur",
    localeDetection: false,
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

  // Redirects for SEO and URL management
  async redirects() {
    return [
      // Redirect old URLs to new structure if needed
      {
        source: "/old-path/:path*",
        destination: "/new-path/:path*",
        permanent: true,
      },
    ];
  },

  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Enable SWC minifier for better performance
  swcMinify: true,

  // Compress responses
  compress: true,

  // Enable powered by header removal for security
  poweredByHeader: false,

  // Trailing slash handling
  trailingSlash: false,
};

export default nextConfig;
