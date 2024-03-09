/** @type {import('next').NextConfig} */
const nextConfig = {
    runtime: 'edge',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    output: 'standalone',
};

export default nextConfig;
