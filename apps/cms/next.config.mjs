import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true }, // TODO: Fix remaining lib/store type errors incrementally
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: [
    '@skill-learn/ui',
    '@skill-learn/lib',
    '@skill-learn/database',
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
