import { getAppointments } from "./actions";
import { prisma } from "@/lib/prisma";
import AppointmentCalendar from "./AppointmentCalendar";

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const patients = await prisma.patient.findMany({ select: { id: true, fullName: true } });
  const doctors = await prisma.user.findMany({ 
    where: { role: "DOCTOR" },
    select: { id: true, name: true } 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Randevular</h1>
          <p className="text-slate-500 dark:text-slate-400">Takvim üzerinden randevuları planlayın ve takip edin.</p>
        </div>
      </div>

      <AppointmentCalendar 
        initialAppointments={appointments} 
        patients={patients} 
        doctors={doctors}
      />
    </div>
  );
}
