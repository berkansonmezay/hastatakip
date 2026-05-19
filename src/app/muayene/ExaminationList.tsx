"use client";

import React, { useState } from "react";
import { Plus, Search, Stethoscope, FileText, Calendar as CalendarIcon, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createExamination } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const examinationSchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  doctorId: z.string().min(1, "Doktor seçilmelidir."),
  complaint: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

type ExaminationFormValues = z.infer<typeof examinationSchema>;

export default function ExaminationList({ 
  initialExaminations, 
  patients, 
  doctors 
}: { 
  initialExaminations: any[], 
  patients: any[], 
  doctors: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [examinations, setExaminations] = useState(initialExaminations);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationSchema),
  });

  const onSubmit = async (data: ExaminationFormValues) => {
    try {
      const newExam = await createExamination(data);
      setExaminations([newExam, ...examinations]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Muayene kaydedilirken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-64 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Hasta veya teşhis ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-blue-500/20"
        >
          <Plus size={20} />
          Yeni Muayene
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examinations.map((exam) => (
          <div key={exam.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                  <UserIcon size={20} />
                </div>
                <div>
                  <div className="font-bold">{exam.patient?.fullName || "Bilinmiyor"}</div>
                  <div className="text-xs text-slate-500">{format(new Date(exam.createdAt), "dd MMM yyyy HH:mm", { locale: tr })}</div>
                </div>
              </div>
              <div className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <Stethoscope size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teşhis</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                {exam.diagnosis || "Belirtilmemiş"}
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Şikayet</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 italic">
                "{exam.complaint || "Belirtilmemiş"}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
              <div className="text-xs text-slate-500">Dr. {exam.doctor?.name || "Bilinmiyor"}</div>
              <button className="text-blue-600 hover:underline text-sm font-medium">Detayları Gör</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Yeni Muayene Kaydı</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus size={24} className="rotate-45" /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hasta *</label>
                  <select {...register("patientId")} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950">
                    <option value="">Seçiniz</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Doktor *</label>
                  <select {...register("doctorId")} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950">
                    <option value="">Seçiniz</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Şikayet</label>
                <textarea {...register("complaint")} rows={2} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950 resize-none" placeholder="Hastanın şikayetlerini giriniz..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teşhis</label>
                <input {...register("diagnosis")} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950" placeholder="Teşhis giriniz..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tedavi Planı</label>
                <textarea {...register("treatment")} rows={3} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950 resize-none" placeholder="Tedavi planını giriniz..." />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400">İptal</button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-2 rounded-lg font-medium bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                  {isSubmitting ? "Kaydediliyor..." : "Muayeneyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
