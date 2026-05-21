"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/auditLog";
import { getSession } from "@/lib/session";

export async function getSettingsData() {
  const session = await getSession();
  
  // Fetch users for role management
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recent audit logs (last 200 logs)
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return {
    currentUserRole: session?.role || "SECRETARY",
    users,
    logs,
  };
}

export async function updateUserRole(userId: string, newRole: "ADMIN" | "DOCTOR" | "SECRETARY" | "ACCOUNTING" | "LAB") {
  const session = await getSession();
  if (session?.role !== "ADMIN") {
    throw new Error("Bu işlemi gerçekleştirmek için ADMIN yetkisi gereklidir.");
  }

  const oldUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true },
  });

  if (!oldUser) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  await logAudit("UPDATE", "User", userId, {
    userName: oldUser.name,
    oldRole: oldUser.role,
    newRole,
  });

  revalidatePath("/ayarlar");
  return updatedUser;
}
