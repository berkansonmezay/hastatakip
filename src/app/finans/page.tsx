import { getPayments } from "./actions";
import { prisma } from "@/lib/prisma";
import PaymentList from "./PaymentList";

export default async function FinancePage() {
  const payments = await getPayments();
  const patients = await prisma.patient.findMany({ select: { id: true, fullName: true } });
  
  const totalIncome = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finans Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400">Tahsilatları ve gelirleri takip edin.</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Toplam Gelir</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">₺{totalIncome.toLocaleString()}</div>
        </div>
      </div>

      <PaymentList initialPayments={payments} patients={patients} />
    </div>
  );
}
