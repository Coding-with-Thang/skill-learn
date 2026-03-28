import path from 'path';
import { fileURLToPath } from 'url';
import { getSecurityHeaderRouteRules } from '../../scripts/next-security-headers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: [
    '@skill-learn/ui',
    '@skill-learn/lib',
    '@skill-learn/database',
  ],
  async headers() {
    return getSecurityHeaderRouteRules();
  },
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
