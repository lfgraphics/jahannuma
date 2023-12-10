/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['v5.airtableusercontent.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'jahannuma.vercel.app',
                port: '',
                pathname: '/metaimages/**',
            },
        ],    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;