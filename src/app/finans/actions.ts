"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const paymentSchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  amount: z.number().min(0, "Tutar 0'dan büyük olmalıdır."),
  type: z.string().min(1, "Ödeme türü seçilmelidir."),
  notes: z.string().optional(),
});

export async function getPayments() {
  return await prisma.payment.findMany({
    include: {
      patient: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function createPayment(data: z.infer<typeof paymentSchema>) {
  const validated = paymentSchema.parse(data);
  
  const payment = await prisma.payment.create({
    data: validated,
    include: {
      patient: true,
    }
  });

  revalidatePath("/finans");
  revalidatePath("/");
  return payment;
}
