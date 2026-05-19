"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const patientSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  tcNo: z.string().length(11, "TC Kimlik No 11 hane olmalıdır.").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta giriniz.").optional().or(z.literal("")),
  address: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export async function getPatients(query?: string) {
  return await prisma.patient.findMany({
    where: query ? {
      OR: [
        { fullName: { contains: query } },
        { tcNo: { contains: query } },
        { phone: { contains: query } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function createPatient(data: z.infer<typeof patientSchema>) {
  const validated = patientSchema.parse(data);
  
  const patient = await prisma.patient.create({
    data: {
      ...validated,
      birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
      tcNo: validated.tcNo || null,
      email: validated.email || null,
    },
  });

  revalidatePath("/hastalar");
  return patient;
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/hastalar");
}
