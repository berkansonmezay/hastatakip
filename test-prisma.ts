import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

async function main() {
  const dbPath = path.join(process.cwd(), "dev.db");
  console.log("DB Path:", dbPath);
  const sqlite = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3(sqlite);

  const prisma = new PrismaClient({ adapter });
  
  try {
    const count = await prisma.patient.count();
    console.log("Patient count:", count);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
