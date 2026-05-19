import { getUsers } from "./actions";
import PersonnelList from "./PersonnelList";

export default async function PersonnelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await getUsers(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personel Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400">Hastanede çalışan doktor, sekreter ve diğer personelleri yönetin.</p>
        </div>
      </div>

      <PersonnelList initialUsers={users} />
    </div>
  );
}
