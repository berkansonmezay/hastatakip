"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from "date-fns";

export async function getReportStats() {
  const now = new Date();
  
  // This month limits
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  
  // Last month limits
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  // 1. Hasta İstatistikleri
  const totalPatients = await prisma.patient.count();
  const newPatientsThisMonth = await prisma.patient.count({
    where: { createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });
  const newPatientsLastMonth = await prisma.patient.count({
    where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
  });
  
  const patientTrend = newPatientsLastMonth === 0 
    ? 100 
    : Math.round(((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100);

  // 2. Randevu İstatistikleri
  const totalAppointmentsThisMonth = await prisma.appointment.count({
    where: { dateTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });
  
  const completedAppointmentsThisMonth = await prisma.appointment.count({
    where: { 
      dateTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
      status: "COMPLETED"
    }
  });

  const completionRate = totalAppointmentsThisMonth === 0 
    ? 0 
    : Math.round((completedAppointmentsThisMonth / totalAppointmentsThisMonth) * 100);

  // 3. Gelir İstatistikleri (Payments)
  const paymentsThisMonth = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });
  
  const paymentsLastMonth = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } }
  });

  const revenueThisMonth = paymentsThisMonth._sum.amount || 0;
  const revenueLastMonth = paymentsLastMonth._sum.amount || 0;
  
  const revenueTrend = revenueLastMonth === 0 
    ? 100 
    : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

  // 4. Gelir Dağılımı (Ödeme Tipleri)
  const paymentsByType = await prisma.payment.groupBy({
    by: ['type'],
    _sum: { amount: true },
    where: { date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });

  return {
    patients: {
      total: totalPatients,
      newThisMonth: newPatientsThisMonth,
      trend: patientTrend
    },
    appointments: {
      total: totalAppointmentsThisMonth,
      completed: completedAppointmentsThisMonth,
      completionRate
    },
    revenue: {
      thisMonth: revenueThisMonth,
      trend: revenueTrend,
      byType: paymentsByType.map((p: any) => ({
        type: p.type,
        amount: p._sum.amount || 0
      }))
    }
  };
}
