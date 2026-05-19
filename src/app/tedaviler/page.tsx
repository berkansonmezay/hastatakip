import { getTreatments } from "./actions";
import TreatmentList from "./TreatmentList";

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const treatments = await getTreatments(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tedavi ve İşlem Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400">Klinikte uygulanan tedavileri ve fiyatlandırmaları yönetin.</p>
        </div>
      </div>

      <TreatmentList initialTreatments={treatments} />
    </div>
  );
}
