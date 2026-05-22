const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const ws = require("ws");
const { neonConfig } = require("@neondatabase/serverless");
require("dotenv").config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing.");
}
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });
async function main() {
  // Create a default doctor
  const doctor = await prisma.user.upsert({
    where: { email: "dr.ahmet@klinik.com" },
    update: {},
    create: {
      email: "dr.ahmet@klinik.com",
      name: "Ahmet Yılmaz",
      password: "password123", // In a real app, hash this!
      role: "DOCTOR",
    },
  });

  // Create some patients
  const patient1 = await prisma.patient.upsert({
    where: { tcNo: "11111111111" },
    update: {},
    create: {
      fullName: "Mehmet Demir",
      tcNo: "11111111111",
      phone: "0555 111 22 33",
      email: "mehmet@example.com",
      gender: "Erkek",
      bloodGroup: "A+",
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { tcNo: "22222222222" },
    update: {},
    create: {
      fullName: "Ayşe Kaya",
      tcNo: "22222222222",
      phone: "0555 222 33 44",
      email: "ayse@example.com",
      gender: "Kadın",
      bloodGroup: "0+",
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
