"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const surgerySchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  name: z.string().min(1, "Operasyon adı gereklidir."),
  date: z.string().min(1, "Ameliyat tarihi gereklidir."),
  surgeonId: z.string().optional().or(z.literal("")),
  assistantTeam: z.string().optional().or(z.literal("")),
  technique: z.string().optional().or(z.literal("")),
  duration: z.coerce.number().optional(),
  anesthesiaType: z.string().optional().or(z.literal("")),
  operationNote: z.string().optional().or(z.literal("")),
  complication: z.string().optional().or(z.literal("")),
  status: z.string().default("PLANNED"),
});

export async function getSurgeries() {
  return await prisma.surgery.findMany({
    include: {
      patient: true,
      surgeon: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function createSurgery(data: z.infer<typeof surgerySchema>) {
  const validated = surgerySchema.parse(data);
  
  const surgery = await prisma.surgery.create({
    data: {
      ...validated,
      date: new Date(validated.date),
      surgeonId: validated.surgeonId || null,
      duration: validated.duration || null,
    },
    include: {
      patient: true,
      surgeon: true,
    }
  });

  revalidatePath("/ameliyat");
  revalidatePath("/hastalar/" + validated.patientId);
  return surgery;
}

export async function updateSurgeryStatus(id: string, status: string, patientId: string) {
  const updated = await prisma.surgery.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/ameliyat");
  revalidatePath("/hastalar/" + patientId);
  return updated;
}

export async function deleteSurgery(id: string, patientId: string) {
  await prisma.surgery.delete({ where: { id } });
  revalidatePath("/ameliyat");
  revalidatePath("/hastalar/" + patientId);
}
