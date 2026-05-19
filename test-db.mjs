import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import "dotenv/config";

async function main() {
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

    const client = new PrismaClient({ adapter });

    try {
        const p = await client.patient.findMany();
        console.log("Patients:", p);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.$disconnect();
    }
}
main();
