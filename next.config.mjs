/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: '/admin',  // ← CORRECT: Use assetPrefix, NOT basePath
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.image2url.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
