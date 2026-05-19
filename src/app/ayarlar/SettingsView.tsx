"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  BellRing,
  Globe,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2
} from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsView() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [language, setLanguage] = useState("tr");

  // Prevent hydration mismatch for next-themes
  useEffect(() => setMounted(true), []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="text-blue-500" />
            Genel Ayarlar
          </h2>
          <p className="text-slate-500 text-sm mt-1">Sistem tercihlerini, görünümü ve bildirimleri yapılandırın.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 w-[140px] justify-center"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">Kaydediliyor...</span>
          ) : showSaved ? (
            <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Kaydedildi</span>
          ) : (
            <span className="flex items-center gap-2"><Save size={18} /> Kaydet</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Appearance Settings */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
            <Monitor size={20} className="text-slate-400" />
            Görünüm ve Tema
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tema Tercihi</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    theme === "light" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" 
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Sun size={24} className="mb-2" />
                  <span className="text-sm font-medium">Açık</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    theme === "dark" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" 
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Moon size={24} className="mb-2" />
                  <span className="text-sm font-medium">Koyu</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    theme === "system" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" 
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Monitor size={24} className="mb-2" />
                  <span className="text-sm font-medium">Sistem</span>
                </button>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Globe size={18} className="text-slate-400" /> Dil Seçeneği
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & System */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
            <BellRing size={20} className="text-slate-400" />
            Bildirimler ve Sistem
          </h3>
          
          <div className="space-y-6">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Uygulama İçi Bildirimler</div>
                <div className="text-sm text-slate-500">Randevu hatırlatmaları ve tetkik sonuçları</div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationsEnabled ? 'translate-x-6' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">E-posta Özeti</div>
                <div className="text-sm text-slate-500">Günlük hasta ve gelir özetleri e-posta olarak gelsin</div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={() => setEmailAlerts(!emailAlerts)}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${emailAlerts ? 'translate-x-6' : ''}`}></div>
              </div>
            </label>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Database size={16} className="text-slate-400" /> Otomatik Yedekleme
                  </div>
                  <div className="text-sm text-slate-500">Veritabanını her gün 00:00'da yedekle</div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${autoBackup ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={() => setAutoBackup(!autoBackup)}>
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${autoBackup ? 'translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Security / System Info */}
        <div className="md:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Sistem Sürümü</div>
              <div className="text-sm text-slate-500">Hasta Takip Sistemi v1.0.0 (Güncel)</div>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            Güncellemeleri Kontrol Et
          </button>
        </div>

      </div>
    </div>
  );
}
