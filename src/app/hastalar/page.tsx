import { getPatients } from "./actions";
import PatientList from "./PatientList";
import { Plus } from "lucide-react";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const patients = await getPatients(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hastalar</h1>
          <p className="text-slate-500 dark:text-slate-400">Kayıtlı tüm hastaları yönetin ve yenilerini ekleyin.</p>
        </div>
      </div>

      <PatientList initialPatients={patients} />
    </div>
  );
}
