import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  // 1. Stats Queries
  const totalPatients = await prisma.patient.count();
  
  const pendingAppointmentsCount = await prisma.appointment.count({
    where: { status: "PENDING" },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dailyEarningsResult = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });
  const earningsToday = dailyEarningsResult._sum.amount || 0;

  const activeExaminationsCount = await prisma.examination.count({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  // 2. Patients Details Query (for Patient Summary Table)
  const patients = await prisma.patient.findMany({
    include: {
      allergies: true,
      medications: true,
      surgeries: {
        include: {
          surgeon: {
            select: { name: true }
          }
        },
        orderBy: { date: "desc" },
        take: 1
      },
      followUps: {
        include: {
          doctor: {
            select: { name: true }
          }
        },
        orderBy: { date: "desc" },
        take: 1
      },
      examinations: {
        include: { 
          doctor: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 1
      },
      appointments: {
        include: {
          doctor: {
            select: { id: true, name: true }
          }
        },
        orderBy: { dateTime: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Doctors Query (for filters)
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: { id: true, name: true }
  });

  // 4. Upcoming Controls Query (next controls)
  const now = new Date();
  const upcomingControls = await prisma.followUp.findMany({
    where: {
      date: {
        gte: now
      }
    },
    include: {
      patient: {
        select: { id: true, fullName: true }
      },
      doctor: {
        select: { name: true }
      }
    },
    orderBy: {
      date: "asc"
    },
    take: 5
  });

  // 5. Today's Appointments List
  const dailyAppointments = await prisma.appointment.findMany({
    where: {
      dateTime: {
        gte: startOfToday,
        lte: endOfToday
      }
    },
    include: {
      patient: {
        select: { id: true, fullName: true }
      },
      doctor: {
        select: { name: true }
      }
    },
    orderBy: {
      dateTime: "asc"
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Klinik Yönetim Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kliniğinizin genel durumunu ve hasta süreçlerini anlık olarak takip edin.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hastalar" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 text-xs">
            <Plus size={18} />
            Yeni Hasta Kaydı
          </Link>
        </div>
      </div>

      {/* Main Dashboard Client Component */}
      <DashboardClient 
        stats={{
          totalPatients,
          pendingAppointmentsCount,
          earningsToday,
          activeExaminationsCount
        }}
        patients={patients}
        doctors={doctors}
        upcomingControls={upcomingControls}
        dailyAppointments={dailyAppointments}
      />
    </div>
  );
}
