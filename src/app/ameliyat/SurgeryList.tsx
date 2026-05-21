"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Scissors, Calendar as CalendarIcon, User as UserIcon,
  Clock, ShieldAlert, FileText, CheckCircle2, XCircle, Trash2, Eye,
  SlidersHorizontal, Check, AlertCircle, Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createSurgery, updateSurgeryStatus, deleteSurgery } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const surgerySchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  name: z.string().min(1, "Operasyon adı gereklidir."),
  date: z.string().min(1, "Ameliyat tarihi gereklidir."),
  surgeonId: z.string().optional().or(z.literal("")),
  assistantTeam: z.string().optional().or(z.literal("")),
  technique: z.string().optional().or(z.literal("")),
  duration: z.coerce.number().optional(),
  anesthesiaType: z.string().optional().or(z.literal("")),
  operationNote: z.string().optional().or(z.literal("")),
  complication: z.string().optional().or(z.literal("")),
  status: z.string().default("PLANNED"),
});

type SurgeryFormValues = z.infer<typeof surgerySchema>;

const STATUS_LABELS: Record<string, string> = {
  PLANNED: "Planlandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi"
};

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/40",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40",
  CANCELLED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40"
};

export default function SurgeryList({ 
  initialSurgeries, 
  patients, 
  doctors 
}: { 
  initialSurgeries: any[], 
  patients: any[], 
  doctors: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [surgeries, setSurgeries] = useState(initialSurgeries);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<any>({
    resolver: zodResolver(surgerySchema),
    defaultValues: {
      status: "PLANNED"
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const newSurgery = await createSurgery(data);
      setSurgeries([newSurgery, ...surgeries]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Ameliyat notu kaydedilirken bir hata oluştu.");
    }
  };

  const handleStatusChange = async (id: string, status: string, patientId: string) => {
    try {
      await updateSurgeryStatus(id, status, patientId);
      setSurgeries(surgeries.map(s => s.id === id ? { ...s, status } : s));
      if (selectedSurgery?.id === id) {
        setSelectedSurgery({ ...selectedSurgery, status });
      }
    } catch (error) {
      alert("Durum güncellenirken hata oluştu.");
    }
  };

  const handleDelete = async (id: string, patientId: string) => {
    if (confirm("Bu ameliyat kaydını silmek istediğinize emin misiniz?")) {
      try {
        await deleteSurgery(id, patientId);
        setSurgeries(surgeries.filter(s => s.id !== id));
        setSelectedSurgery(null);
      } catch (error) {
        alert("Silme işlemi sırasında bir hata oluştu.");
      }
    }
  };

  const filteredSurgeries = surgeries.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.surgeon?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.technique?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: surgeries.length,
    planned: surgeries.filter(s => s.status === "PLANNED").length,
    completed: surgeries.filter(s => s.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Operasyon</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 text-slate-500 rounded-xl">
            <Scissors size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planlanan</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.planned}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-905/20 text-blue-500 rounded-xl">
            <CalendarIcon size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tamamlanan</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Ameliyat, hasta veya cerrah ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PLANNED", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                statusFilter === status 
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100" 
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              {status === "ALL" ? "Tümü" : STATUS_LABELS[status] || status}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-xs shadow-md shadow-blue-500/20 whitespace-nowrap"
          >
            <Plus size={16} /> Yeni Ameliyat Notu
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurgeries.map((surgery) => (
          <div 
            key={surgery.id} 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", STATUS_COLORS[surgery.status] || "")}>
                    {STATUS_LABELS[surgery.status] || surgery.status}
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mt-2 line-clamp-1">{surgery.name}</h3>
                </div>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
                  <Scissors size={18} />
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <UserIcon size={14} className="text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Hasta: {surgery.patient?.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-slate-400" />
                  <span>Tarih: {surgery.date ? format(new Date(surgery.date), "dd MMM yyyy", { locale: tr }) : "—"}</span>
                </div>
                {surgery.surgeon && (
                  <div className="flex items-center gap-2">
                    <UserIcon size={14} className="text-blue-500" />
                    <span>Cerrah: Dr. {surgery.surgeon.name}</span>
                  </div>
                )}
                {surgery.duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>Süre: {surgery.duration} dk</span>
                  </div>
                )}
              </div>

              {surgery.operationNote && (
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Epicrisis Özet</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                    {surgery.operationNote}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex gap-1.5">
                {surgery.status === "PLANNED" && (
                  <button 
                    onClick={() => handleStatusChange(surgery.id, "COMPLETED", surgery.patientId)}
                    className="p-1 px-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <Check size={10} /> Tamamlandı Yap
                  </button>
                )}
              </div>
              <button 
                onClick={() => setSelectedSurgery(surgery)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Eye size={14} /> Epicrisis Gör
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSurgeries.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Scissors size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Kayıtlı ameliyat notu bulunamadı.</p>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
              <h2 className="text-lg font-bold">Yeni Ameliyat & Epicrisis Notu</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={20} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Hasta Seçin *</label>
                  <select {...register("patientId")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Seçiniz</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                  </select>
                  {errors.patientId && <p className="text-xs text-red-500">{(errors.patientId as any).message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Sorumlu Cerrah</label>
                  <select {...register("surgeonId")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Seçiniz</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Operasyon / Ameliyat Adı *</label>
                  <input {...register("name")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ör. Laparoskopik Kolesistektomi" />
                  {errors.name && <p className="text-xs text-red-500">{(errors.name as any).message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Ameliyat Tarihi *</label>
                  <input type="date" {...register("date")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.date && <p className="text-xs text-red-500">{(errors.date as any).message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Kullanılan Teknik / Yöntem</label>
                  <input {...register("technique")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ör. 4 portlu giriş, diseksiyon..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Anestezi Türü</label>
                  <select {...register("anesthesiaType")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Seçiniz</option>
                    <option value="GENEL">Genel Anestezi</option>
                    <option value="SPINAL">Spinal Anestezi</option>
                    <option value="EPIDURAL">Epidural Anestezi</option>
                    <option value="LOKAL">Lokal Anestezi</option>
                    <option value="SEDASTON">Sedasyon</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Süre (Dakika)</label>
                  <input type="number" {...register("duration")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ör. 90" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Asistan Ekip</label>
                  <input {...register("assistantTeam")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ör. Dr. Canan B., Hemşire Murat Y." />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Ameliyat Notu / Epicrisis Detayları</label>
                  <textarea {...register("operationNote")} rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono" placeholder="Bulgular, rezeksiyon detayları, kullanılan drenler..." />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Gelişen Komplikasyonlar (Varsa)</label>
                  <input {...register("complication")} className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-red-600 dark:text-red-400 placeholder:text-red-300" placeholder="E.g., Aşırı kanama, dren sızıntısı yok..." />
                </div>
              </div>

              {/* Action buttons inside form */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Drawer Modal */}
      {selectedSurgery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
                  <Scissors size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedSurgery.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Hasta: {selectedSurgery.patient?.fullName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSurgery(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={20} /></button>
            </div>

            {/* Details Panel */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Main surgical metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tarih</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedSurgery.date ? format(new Date(selectedSurgery.date), "dd MMMM yyyy", { locale: tr }) : "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Durum</span>
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold border block w-fit mt-0.5", STATUS_COLORS[selectedSurgery.status] || "")}>
                    {STATUS_LABELS[selectedSurgery.status] || selectedSurgery.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anestezi</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedSurgery.anesthesiaType || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Süre</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedSurgery.duration ? `${selectedSurgery.duration} Dakika` : "—"}</span>
                </div>
              </div>

              {/* Surgeon & Assistant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sorumlu Cerrah</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {selectedSurgery.surgeon ? `Dr. ${selectedSurgery.surgeon.name}` : "Hekim Belirtilmemiş"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asistan Ekip / Personel</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {selectedSurgery.assistantTeam || "Ekip Belirtilmemiş"}
                  </p>
                </div>
              </div>

              {/* Technique */}
              {selectedSurgery.technique && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cerrahi Teknik</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                      {selectedSurgery.technique}
                    </p>
                  </div>
                </div>
              )}

              {/* Operation Note / Epicrisis */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detaylı Ameliyat Notu & Epicrisis</h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                    {selectedSurgery.operationNote || "Ameliyat notu girilmemiş."}
                  </p>
                </div>
              </div>

              {/* Complications */}
              {selectedSurgery.complication && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert size={14} /> Gelişen Komplikasyonlar
                  </h4>
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-200 dark:border-red-900/30">
                    <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                      {selectedSurgery.complication}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center flex-shrink-0">
              <button 
                onClick={() => handleDelete(selectedSurgery.id, selectedSurgery.patientId)}
                className="flex items-center gap-1.5 p-2 px-3 text-xs font-bold rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 size={14} /> Kaydı Sil
              </button>
              
              <div className="flex gap-2">
                {selectedSurgery.status === "PLANNED" && (
                  <button 
                    onClick={() => handleStatusChange(selectedSurgery.id, "COMPLETED", selectedSurgery.patientId)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center gap-1"
                  >
                    <Check size={14} /> Tamamlandı Olarak İşaretle
                  </button>
                )}
                <button 
                  onClick={() => setSelectedSurgery(null)}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
