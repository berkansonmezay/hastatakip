import { getSurgeries } from "./actions";
import { prisma } from "@/lib/prisma";
import SurgeryList from "./SurgeryList";

export default async function SurgeryPage() {
  const surgeries = await getSurgeries();
  const patients = await prisma.patient.findMany({ 
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" }
  });
  const doctors = await prisma.user.findMany({ 
    where: { role: "DOCTOR" },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ameliyatlar & Epicrisis</h1>
        <p className="text-slate-500 dark:text-slate-400">Planlanan ve tamamlanan operasyonları, cerrahi teknikleri ve ameliyat notlarını yönetin.</p>
      </div>

      <SurgeryList 
        initialSurgeries={surgeries} 
        patients={patients} 
        doctors={doctors}
      />
    </div>
  );
}
