"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RoleEnum = z.enum(["ADMIN", "DOCTOR", "SECRETARY", "ACCOUNTING", "LAB"]);

const userSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  email: z.string().email("Geçerli bir e-posta giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
  role: RoleEnum,
});

export async function getUsers(query?: string) {
  return await prisma.user.findMany({
    where: query ? {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  });
}

export async function createUser(data: z.infer<typeof userSchema>) {
  const validated = userSchema.parse(data);
  
  // Şimdilik şifre plaintext olarak kaydediliyor.
  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      password: validated.password, 
      role: validated.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  });

  revalidatePath("/personeller");
  return user;
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/personeller");
}
