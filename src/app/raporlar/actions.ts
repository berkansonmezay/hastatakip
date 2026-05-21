"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function getReportStats() {
  const now = new Date();
  
  // This month limits
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  
  // Last month limits
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  // 1. Patient Stats
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

  // 2. Appointment Stats
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

  // 3. Financial Stats (Revenue & Expenses)
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

  // Expenses this month
  const expensesThisMonth = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });
  const expenseThisMonthVal = expensesThisMonth._sum.amount || 0;

  // Payments by Method
  const paymentsByType = await prisma.payment.groupBy({
    by: ['type'],
    _sum: { amount: true },
    where: { date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });

  // Payments by Category
  const paymentsByCategory = await prisma.payment.groupBy({
    by: ['category'],
    _sum: { amount: true },
    where: { date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });

  // Expenses by Category
  const expensesByCategory = await prisma.expense.groupBy({
    by: ['category'],
    _sum: { amount: true },
    where: { date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } }
  });

  // 4. Doctor Performance Report
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          appointments: true,
          examinations: true,
          surgeries: true
        }
      }
    }
  });

  const doctorPerformance = doctors.map(d => ({
    id: d.id,
    name: d.name || "İsimsiz Hekim",
    appointmentsCount: d._count.appointments,
    examinationsCount: d._count.examinations,
    surgeriesCount: d._count.surgeries
  }));

  // 5. Surgeries Report
  const totalSurgeries = await prisma.surgery.count();
  const completedSurgeries = await prisma.surgery.count({
    where: { status: "COMPLETED" }
  });
  
  // Surgeries by technique
  const surgeriesByTechnique = await prisma.surgery.groupBy({
    by: ['technique'],
    _count: { _all: true },
    where: { technique: { not: null } }
  });

  // Surgeries complication count
  const complicationCount = await prisma.surgery.count({
    where: {
      AND: [
        { complication: { not: null } },
        { complication: { not: "" } }
      ]
    }
  });

  // 6. Medication Usage Report
  const medicationsList = await prisma.patientMedication.groupBy({
    by: ['name'],
    _count: { _all: true },
    orderBy: {
      _count: {
        name: "desc"
      }
    },
    take: 8
  });

  const frequentMedications = medicationsList.map(m => ({
    name: m.name,
    count: m._count._all
  }));

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
      })),
      byCategory: paymentsByCategory.map((c: any) => ({
        category: c.category || "Diğer",
        amount: c._sum.amount || 0
      }))
    },
    expenses: {
      thisMonth: expenseThisMonthVal,
      byCategory: expensesByCategory.map((e: any) => ({
        category: e.category,
        amount: e._sum.amount || 0
      }))
    },
    doctorPerformance,
    surgeries: {
      total: totalSurgeries,
      completed: completedSurgeries,
      complications: complicationCount,
      byTechnique: surgeriesByTechnique.map((t: any) => ({
        technique: t.technique,
        count: t._count._all
      }))
    },
    frequentMedications
  };
}
