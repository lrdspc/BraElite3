/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizeFonts: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
}

module.exports = nextConfig
