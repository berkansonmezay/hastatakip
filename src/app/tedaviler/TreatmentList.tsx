"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2,
  Edit2,
  Stethoscope,
  Activity,
  Clock,
  Banknote
} from "lucide-react";
import { createTreatment, deleteTreatment } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const treatmentSchema = z.object({
  name: z.string().min(2, "Tedavi adı en az 2 karakter olmalıdır."),
  category: z.string().optional(),
  cost: z.string().min(1, "Maliyet girilmelidir."),
  duration: z.string().optional(),
  description: z.string().optional(),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

export default function TreatmentList({ initialTreatments }: { initialTreatments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [treatments, setTreatments] = useState(initialTreatments);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      cost: "0",
      duration: "30"
    }
  });

  const onSubmit = async (data: TreatmentFormValues) => {
    try {
      const newTreatment = await createTreatment({
        ...data,
        cost: parseFloat(data.cost),
        duration: data.duration ? parseInt(data.duration) : undefined,
      });
      setTreatments([newTreatment, ...treatments]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Tedavi kaydedilirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu tedaviyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteTreatment(id);
        setTreatments(treatments.filter(t => t.id !== id));
      } catch (error) {
        alert("Tedavi silinemedi.");
      }
    }
  };

  const filteredTreatments = treatments.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tedavi adı veya kategori ile ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-blue-500/20 whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Yeni Tedavi Ekle
        </button>
      </div>

      {/* Treatments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Tedavi Adı / Kategori</th>
                <th className="px-6 py-4">Süre</th>
                <th className="px-6 py-4">Maliyet</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTreatments.map((treatment) => (
                <tr key={treatment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Activity size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{treatment.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {treatment.category || "Kategorisiz"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Clock size={16} className="text-slate-400" />
                      {treatment.duration ? `${treatment.duration} Dk` : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Banknote size={16} className="text-emerald-500" />
                      {treatment.cost} ₺
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(treatment.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTreatments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    {search ? "Arama kriterlerine uygun tedavi bulunamadı." : "Henüz kayıtlı tedavi bulunmuyor."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Treatment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Yeni Tedavi / İşlem Ekle</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tedavi Adı *</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register("name")}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Örn: Diş Çekimi"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
                <input 
                  {...register("category")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Örn: Cerrahi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ücret (₺) *</label>
                  <input 
                    type="number"
                    {...register("cost")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  {errors.cost && <p className="text-xs text-red-500">{errors.cost.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Süre (Dakika)</label>
                  <input 
                    type="number"
                    {...register("duration")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Açıklama</label>
                <textarea 
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Tedavi hakkında kısa notlar..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
