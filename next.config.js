/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'v5.airtableusercontent.com',
                port: '',
                pathname: '/v2/22/22/1700164800000/**', // Use '*' as a wildcard for dynamic path variations
            },
        ],
    },
};

module.exports = nextConfig