"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications(userId?: string) {
  // If no user ID is provided, fetch all notifications (for admin view)
  return await prisma.notification.findMany({
    where: userId ? { userId } : undefined,
    include: {
      user: {
        select: { id: true, name: true, role: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function markAsRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/bildirimler");
}

export async function markAllAsRead(userId?: string) {
  await prisma.notification.updateMany({
    where: userId ? { userId, isRead: false } : { isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/bildirimler");
}

export async function deleteNotification(id: string) {
  await prisma.notification.delete({ where: { id } });
  revalidatePath("/bildirimler");
}
