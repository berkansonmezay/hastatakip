import { getPrescriptions, getPatientsForDropdown, getDoctorsForDropdown } from "./actions";
import PrescriptionList from "./PrescriptionList";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const prescriptions = await getPrescriptions(q);
  const patients = await getPatientsForDropdown();
  const doctors = await getDoctorsForDropdown();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reçete Sistemi</h1>
          <p className="text-slate-500 dark:text-slate-400">Hastalar için dijital reçeteler oluşturun ve geçmiş reçeteleri görüntüleyin.</p>
        </div>
      </div>

      <PrescriptionList 
        initialPrescriptions={prescriptions} 
        patients={patients} 
        doctors={doctors} 
      />
    </div>
  );
}
