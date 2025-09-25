import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'v5.airtableusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'blogger.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'jahannuma.vercel.app', pathname: '/metaimages/**' }
    ]
  },
};

export default nextConfig;
