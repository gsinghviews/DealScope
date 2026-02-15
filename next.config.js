/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase body size limit for base64 PDF uploads (default 1MB is too small)
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

module.exports = nextConfig;
