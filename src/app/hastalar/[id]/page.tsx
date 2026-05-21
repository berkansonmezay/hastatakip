import { getPatientById } from "./actions";
import { notFound } from "next/navigation";
import PatientDetail from "./PatientDetail";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  return <PatientDetail patient={patient} />;
}
