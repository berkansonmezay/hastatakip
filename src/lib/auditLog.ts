import { prisma } from "./prisma";
import { getSession } from "./session";

export async function logAudit(
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT",
  entity: string,
  entityId?: string | null,
  details?: Record<string, any> | string | null,
  ipAddress?: string | null
) {
  try {
    const session = await getSession();
    const userId = session?.userId || null;
    const userName = session?.name || null;

    const detailsStr = typeof details === "object" ? JSON.stringify(details) : details || null;

    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        action,
        entity,
        entityId,
        details: detailsStr,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
