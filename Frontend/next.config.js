/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  webpack: (config) => {
    // Add support for importing from parent directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@backend': require('path').resolve(__dirname, '../src/slide-designer'),
    };
    return config;
  },
};

module.exports = nextConfig;
