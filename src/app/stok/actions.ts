"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inventoryItemSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır."),
  category: z.string().min(2, "Kategori seçilmelidir."),
  quantity: z.coerce.number().min(0, "Miktar 0'dan küçük olamaz."),
  unit: z.string().min(1, "Birim seçilmelidir."),
  unitPrice: z.coerce.number().min(0, "Birim fiyatı 0'dan küçük olamaz."),
  minThreshold: z.coerce.number().min(0, "Minimum sınır 0'dan küçük olamaz."),
  expiration: z.string().optional(),
});

export async function getInventoryItems(query?: string) {
  return await prisma.inventoryItem.findMany({
    where: query ? {
      OR: [
        { name: { contains: query } },
        { category: { contains: query } },
      ]
    } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function createInventoryItem(data: z.infer<typeof inventoryItemSchema>) {
  const validated = inventoryItemSchema.parse(data);
  
  const expirationDate = validated.expiration ? new Date(validated.expiration) : undefined;
  
  const item = await prisma.inventoryItem.create({
    data: {
      name: validated.name,
      category: validated.category,
      quantity: validated.quantity,
      unit: validated.unit,
      unitPrice: validated.unitPrice,
      minThreshold: validated.minThreshold,
      expiration: expirationDate,
    }
  });

  revalidatePath("/stok");
  return item;
}

export async function deleteInventoryItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/stok");
}

export async function updateInventoryQuantity(id: string, newQuantity: number) {
  const item = await prisma.inventoryItem.update({
    where: { id },
    data: { quantity: newQuantity }
  });
  revalidatePath("/stok");
  return item;
}
