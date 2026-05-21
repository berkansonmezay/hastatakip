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

const expenseSchema = z.object({
  category: z.string().min(1, "Kategori seçilmelidir."),
  description: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().min(0.01, "Tutar 0'dan büyük olmalıdır."),
  date: z.string().min(1, "Gider tarihi gereklidir."),
  notes: z.string().optional().or(z.literal("")),
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

export async function getExpenses() {
  return await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });
}

export async function createExpense(data: z.infer<typeof expenseSchema>) {
  const validated = expenseSchema.parse(data);
  
  const expense = await prisma.expense.create({
    data: {
      ...validated,
      date: new Date(validated.date),
      description: validated.description || null,
      notes: validated.notes || null,
    }
  });

  revalidatePath("/finans");
  revalidatePath("/");
  return expense;
}

export async function deleteExpense(id: string) {
  const deleted = await prisma.expense.delete({
    where: { id }
  });
  revalidatePath("/finans");
  revalidatePath("/");
  return deleted;
}
