import { getFiles } from "./actions";
import { prisma } from "@/lib/prisma";
import FileList from "./FileList";

export default async function DosyalarPage() {
  const files = await getFiles();
  const patients = await prisma.patient.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Dosya Arşivi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Hastaların laboratuvar sonuçlarını, röntgen, MR/Tomografi dosyalarını ve klinik fotoğraflarını yönetin.</p>
        </div>
      </div>

      <FileList 
        initialFiles={files} 
        patients={patients} 
      />
    </div>
  );
}
