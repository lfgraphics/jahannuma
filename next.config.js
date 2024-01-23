const path = require('path');
const withPWA = require('next-pwa');

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['v5.airtableusercontent.com'],
        domains: ['i.ytimg.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'jahannuma.vercel.app',
                port: '',
                pathname: '/metaimages/**',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Your existing configurations here...

    // Additional configurations for next-pwa
    ...withPWA({
        pwa: {
            dest: 'public',
            register: true,
            skipWaiting: true,
            disable: process.env.NODE_ENV === 'development',
            // You can add more PWA-specific configurations here if needed
        },
    }),
};

module.exports = nextConfig;
