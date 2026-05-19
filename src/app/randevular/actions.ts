"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  doctorId: z.string().min(1, "Doktor seçilmelidir."),
  dateTime: z.string().min(1, "Tarih ve saat seçilmelidir."),
  notes: z.string().optional(),
});

export async function getAppointments(startDate?: Date, endDate?: Date) {
  return await prisma.appointment.findMany({
    where: {
      dateTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { dateTime: "asc" },
  });
}

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  const validated = appointmentSchema.parse(data);
  
  const appointment = await prisma.appointment.create({
    data: {
      ...validated,
      dateTime: new Date(validated.dateTime),
    },
  });

  revalidatePath("/randevular");
  revalidatePath("/");
  return appointment;
}

export async function updateAppointmentStatus(id: string, status: string) {
  await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/randevular");
}
