import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enable React strict mode for development */
  reactStrictMode: true,

  /* Configure logging for API routes */
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  /* Server external packages that need Node.js runtime */
  serverExternalPackages: ["@prisma/client", "@google/generative-ai"],

  /* Headers for security */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
