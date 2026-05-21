import path from "path";
import fs from "fs";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

let dbPath = path.join(process.cwd(), "prisma", "dev.db");

// Copy SQLite database to /tmp on Vercel to allow write access
if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  const tmpPath = path.join("/tmp", "dev.db");
  try {
    if (!fs.existsSync(tmpPath)) {
      console.log(`[Database Setup] Copying database template from ${dbPath} to ${tmpPath}`);
      fs.copyFileSync(dbPath, tmpPath);
    }
    dbPath = tmpPath;
  } catch (error) {
    console.error("[Database Setup] Failed to copy database to /tmp:", error);
  }
}

const tursoUrl = process.env.TURSO_DATABASE_URL;
const isTurso = !!(tursoUrl && tursoUrl !== "undefined" && tursoUrl.trim() !== "");
const clientUrl = isTurso ? tursoUrl : `file:${dbPath}`;

// Set DATABASE_URL immediately before importing @prisma/client
process.env.DATABASE_URL = clientUrl;

const globalForPrisma = global as unknown as { prisma: any };

const getPrisma = () => {
  let client: PrismaClient;

  console.log(`Database: Using LibSQL adapter with URL: ${clientUrl}`);
  const libsqlClient = createClient({
    url: clientUrl,
    authToken: isTurso ? process.env.TURSO_AUTH_TOKEN : undefined,
  });
  const adapter = new PrismaLibSql(libsqlClient as any);
  client = new PrismaClient({
    adapter,
    log: ["query"],
  });

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

