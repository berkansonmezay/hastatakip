"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const treatmentSchema = z.object({
  name: z.string().min(2, "Tedavi adı en az 2 karakter olmalıdır."),
  category: z.string().optional(),
  cost: z.coerce.number().min(0, "Maliyet 0'dan küçük olamaz."),
  duration: z.coerce.number().optional(),
  description: z.string().optional(),
});

export async function getTreatments(query?: string) {
  return await prisma.treatment.findMany({
    where: query ? {
      OR: [
        { name: { contains: query } },
        { category: { contains: query } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function createTreatment(data: z.infer<typeof treatmentSchema>) {
  const validated = treatmentSchema.parse(data);
  
  const treatment = await prisma.treatment.create({
    data: {
      name: validated.name,
      category: validated.category,
      cost: validated.cost,
      duration: validated.duration,
      description: validated.description,
    }
  });

  revalidatePath("/tedaviler");
  return treatment;
}

export async function deleteTreatment(id: string) {
  await prisma.treatment.delete({ where: { id } });
  revalidatePath("/tedaviler");
}
