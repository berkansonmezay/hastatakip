import { getNotifications } from "./actions";
import NotificationList from "./NotificationList";

export default async function NotificationsPage() {
  // Since we don't have auth context right now, we'll fetch all notifications
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bildirim Merkezi</h1>
          <p className="text-slate-500 dark:text-slate-400">Sistem uyarıları, randevu hatırlatmaları ve önemli güncellemeler.</p>
        </div>
      </div>

      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
