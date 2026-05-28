/**
 * Next.js config: add a fallback webpack rule for `.html` files so they
 * are treated as static resources instead of unknown modules. This helps
 * when dependencies ship html files that Turbopack/Webpack may attempt to
 * interpret as modules.
 *
 * Note: Turbopack may still surface errors during development. If you
 * continue to see the "Unknown module type" error while using Turbopack,
 * run the dev server with the classic compiler:
 *
 * pnpm dev -- --no-turbopack
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;
