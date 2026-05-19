import SettingsView from "./SettingsView";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
          <p className="text-slate-500 dark:text-slate-400">Uygulama tercihlerinizi ve yapılandırmaları yönetin.</p>
        </div>
      </div>

      <SettingsView />
    </div>
  );
}
