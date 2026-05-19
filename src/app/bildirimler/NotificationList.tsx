"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck,
  Trash2,
  CalendarClock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { markAsRead, markAllAsRead, deleteNotification } from "./actions";

export default function NotificationList({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu bildirimi silmek istediğinize emin misiniz?")) {
      try {
        await deleteNotification(id);
        setNotifications(notifications.filter(n => n.id !== id));
      } catch (error) {
        alert("Bildirim silinemedi.");
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 relative">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Gelen Bildirimler</h2>
            <p className="text-sm text-slate-500">{unreadCount} okunmamış bildiriminiz var.</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <CheckCheck size={16} />
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Bell size={28} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Bildirim Yok</h3>
            <p className="text-slate-500">Şu anda gösterilecek herhangi bir bildiriminiz bulunmuyor.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-xl border transition-all flex gap-4 ${
                notification.isRead 
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm opacity-70" 
                  : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-md relative overflow-hidden"
              }`}
            >
              {!notification.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              )}
              
              <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center mt-1 ${
                notification.isRead ? "bg-slate-100 dark:bg-slate-800 text-slate-500" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
              }`}>
                <Bell size={18} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className={`font-semibold ${notification.isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm mt-1 ${notification.isRead ? "text-slate-500" : "text-slate-600 dark:text-slate-300"}`}>
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Okundu olarak işaretle"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Bildirimi sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock size={14} />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr })}
                  </div>
                  {notification.user && (
                    <div className="flex items-center gap-1.5">
                      <span>•</span>
                      <span>İlgili Kullanıcı: {notification.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
