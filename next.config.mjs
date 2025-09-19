// Next.js 15 ESM configuration with optional PWA wrapper.
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Typed Routes moved out of experimental in Next 15
  // Keep disabled to allow dynamic string hrefs in <Link/>
  typedRoutes: false,
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors. You can still run `npm run lint`
    // locally to fix issues.
    ignoreDuringBuilds: true
  },
  images: {
    // Use remotePatterns only (domains is deprecated)
    remotePatterns: [
      { protocol: 'https', hostname: 'v5.airtableusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'blogger.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'jahannuma.vercel.app', pathname: '/metaimages/**' }
    ]
  },
  typescript: {
    tsconfigPath: './tsconfig.json'
  }
};

const isPwaEnabled = process.env.ENABLE_PWA === 'true';

export default isPwaEnabled
  ? withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === 'development'
    })(config)
  : config;
