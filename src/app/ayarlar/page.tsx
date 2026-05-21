import { getSettingsData } from "./actions";
import SettingsView from "./SettingsView";

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
          <p className="text-slate-500 dark:text-slate-400">Uygulama tercihlerinizi, rol bazlı yetkilendirmeleri ve audit günlüklerini yönetin.</p>
        </div>
      </div>

      <SettingsView 
        initialUsers={data.users} 
        initialLogs={data.logs} 
        currentUserRole={data.currentUserRole} 
      />
    </div>
  );
}
