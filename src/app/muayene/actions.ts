"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const examinationSchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  doctorId: z.string().min(1, "Doktor seçilmelidir."),
  complaint: z.string().optional(),
  complaintHistory: z.string().optional(),
  physicalExam: z.string().optional(),
  examTemplate: z.string().optional(),
  diagnosis: z.string().optional(),
  preliminaryDiag: z.string().optional(),
  finalDiagnosis: z.string().optional(),
  icd10Code: z.string().optional(),
  treatment: z.string().optional(),
  treatmentPlan: z.string().optional(),
  dietAdvice: z.string().optional(),
  lifestyleAdvice: z.string().optional(),
  controlPlan: z.string().optional(),
  notes: z.string().optional(),
});

export async function getExaminations(patientId?: string) {
  return await prisma.examination.findMany({
    where: patientId ? { patientId } : undefined,
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createExamination(data: z.infer<typeof examinationSchema>) {
  const validated = examinationSchema.parse(data);
  
  const examination = await prisma.examination.create({
    data: validated,
    include: {
      patient: true,
      doctor: true,
    }
  });

  revalidatePath("/muayene");
  revalidatePath("/hastalar/" + validated.patientId);
  return examination;
}
