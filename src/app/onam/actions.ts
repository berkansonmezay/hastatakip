"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/auditLog";

export async function getConsentForms() {
  return await prisma.consentForm.findMany({
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          protocolNo: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createConsentForm(data: {
  patientId: string;
  type: "KVKK" | "SURGERY" | "ANESTHESIA" | "TREATMENT";
  content: string;
  signature: string; // Base64 signature image
}) {
  const consent = await prisma.consentForm.create({
    data: {
      patientId: data.patientId,
      type: data.type,
      content: data.content,
      signature: data.signature,
      signedAt: new Date(),
    },
    include: {
      patient: {
        select: {
          fullName: true,
        },
      },
    },
  });

  await logAudit(
    "CREATE",
    "ConsentForm",
    consent.id,
    {
      patientId: consent.patientId,
      patientName: consent.patient.fullName,
      type: consent.type,
    }
  );

  revalidatePath("/onam");
  revalidatePath(`/hastalar/${data.patientId}`);
  return consent;
}

export async function deleteConsentForm(id: string, patientId: string) {
  await prisma.consentForm.delete({
    where: { id },
  });

  await logAudit("DELETE", "ConsentForm", id, { patientId });

  revalidatePath("/onam");
  revalidatePath(`/hastalar/${patientId}`);
}
