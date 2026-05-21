import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3"
  ],
  env: {
    DATABASE_URL: process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db",
  },
};

export default nextConfig;
