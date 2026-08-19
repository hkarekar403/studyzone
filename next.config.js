/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // Topic pages moved under a class segment before they were ever indexed.
      // These 301s exist so any link written against the old shape still lands,
      // and so /topics reads as a sensible entry point.
      {
        source: '/topics',
        destination: '/class-4/topics',
        permanent: true,
      },
      {
        source: '/topics/:slug',
        destination: '/class-4/topics/:slug',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
