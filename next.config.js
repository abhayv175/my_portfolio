/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [25, 50, 75, 80, 95], 
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