import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  env: {
    DATABASE_URL: process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db",
  },
};

export default nextConfig;
