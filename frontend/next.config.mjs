import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  poweredByHeader: false,
  // Blob/data URLs are used for evidence imagery, so next/image is not involved.
  images: { unoptimized: true },
};

export default nextConfig;
