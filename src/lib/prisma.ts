import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";
import "dotenv/config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrisma = () => {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");

  // Create LibSQL client using local file path
  const libsqlClient = createClient({
    url: `file:${dbPath}`,
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
