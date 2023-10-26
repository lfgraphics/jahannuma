/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
    reactStrictMode: true,
    images: {
        domains: ['ideogram.ai', 'rekhta.org', 'instagram.com', 'google.com'], // Add the domains you want to allow here
    },
};
