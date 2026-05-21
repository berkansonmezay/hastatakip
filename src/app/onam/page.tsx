import { getConsentForms } from "./actions";
import { prisma } from "@/lib/prisma";
import ConsentFormClient from "./ConsentFormClient";

export default async function OnamPage() {
  const forms = await getConsentForms();
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      fullName: true,
      protocolNo: true,
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent print:hidden">
          Dijital Onam Formları
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 print:hidden">
          Hastalara ait KVKK muvafakatnameleri, cerrahi onam formları ve diğer aydınlatılmış rıza belgelerini yönetin.
        </p>
      </div>

      <ConsentFormClient 
        initialForms={forms} 
        patients={patients} 
      />
    </div>
  );
}
