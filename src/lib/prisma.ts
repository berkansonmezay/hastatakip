import path from "path";
import "dotenv/config";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const tursoUrl = process.env.TURSO_DATABASE_URL;
const isTurso = tursoUrl && tursoUrl !== "undefined" && tursoUrl.trim() !== "";
const clientUrl = isTurso ? tursoUrl : `file:${dbPath}`;

// Set DATABASE_URL immediately before importing @prisma/client
process.env.DATABASE_URL = clientUrl;

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrisma = () => {
  const authToken = isTurso ? process.env.TURSO_AUTH_TOKEN : undefined;

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
