import { getReportStats } from "./actions";
import ReportsDashboard from "./ReportsDashboard";

export default async function ReportsPage() {
  const stats = await getReportStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Raporlama Sistemi</h1>
          <p className="text-slate-500 dark:text-slate-400">Kliniğinizin genel durumunu, hasta istatistiklerini ve finansal verilerini analiz edin.</p>
        </div>
      </div>

      <ReportsDashboard stats={stats} />
    </div>
  );
}
