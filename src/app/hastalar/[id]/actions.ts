"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/auditLog";

// ========================
// HASTA CRUD
// ========================

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      allergies: { orderBy: { createdAt: "desc" } },
      medications: { orderBy: { createdAt: "desc" } },
      familyHistory: { orderBy: { createdAt: "desc" } },
      surgeries: { orderBy: { date: "desc" } },
      followUps: { orderBy: { date: "desc" } },
      examinations: { orderBy: { createdAt: "desc" }, include: { doctor: true } },
      fileAttachments: { orderBy: { uploadedAt: "desc" } },
      appointments: { orderBy: { dateTime: "desc" }, take: 10, include: { doctor: true } },
      prescriptions: { orderBy: { date: "desc" }, take: 10, include: { doctor: true, items: true } },
      labTests: { orderBy: { date: "desc" }, take: 10, include: { doctor: true } },
    },
  });
}

export async function updatePatient(id: string, data: any) {
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      fullName: data.fullName,
      tcNo: data.tcNo || null,
      protocolNo: data.protocolNo || null,
      phone: data.phone || null,
      secondPhone: data.secondPhone || null,
      email: data.email || null,
      address: data.address || null,
      gender: data.gender || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      bloodGroup: data.bloodGroup || null,
      insuranceInfo: data.insuranceInfo || null,
      notes: data.notes || null,
      relativeName: data.relativeName || null,
      relativePhone: data.relativePhone || null,
      relativeRelation: data.relativeRelation || null,
      emergencyName: data.emergencyName || null,
      emergencyPhone: data.emergencyPhone || null,
      emergencyRelation: data.emergencyRelation || null,
      smokingStatus: data.smokingStatus || null,
      alcoholStatus: data.alcoholStatus || null,
      chronicDiseases: data.chronicDiseases || null,
      pastOperations: data.pastOperations || null,
      systemicDiseases: data.systemicDiseases || null,
      previousHospitalRecords: data.previousHospitalRecords || null,
      riskStatus: data.riskStatus || "LOW",
    },
  });
  
  await logAudit("UPDATE", "Patient", id, { fullName: patient.fullName });
  
  revalidatePath(`/hastalar/${id}`);
  return patient;
}

// ========================
// ALERJİ CRUD
// ========================

export async function createAllergy(patientId: string, data: any) {
  const allergy = await prisma.allergy.create({
    data: {
      patientId,
      type: data.type,
      name: data.name,
      severity: data.severity || null,
      reaction: data.reaction || null,
      notes: data.notes || null,
    },
  });

  await logAudit("CREATE", "Allergy", allergy.id, { patientId, name: allergy.name });

  revalidatePath(`/hastalar/${patientId}`);
  return allergy;
}

export async function deleteAllergy(id: string, patientId: string) {
  await prisma.allergy.delete({ where: { id } });
  await logAudit("DELETE", "Allergy", id, { patientId });
  revalidatePath(`/hastalar/${patientId}`);
}

// ========================
// İLAÇ CRUD
// ========================

export async function createMedication(patientId: string, data: any) {
  const med = await prisma.patientMedication.create({
    data: {
      patientId,
      name: data.name,
      dosage: data.dosage || null,
      frequency: data.frequency || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isActive !== false,
      notes: data.notes || null,
    },
  });

  await logAudit("CREATE", "PatientMedication", med.id, { patientId, name: med.name });

  revalidatePath(`/hastalar/${patientId}`);
  return med;
}

export async function deleteMedication(id: string, patientId: string) {
  await prisma.patientMedication.delete({ where: { id } });
  await logAudit("DELETE", "PatientMedication", id, { patientId });
  revalidatePath(`/hastalar/${patientId}`);
}

// ========================
// SOYGEÇMİŞ CRUD
// ========================

export async function createFamilyHistory(patientId: string, data: any) {
  const fh = await prisma.familyHistory.create({
    data: {
      patientId,
      condition: data.condition,
      relation: data.relation || null,
      notes: data.notes || null,
    },
  });

  await logAudit("CREATE", "FamilyHistory", fh.id, { patientId, condition: fh.condition });

  revalidatePath(`/hastalar/${patientId}`);
  return fh;
}

export async function deleteFamilyHistory(id: string, patientId: string) {
  await prisma.familyHistory.delete({ where: { id } });
  await logAudit("DELETE", "FamilyHistory", id, { patientId });
  revalidatePath(`/hastalar/${patientId}`);
}

// ========================
// AMELİYAT CRUD
// ========================

export async function createSurgery(patientId: string, data: any) {
  const surgery = await prisma.surgery.create({
    data: {
      patientId,
      name: data.name,
      date: data.date ? new Date(data.date) : null,
      surgeonId: data.surgeonId || null,
      assistantTeam: data.assistantTeam || null,
      technique: data.technique || null,
      duration: data.duration ? parseInt(data.duration) : null,
      anesthesiaType: data.anesthesiaType || null,
      operationNote: data.operationNote || null,
      complication: data.complication || null,
      status: data.status || "PLANNED",
    },
  });

  await logAudit("CREATE", "Surgery", surgery.id, { patientId, name: surgery.name });

  revalidatePath(`/hastalar/${patientId}`);
  return surgery;
}

export async function deleteSurgery(id: string, patientId: string) {
  await prisma.surgery.delete({ where: { id } });
  await logAudit("DELETE", "Surgery", id, { patientId });
  revalidatePath(`/hastalar/${patientId}`);
}

// ========================
// TAKİP CRUD
// ========================

export async function createFollowUp(patientId: string, data: any) {
  const followUp = await prisma.followUp.create({
    data: {
      patientId,
      doctorId: data.doctorId || null,
      date: new Date(data.date),
      type: data.type || null,
      notes: data.notes || null,
      result: data.result || null,
    },
  });

  await logAudit("CREATE", "FollowUp", followUp.id, { patientId, date: followUp.date });

  revalidatePath(`/hastalar/${patientId}`);
  return followUp;
}

export async function deleteFollowUp(id: string, patientId: string) {
  await prisma.followUp.delete({ where: { id } });
  await logAudit("DELETE", "FollowUp", id, { patientId });
  revalidatePath(`/hastalar/${patientId}`);
}
