import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";
import "dotenv/config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrisma = () => {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");

  // Use Turso cloud URL if provided, otherwise fallback to local SQLite file path
  const clientUrl = process.env.TURSO_DATABASE_URL || `file:${dbPath}`;
  const authToken = process.env.TURSO_DATABASE_URL ? process.env.TURSO_AUTH_TOKEN : undefined;

  const libsqlClient = createClient({
    url: clientUrl,
    authToken: authToken,
  });

  const adapter = new PrismaLibSql(libsqlClient as any);

  const client = new PrismaClient({
    adapter,
    log: ["query"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  
  return client;
};

export const prisma = globalForPrisma.prisma || getPrisma();
