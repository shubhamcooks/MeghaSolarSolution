/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable dev indicators (like the static rendering indicator and build activity spinner)
  devIndicators: false,

  // Silence Turbopack conflict since custom webpack settings are defined below
  turbopack: {},
  images: { unoptimized: true },
  webpack: (config) => {
    config.cache = false;
    config.snapshot = {
      ...(config.snapshot || {}),
      managedPaths: [],
      immutablePaths: [],
    };
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    // Reduce filesystem pressure by disabling unnecessary file watching
    config.watchOptions = {
      ignored: /node_modules/,
    };
    return config;
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;