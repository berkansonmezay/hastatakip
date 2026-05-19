import { getExaminations } from "./actions";
import { prisma } from "@/lib/prisma";
import ExaminationList from "./ExaminationList";

export default async function ExaminationPage() {
  const examinations = await getExaminations();
  const patients = await prisma.patient.findMany({ select: { id: true, fullName: true } });
  const doctors = await prisma.user.findMany({ 
    where: { role: "DOCTOR" },
    select: { id: true, name: true } 
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Muayeneler</h1>
        <p className="text-slate-500 dark:text-slate-400">Hasta muayene kayıtlarını yönetin.</p>
      </div>

      <ExaminationList 
        initialExaminations={examinations} 
        patients={patients} 
        doctors={doctors}
      />
    </div>
  );
}
