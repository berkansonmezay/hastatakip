import { getLabTests, getPatientsForDropdown, getDoctorsForDropdown } from "./actions";
import LabTestList from "./LabTestList";

export default async function LabTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const tests = await getLabTests(q);
  const patients = await getPatientsForDropdown();
  const doctors = await getDoctorsForDropdown();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tetkik Modülü</h1>
          <p className="text-slate-500 dark:text-slate-400">Laboratuvar ve radyoloji tetkiklerini isteyin ve sonuçlarını yönetin.</p>
        </div>
      </div>

      <LabTestList 
        initialTests={tests} 
        patients={patients} 
        doctors={doctors} 
      />
    </div>
  );
}
