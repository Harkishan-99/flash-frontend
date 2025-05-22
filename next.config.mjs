/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    unoptimized: false,
    domains: ['api.quanthive.in'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  swcMinify: true,
}

export default nextConfig
