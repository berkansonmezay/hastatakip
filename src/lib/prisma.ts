import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";
import "dotenv/config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrisma = () => {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const tursoUrl = process.env.TURSO_DATABASE_URL;

  const isTurso = tursoUrl && tursoUrl !== "undefined" && tursoUrl.trim() !== "";
  const clientUrl = isTurso ? tursoUrl : `file:${dbPath}`;
  const authToken = isTurso ? process.env.TURSO_AUTH_TOKEN : undefined;

  // Set DATABASE_URL dynamically to satisfy Prisma Client's schema lookup at runtime
  process.env.DATABASE_URL = clientUrl;

  console.log(`Database: Using LibSQL adapter with URL: ${clientUrl}`);

  const libsqlClient = createClient({
    url: clientUrl,
    authToken: authToken,
  });

  const adapter = new PrismaLibSql(libsqlClient as any);
  return new PrismaClient({
    adapter,
    log: ["query"],
  });
};

export const prisma = globalForPrisma.prisma || getPrisma();
