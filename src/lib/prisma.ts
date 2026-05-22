import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as { prisma: any };

const getPrisma = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  const adapter = new PrismaNeon({ connectionString });

  let client = new PrismaClient({
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

