import { getPayments, getExpenses } from "./actions";
import { prisma } from "@/lib/prisma";
import FinanceDashboard from "./FinanceDashboard";

export default async function FinancePage() {
  const payments = await getPayments();
  const expenses = await getExpenses();
  const patients = await prisma.patient.findMany({ 
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finans Yönetimi</h1>
        <p className="text-slate-500 dark:text-slate-400">Klinik tahsilatlarını (gelir) ve harcamalarını (gider) analiz edin.</p>
      </div>

      <FinanceDashboard 
        payments={payments} 
        expenses={expenses} 
        patients={patients} 
      />
    </div>
  );
}
