"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createPatient, deletePatient } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const patientSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  tcNo: z.string().length(11, "TC Kimlik No 11 hane olmalıdır.").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta giriniz.").optional().or(z.literal("")),
  address: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  bloodGroup: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientList({ initialPatients }: { initialPatients: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState(initialPatients);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientFormValues) => {
    try {
      const newPatient = await createPatient(data);
      setPatients([newPatient, ...patients]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Hasta kaydedilirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu hastayı silmek istediğinize emin misiniz?")) {
      await deletePatient(id);
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.tcNo?.includes(search) ||
    p.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Hasta adı, TC veya telefon ile ara..." 
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
          Yeni Hasta Ekle
        </button>
      </div>

      {/* Patient Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Hasta Bilgileri</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {patient.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{patient.fullName}</div>
                        <div className="text-xs text-slate-500">TC: {patient.tcNo || "Belirtilmemiş"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Phone size={14} className="text-slate-400" />
                        {patient.phone || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Mail size={14} className="text-slate-400" />
                        {patient.email || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarIcon size={14} />
                      {format(new Date(patient.createdAt), "dd MMM yyyy", { locale: tr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    {search ? "Arama kriterlerine uygun hasta bulunamadı." : "Henüz kayıtlı hasta bulunmuyor."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Yeni Hasta Kaydı</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ad Soyad *</label>
                <input 
                  {...register("fullName")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Ahmet Yılmaz"
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">TC Kimlik No</label>
                <input 
                  {...register("tcNo")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="12345678901"
                />
                {errors.tcNo && <p className="text-xs text-red-500">{errors.tcNo.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
                <input 
                  {...register("phone")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta</label>
                <input 
                  {...register("email")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="ornek@mail.com"
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doğum Tarihi</label>
                <input 
                  type="date"
                  {...register("birthDate")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kan Grubu</label>
                <select 
                  {...register("bloodGroup")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Seçiniz</option>
                  <option value="A+">A Rh+</option>
                  <option value="A-">A Rh-</option>
                  <option value="B+">B Rh+</option>
                  <option value="B-">B Rh-</option>
                  <option value="AB+">AB Rh+</option>
                  <option value="AB-">AB Rh-</option>
                  <option value="0+">0 Rh+</option>
                  <option value="0-">0 Rh-</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Adres</label>
                <textarea 
                  {...register("address")}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Açık adres giriniz..."
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
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
