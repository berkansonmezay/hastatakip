"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  Users as UsersIcon,
  History,
  ShieldAlert,
  Search,
  Filter,
  User,
  Shield,
  Activity,
  AlertCircle
} from "lucide-react";
import { useTheme } from "next-themes";
import { updateUserRole } from "./actions";
import { cn } from "@/lib/utils";

const roleTranslations: Record<string, string> = {
  ADMIN: "Yönetici (Admin)",
  DOCTOR: "Hekim (Doctor)",
  SECRETARY: "Sekreter (Secretary)",
  ACCOUNTING: "Muhasebe (Accounting)",
  LAB: "Laboratuvar (Lab)",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  DOCTOR: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
  SECRETARY: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  ACCOUNTING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  LAB: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
};

const actionTranslations: Record<string, string> = {
  CREATE: "Oluşturma",
  UPDATE: "Güncelleme",
  DELETE: "Silme",
  LOGIN: "Giriş",
  LOGOUT: "Çıkış",
};

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  DELETE: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  LOGIN: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  LOGOUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export default function SettingsView({
  initialUsers = [],
  initialLogs = [],
  currentUserRole = "SECRETARY"
}: {
  initialUsers: any[];
  initialLogs: any[];
  currentUserRole: string;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"general" | "roles" | "logs">("general");
  
  // General settings state
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [language, setLanguage] = useState("tr");

  // Role Management state
  const [users, setUsers] = useState(initialUsers);
  const [roleSearch, setRoleSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [roleMessage, setRoleMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Logs state
  const [logs, setLogs] = useState(initialLogs);
  const [logSearch, setLogSearch] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveGeneral = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 800);
  };

  const handleRoleChange = async (userId: string, newRole: any) => {
    if (currentUserRole !== "ADMIN") {
      setRoleMessage({ type: "error", text: "Bu işlemi gerçekleştirmek için ADMIN yetkiniz olmalıdır." });
      return;
    }

    try {
      setUpdatingUserId(userId);
      setRoleMessage(null);
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setRoleMessage({ type: "success", text: "Kullanıcı rolü başarıyla güncellendi." });
      
      // Refresh to fetch fresh logs if user navigates to logs tab later
      router.refresh();
    } catch (err: any) {
      setRoleMessage({ type: "error", text: err.message || "Bir hata oluştu." });
    } finally {
      setUpdatingUserId(null);
      setTimeout(() => setRoleMessage(null), 4000);
    }
  };

  // Filters
  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(roleSearch.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      (l.userName || "").toLowerCase().includes(logSearch.toLowerCase()) ||
      (l.entity || "").toLowerCase().includes(logSearch.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(logSearch.toLowerCase());
    
    const matchesAction = selectedActionFilter === "ALL" || l.action === selectedActionFilter;

    return matchesSearch && matchesAction;
  });

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("general")}
          className={cn(
            "px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2",
            activeTab === "general"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <SettingsIcon size={16} /> Genel Tercihler
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={cn(
            "px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2",
            activeTab === "roles"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Shield size={16} /> Rol & Yetki Yönetimi
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2",
            activeTab === "logs"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <History size={16} /> Sistem Günlükleri (Audit)
        </button>
      </div>

      {/* 1. GENERAL SETTINGS TAB */}
      {activeTab === "general" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <SettingsIcon className="text-blue-500" />
                Genel Ayarlar
              </h2>
              <p className="text-slate-500 text-sm mt-1">Sistem tercihlerini, görünümü ve bildirimleri yapılandırın.</p>
            </div>
            <button 
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 w-[140px] justify-center"
            >
              {isSaving ? (
                <span>Kaydediliyor...</span>
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
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                        theme === "light" 
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                          : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}
                    >
                      <Sun size={24} className="mb-2" />
                      <span className="text-sm font-medium">Açık</span>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                        theme === "dark" 
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                          : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}
                    >
                      <Moon size={24} className="mb-2" />
                      <span className="text-sm font-medium">Koyu</span>
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                        theme === "system" 
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                          : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}
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
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Uygulama İçi Bildirimler</div>
                    <div className="text-xs text-slate-400 mt-0.5">Randevu hatırlatmaları ve tetkik sonuçları</div>
                  </div>
                  <div 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      notificationsEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", notificationsEnabled ? "translate-x-6" : "")}></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">E-posta Özeti</div>
                    <div className="text-xs text-slate-400 mt-0.5">Günlük hasta ve gelir özetleri e-posta olarak gönderilsin</div>
                  </div>
                  <div 
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      emailAlerts ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", emailAlerts ? "translate-x-6" : "")}></div>
                  </div>
                </label>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                        <Database size={16} className="text-slate-400" /> Otomatik Yedekleme
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">Veritabanını her gün 00:00'da Google Drive yedekle</div>
                    </div>
                    <div 
                      onClick={() => setAutoBackup(!autoBackup)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        autoBackup ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", autoBackup ? "translate-x-6" : "")}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="md:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Sistem Sürümü</div>
                  <div className="text-sm text-slate-500">Hasta Takip Sistemi v1.0.0 (Son Sürüm)</div>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Güncellemeleri Kontrol Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ROLE & PERMISSION MANAGEMENT TAB */}
      {activeTab === "roles" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="text-blue-500" />
              Rol ve Yetki Yönetimi
            </h2>
            <p className="text-slate-500 text-sm mt-1">Sistemdeki personellerin yetki seviyelerini ayarlayın. Yalnızca Yöneticiler değişiklik yapabilir.</p>
          </div>

          {currentUserRole !== "ADMIN" && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Görüntüleme Modu</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                  Mevcut rolünüz ({roleTranslations[currentUserRole] || currentUserRole}) yetki değişikliği yapmanıza izin vermiyor. Rolleri değiştirmek için yönetici (ADMIN) yetkisi gerekmektedir.
                </p>
              </div>
            </div>
          )}

          {roleMessage && (
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3 border text-sm font-medium",
              roleMessage.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30" 
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/10 dark:text-red-400 dark:border-red-900/30"
            )}>
              <AlertCircle size={18} />
              {roleMessage.text}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya e-posta ara..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Kullanıcı Adı</th>
                    <th className="px-6 py-4">E-posta Adresi</th>
                    <th className="px-6 py-4">Kayıt Tarihi</th>
                    <th className="px-6 py-4">Mevcut Rol</th>
                    <th className="px-6 py-4 text-right">Rolü Güncelle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic text-xs">
                        Kullanıcı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {u.name || "İsimsiz Kullanıcı"}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString("tr-TR", { dateStyle: "medium" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                            roleColors[u.role] || "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {roleTranslations[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            disabled={currentUserRole !== "ADMIN" || updatingUserId === u.id}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50 font-bold"
                          >
                            <option value="ADMIN">ADMIN (Yönetici)</option>
                            <option value="DOCTOR">DOCTOR (Hekim)</option>
                            <option value="SECRETARY">SECRETARY (Sekreter)</option>
                            <option value="ACCOUNTING">ACCOUNTING (Muhasebe)</option>
                            <option value="LAB">LAB (Laboratuvar)</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT LOGS TAB */}
      {activeTab === "logs" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <History className="text-blue-500" />
                Sistem Günlükleri (Audit Log)
              </h2>
              <p className="text-slate-500 text-sm mt-1">Sistem üzerinde yapılan veri ekleme, silme, güncelleme ve kullanıcı oturum hareketlerini takip edin.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Toplam: {filteredLogs.length} Kayıt</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Log Search and Filter Options */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Kullanıcı adı, tablo veya detay ara..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Filter size={14} /> İşlem Türü:
                </label>
                <select
                  value={selectedActionFilter}
                  onChange={(e) => setSelectedActionFilter(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="ALL">Tüm İşlemler</option>
                  <option value="CREATE">CREATE (Oluşturma)</option>
                  <option value="UPDATE">UPDATE (Güncelleme)</option>
                  <option value="DELETE">DELETE (Silme)</option>
                  <option value="LOGIN">LOGIN (Giriş)</option>
                  <option value="LOGOUT">LOGOUT (Çıkış)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 w-1/12 text-center">İşlem</th>
                    <th className="px-6 py-4 w-2/12">Kullanıcı</th>
                    <th className="px-6 py-4 w-2/12">Tablo / Kayıt</th>
                    <th className="px-6 py-4 w-4/12">Değişiklik Detayları</th>
                    <th className="px-6 py-4 w-1.5/12">IP Adresi</th>
                    <th className="px-6 py-4 w-1.5/12 text-right">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic text-xs">
                        Audit kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-md",
                            actionColors[log.action] || "bg-slate-100 text-slate-600"
                          )}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {log.userName || "Sistem / Anonim"}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                          {log.entity} {log.entityId ? `(#${log.entityId.substring(0, 8)})` : ""}
                        </td>
                        <td className="px-6 py-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all line-clamp-2 hover:line-clamp-none transition-all">
                          {log.details || "-"}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 truncate">
                          {log.ipAddress || "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-400 font-bold whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("tr-TR", {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
