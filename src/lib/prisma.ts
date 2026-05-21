import path from "path";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const tursoUrl = process.env.TURSO_DATABASE_URL;
const isTurso = !!(tursoUrl && tursoUrl !== "undefined" && tursoUrl.trim() !== "");
const clientUrl = isTurso ? tursoUrl : `file:${dbPath}`;

// Set DATABASE_URL immediately before importing @prisma/client
process.env.DATABASE_URL = clientUrl;

const globalForPrisma = global as unknown as { prisma: any };

const getPrisma = () => {
  let client: PrismaClient;

  if (isTurso) {
    const authToken = process.env.TURSO_AUTH_TOKEN;
    console.log(`Database: Using LibSQL adapter with URL: ${clientUrl}`);
    const libsqlClient = createClient({
      url: clientUrl,
      authToken: authToken,
    });
    const adapter = new PrismaLibSql(libsqlClient as any);
    client = new PrismaClient({
      adapter,
      log: ["query"],
    });
  } else {
    console.log(`Database: Using Better-SQLite3 adapter with URL: file:${dbPath}`);
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    client = new PrismaClient({
      adapter,
      log: ["query"],
    });
  }

  // Extend the client to auto-sync modifications to Google Sheets asynchronously
  return client.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args);
        const writeOperations = [
          "create", "update", "delete", "createMany", "updateMany", "deleteMany", "upsert"
        ];
        if (model && writeOperations.includes(operation)) {
          // Perform sync in the background to prevent blocking user request
          setTimeout(async () => {
            try {
              const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
              if ((prisma as any)[modelKey]) {
                const allRows = await (prisma as any)[modelKey].findMany();
                const { syncModelToSheets } = await import("./googleSheetsSync");
                await syncModelToSheets(model, allRows);
              }
            } catch (err) {
              console.error(`[Prisma Extension] Google Sheets sync error for model ${model}:`, err);
            }
          }, 100);
        }
        return result;
      }
    }
  }) as any;
};

export const prisma: PrismaClient = globalForPrisma.prisma || getPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

