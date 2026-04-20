/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 1. Add the specific quality used in your project to satisfy the Next.js 16 requirement
    qualities: [25, 50, 75, 95], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // 2. Server Actions are stable now; this block is usually only needed 
  // if you are using specific experimental features like 'ppr' or 'taint'.
  // Keeping it clean helps with build stability.
  experimental: {}, 
};

module.exports = nextConfig;