"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Stethoscope, FileText, Calendar as CalendarIcon, 
  User as UserIcon, AlertCircle, Sparkles, BookOpen, Clock, HeartPulse,
  Eye, X, CheckCircle, ChevronDown, Activity, Settings
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createExamination } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const EXAM_TEMPLATES = [
  {
    id: "genel_cerrahi",
    label: "Genel Cerrahi",
    preset: "BATIN: Batın rahat, defans ve rebound saptanmadı. Organomegali yok. Herni muayenesi doğal.\nSİSTEMİK: Diğer sistem muayeneleri olağan. Operasyon skarı gözlenmedi."
  },
  {
    id: "kardiyoloji",
    label: "Kardiyoloji",
    preset: "KVS: S1, S2 ritmik, ek ses veya üfürüm saptanmadı. Periferik nabazanlar bilateral açık.\nEFOR/EKG: Normal sinüs ritmi, iskemi bulgusu saptanmadı. Kan basıncı: 120/80 mmHg."
  },
  {
    id: "kbb",
    label: "Kulak Burun Boğaz (KBB)",
    preset: "KULAK: Bilateral dış kulak yolu açık, kulak zarları doğal ve intakt.\nBURUN: Septum deviasyonu saptanmadı, konkalar hipertrofik değil.\nBOĞAZ: Tonsiller normal büyüklükte, orofarenks doğal."
  },
  {
    id: "ortopedi",
    label: "Ortopedi",
    preset: "LOKOMOTOR SİSTEM: Eklem hareket açıklığı (ROM) tüm yönlerde tam ve ağrısız. Deformite saptanmadı. Kas gücü 5/5. Nörovasküler defisit yok."
  },
  {
    id: "dahiliye",
    label: "Dahiliye / İç Hastalıkları",
    preset: "SOLUNUM: Bilateral solunum sesleri doğal, ral veya ronküs işitilmedi.\nKVS: Ritmik, ek ses yok.\nBATIN: Hassasiyet, defans, rebound yok.\nEKSTREMİTE: Pretibial ödem saptanmadı."
  },
  {
    id: "plastik_cerrahi",
    label: "Plastik Cerrahi",
    preset: "LOKAL BULGULAR: Cilt ve cilt altı doku muayenesi doğal. Asimetri saptanmadı. Skar dokusu matür ve olağan görünümlü. Dolaşım ve duyu kusuru yok."
  }
];

const examinationSchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  doctorId: z.string().min(1, "Doktor seçilmelidir."),
  complaint: z.string().optional(),
  complaintHistory: z.string().optional(),
  physicalExam: z.string().optional(),
  examTemplate: z.string().optional(),
  diagnosis: z.string().optional(),
  preliminaryDiag: z.string().optional(),
  finalDiagnosis: z.string().optional(),
  icd10Code: z.string().optional(),
  treatment: z.string().optional(),
  treatmentPlan: z.string().optional(),
  dietAdvice: z.string().optional(),
  lifestyleAdvice: z.string().optional(),
  controlPlan: z.string().optional(),
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
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [examinations, setExaminations] = useState(initialExaminations);
  const [modalStep, setModalStep] = useState(1);

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting, errors } } = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationSchema),
    defaultValues: {
      examTemplate: "",
      physicalExam: ""
    }
  });

  const selectedTemplate = watch("examTemplate");

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setValue("examTemplate", templateId);
    if (templateId) {
      const selected = EXAM_TEMPLATES.find(t => t.id === templateId);
      if (selected) {
        setValue("physicalExam", selected.preset);
      }
    } else {
      setValue("physicalExam", "");
    }
  };

  const onSubmit = async (data: ExaminationFormValues) => {
    try {
      const newExam = await createExamination(data);
      setExaminations([newExam, ...examinations]);
      setIsModalOpen(false);
      reset();
      setModalStep(1);
    } catch (error) {
      console.error("Hata:", error);
      alert("Muayene kaydedilirken bir hata oluştu.");
    }
  };

  const filteredExaminations = examinations.filter((exam) => {
    const query = search.toLowerCase();
    return (
      exam.patient?.fullName?.toLowerCase().includes(query) ||
      exam.diagnosis?.toLowerCase().includes(query) ||
      exam.finalDiagnosis?.toLowerCase().includes(query) ||
      exam.doctor?.name?.toLowerCase().includes(query) ||
      exam.icd10Code?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Hasta adı, teşhis veya ICD-10 ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm focus:outline-none"
          />
        </div>
        <button 
          onClick={() => {
            reset();
            setModalStep(1);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md shadow-blue-500/20 text-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Yeni Muayene Ekle
        </button>
      </div>

      {/* Grid of Examinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExaminations.map((exam) => (
          <div 
            key={exam.id} 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                  {exam.patient?.fullName?.charAt(0) || "H"}
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base line-clamp-1">{exam.patient?.fullName || "Bilinmiyor"}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {format(new Date(exam.createdAt), "dd MMM yyyy HH:mm", { locale: tr })}
                  </div>
                </div>
              </div>
              <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Stethoscope size={18} />
              </span>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Şikayet</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                  "{exam.complaint || "Belirtilmemiş"}"
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanı & Teşhis</span>
                <div className="flex flex-wrap gap-1.5">
                  {exam.finalDiagnosis ? (
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold">
                      Kesin: {exam.finalDiagnosis}
                    </span>
                  ) : exam.preliminaryDiag ? (
                    <span className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 px-2 py-0.5 rounded text-xs font-semibold">
                      Ön: {exam.preliminaryDiag}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Girilmemiş</span>
                  )}
                  {exam.icd10Code && (
                    <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-mono font-bold">
                      {exam.icd10Code}
                    </span>
                  )}
                </div>
              </div>

              {exam.examTemplate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <HeartPulse size={12} className="text-blue-500" />
                  <span>Şablon: <span className="font-semibold">{EXAM_TEMPLATES.find(t => t.id === exam.examTemplate)?.label || exam.examTemplate}</span></span>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs text-slate-500 font-medium">Dr. {exam.doctor?.name || "Bilinmiyor"}</span>
              <button 
                onClick={() => setSelectedExam(exam)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Eye size={14} /> Detayları Gör
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExaminations.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Stethoscope size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Kayıtlı muayene bulunamadı.</p>
        </div>
      )}

      {/* Creation Multi-step Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold">Yeni Muayene Kaydı</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn("w-2 h-2 rounded-full", modalStep >= 1 ? "bg-blue-600" : "bg-slate-300")} />
                  <span className={cn("w-2 h-2 rounded-full", modalStep >= 2 ? "bg-blue-600" : "bg-slate-300")} />
                  <span className={cn("w-2 h-2 rounded-full", modalStep >= 3 ? "bg-blue-600" : "bg-slate-300")} />
                  <span className="text-xs text-slate-400 ml-1">Adım {modalStep} / 3</span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* STEP 1: Temel Bilgiler */}
              {modalStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2"><BookOpen size={16} /> Adım 1: Genel Muayene Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Hasta Seçin *</label>
                      <select {...register("patientId")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Seçiniz</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                      </select>
                      {errors.patientId && <p className="text-xs text-red-500">{errors.patientId.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Sorumlu Hekim *</label>
                      <select {...register("doctorId")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Seçiniz</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                      </select>
                      {errors.doctorId && <p className="text-xs text-red-500">{errors.doctorId.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Ana Şikayet</label>
                    <textarea {...register("complaint")} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Hastanın başvuru sebebi..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Hikayesi / Anamnez</label>
                    <textarea {...register("complaintHistory")} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Şikayetin başlangıcı, seyri ve diğer detaylar..." />
                  </div>
                </div>
              )}

              {/* STEP 2: Fizik Muayene & Şablonlar */}
              {modalStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2"><HeartPulse size={16} /> Adım 2: Fizik Muayene Bulguları</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Fizik Muayene Şablonu</label>
                    <select value={selectedTemplate} onChange={handleTemplateChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <option value="">Serbest Metin Gir / Şablon Seçme</option>
                      {EXAM_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-500">Fizik Muayene Detayları</label>
                      {selectedTemplate && (
                        <span className="text-[10px] text-blue-500 flex items-center gap-1 font-semibold">
                          <Sparkles size={12} /> Şablon uygulandı
                        </span>
                      )}
                    </div>
                    <textarea {...register("physicalExam")} rows={6} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                  </div>
                </div>
              )}

              {/* STEP 3: Tanı, Tedavi ve Takip */}
              {modalStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2"><Activity size={16} /> Adım 3: Tanı, Reçete ve Takip</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Ön Tanı</label>
                      <input {...register("preliminaryDiag")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Şüpheli / ön tanı..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Kesin Tanı (Ana Teşhis)</label>
                      <input {...register("finalDiagnosis")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Kesinleşen teşhis..." />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500">ICD-10 Tanı Kodu</label>
                      <input {...register("icd10Code")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-bold" placeholder="E.g., I10 (Esansiyel Hipertansiyon)" />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500">Tedavi Planı (Medikal, Cerrahi, Reçete vb.)</label>
                      <textarea {...register("treatmentPlan")} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Uygulanacak tedavi protokolü..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Diyet Önerileri</label>
                      <input {...register("dietAdvice")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Diyet, tuz kısıtlaması, kalori kısıtı vb..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Yaşam Tarzı / Egzersiz</label>
                      <input {...register("lifestyleAdvice")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Egzersiz, sigarayı bırakma tavsiyeleri vb..." />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500">Kontrol ve İzlem Planı</label>
                      <input {...register("controlPlan")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ör. 1 hafta sonra dikiş alımı veya kontrol..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons inside form */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 flex-shrink-0">
                {modalStep > 1 ? (
                  <button 
                    type="button" 
                    onClick={() => setModalStep(modalStep - 1)}
                    className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Geri
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    İptal
                  </button>
                  {modalStep < 3 ? (
                    <button 
                      type="button" 
                      onClick={() => setModalStep(modalStep + 1)}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                    >
                      İleri
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-8 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? "Kaydediliyor..." : "Muayeneyi Tamamla"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal/Drawer */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedExam.patient?.fullName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Muayene Tarihi: {format(new Date(selectedExam.createdAt), "dd MMMM yyyy HH:mm", { locale: tr })}</p>
                </div>
              </div>
              <button onClick={() => setSelectedExam(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>

            {/* Details Panel */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Section 1: Anamnez */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Şikayet ve Öykü (Anamnez)</h4>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800/60">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ana Şikayet:</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{selectedExam.complaint || "Belirtilmemiş"}"</p>
                  
                  {selectedExam.complaintHistory && (
                    <>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3">Öykü:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{selectedExam.complaintHistory}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Section 2: Fizik Muayene */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Fizik Muayene</h4>
                  {selectedExam.examTemplate && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded font-bold">
                      Şablon: {EXAM_TEMPLATES.find(t => t.id === selectedExam.examTemplate)?.label || selectedExam.examTemplate}
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <p className="text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedExam.physicalExam || "Fizik muayene bulgusu girilmemiş."}
                  </p>
                </div>
              </div>

              {/* Section 3: Teşhis */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Tanı ve Teşhis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedExam.preliminaryDiag && (
                    <div className="p-3 bg-yellow-50/50 dark:bg-yellow-950/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                      <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">Ön Tanı</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{selectedExam.preliminaryDiag}</p>
                    </div>
                  )}
                  {selectedExam.finalDiagnosis && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Kesin Tanı</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{selectedExam.finalDiagnosis}</p>
                    </div>
                  )}
                  {selectedExam.icd10Code && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 md:col-span-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">ICD-10 Kodu</p>
                        <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">{selectedExam.icd10Code}</p>
                      </div>
                      <span className="p-1 px-2.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-xs font-bold rounded">
                        Uluslararası Hastalık Sınıflandırması
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Tedavi ve Plan */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Tedavi ve İzlem Planı</h4>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-3">
                  {selectedExam.treatmentPlan && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Tedavi Protokolü / Planı:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedExam.treatmentPlan}</p>
                    </div>
                  )}
                  {selectedExam.dietAdvice && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Diyet / Beslenme Tavsiyeleri:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedExam.dietAdvice}</p>
                    </div>
                  )}
                  {selectedExam.lifestyleAdvice && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Yaşam Tarzı / Egzersiz:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedExam.lifestyleAdvice}</p>
                    </div>
                  )}
                  {selectedExam.controlPlan && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Kontrol: <span className="font-semibold">{selectedExam.controlPlan}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedExam.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ek Notlar</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    "{selectedExam.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center flex-shrink-0">
              <span className="text-xs text-slate-500">Sorumlu Hekim: <span className="font-semibold text-slate-700 dark:text-slate-300">Dr. {selectedExam.doctor?.name}</span></span>
              <button 
                onClick={() => setSelectedExam(null)}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
