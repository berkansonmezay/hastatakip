"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const labTestSchema = z.object({
  patientId: z.string().min(1, "Hasta seçimi zorunludur."),
  doctorId: z.string().min(1, "Doktor seçimi zorunludur."),
  testName: z.string().min(2, "Tetkik adı en az 2 karakter olmalıdır."),
});

export async function getLabTests(query?: string) {
  return await prisma.labTest.findMany({
    where: query ? {
      OR: [
        { testName: { contains: query } },
        { patient: { fullName: { contains: query } } },
      ]
    } : undefined,
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// We need these to populate dropdowns in the UI
export async function getPatientsForDropdown() {
  return await prisma.patient.findMany({
    select: { id: true, fullName: true, tcNo: true },
    orderBy: { fullName: "asc" }
  });
}

export async function getDoctorsForDropdown() {
  return await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });
}

export async function createLabTest(data: z.infer<typeof labTestSchema>) {
  const validated = labTestSchema.parse(data);
  
  const labTest = await prisma.labTest.create({
    data: {
      patientId: validated.patientId,
      doctorId: validated.doctorId,
      testName: validated.testName,
      status: "PENDING",
    },
    include: {
      patient: true,
      doctor: true,
    }
  });

  revalidatePath("/tetkikler");
  return labTest;
}

export async function updateLabTestResult(id: string, result: string) {
  const labTest = await prisma.labTest.update({
    where: { id },
    data: { 
      result,
      status: "COMPLETED" 
    },
    include: {
      patient: true,
      doctor: true,
    }
  });

  revalidatePath("/tetkikler");
  return labTest;
}

export async function deleteLabTest(id: string) {
  await prisma.labTest.delete({ where: { id } });
  revalidatePath("/tetkikler");
}
