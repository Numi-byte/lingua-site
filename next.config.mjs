// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Let production builds succeed even if ESLint errors exist.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
