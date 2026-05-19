"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(2, "İlaç adı en az 2 karakter olmalıdır."),
  dosage: z.string().min(1, "Doz belirtilmelidir."),
  frequency: z.string().min(1, "Kullanım sıklığı belirtilmelidir."),
  duration: z.string().min(1, "Kullanım süresi belirtilmelidir."),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Hasta seçimi zorunludur."),
  doctorId: z.string().min(1, "Doktor seçimi zorunludur."),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, "En az bir ilaç eklenmelidir."),
});

export async function getPrescriptions(query?: string) {
  return await prisma.prescription.findMany({
    where: query ? {
      OR: [
        { patient: { fullName: { contains: query } } },
        { diagnosis: { contains: query } },
      ]
    } : undefined,
    include: {
      patient: true,
      doctor: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// Reuse dropdown getters
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

export async function createPrescription(data: z.infer<typeof prescriptionSchema>) {
  const validated = prescriptionSchema.parse(data);
  
  const prescription = await prisma.prescription.create({
    data: {
      patientId: validated.patientId,
      doctorId: validated.doctorId,
      diagnosis: validated.diagnosis,
      notes: validated.notes,
      items: {
        create: validated.items.map(item => ({
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
        }))
      }
    },
    include: {
      patient: true,
      doctor: true,
      items: true,
    }
  });

  revalidatePath("/receteler");
  return prescription;
}

export async function deletePrescription(id: string) {
  // Cascades to delete items because we added onDelete: Cascade in schema
  await prisma.prescription.delete({ where: { id } });
  revalidatePath("/receteler");
}
