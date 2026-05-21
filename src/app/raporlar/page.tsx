import { getReportStats } from "./actions";
import ReportsDashboard from "./ReportsDashboard";

export default async function ReportsPage() {
  const stats = await getReportStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Raporlama ve Analiz Sistemi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kliniğinizin genel performansını, doktor analizlerini, ameliyat vaka istatistiklerini ve finansal raporlarını izleyin.</p>
        </div>
      </div>

      <ReportsDashboard stats={stats} />
    </div>
  );
}
