"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2,
  Edit2,
  FileText,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Microscope
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createLabTest, updateLabTestResult, deleteLabTest } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const labTestSchema = z.object({
  patientId: z.string().min(1, "Hasta seçimi zorunludur."),
  doctorId: z.string().min(1, "Doktor seçimi zorunludur."),
  testName: z.string().min(2, "Tetkik adı en az 2 karakter olmalıdır."),
});

type LabTestFormValues = z.infer<typeof labTestSchema>;

export default function LabTestList({ 
  initialTests, 
  patients, 
  doctors 
}: { 
  initialTests: any[],
  patients: any[],
  doctors: any[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tests, setTests] = useState(initialTests);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LabTestFormValues>({
    resolver: zodResolver(labTestSchema),
  });

  const [resultText, setResultText] = useState("");
  const [isResultSubmitting, setIsResultSubmitting] = useState(false);

  const onSubmit = async (data: LabTestFormValues) => {
    try {
      const newTest = await createLabTest(data);
      setTests([newTest, ...tests]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Tetkik kaydedilirken bir hata oluştu.");
    }
  };

  const onSubmitResult = async () => {
    if (!selectedTestId || !resultText.trim()) return;
    setIsResultSubmitting(true);
    try {
      const updatedTest = await updateLabTestResult(selectedTestId, resultText);
      setTests(tests.map(t => t.id === selectedTestId ? updatedTest : t));
      setIsResultModalOpen(false);
      setResultText("");
      setSelectedTestId(null);
    } catch (error) {
      alert("Sonuç kaydedilemedi.");
    } finally {
      setIsResultSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu tetkiki silmek istediğinize emin misiniz?")) {
      try {
        await deleteLabTest(id);
        setTests(tests.filter(t => t.id !== id));
      } catch (error) {
        alert("Tetkik silinemedi.");
      }
    }
  };

  const filteredTests = tests.filter(t => 
    t.testName?.toLowerCase().includes(search.toLowerCase()) ||
    t.patient?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tetkik adı veya hasta adı ile ara..." 
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
          Yeni Tetkik İste
        </button>
      </div>

      {/* Tests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Hasta Bilgisi</th>
                <th className="px-6 py-4">Tetkik Adı / İsteyen Doktor</th>
                <th className="px-6 py-4">Durum / Sonuç</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{test.patient?.fullName || "Bilinmiyor"}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {test.patient?.tcNo || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{test.testName}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      Dr. {test.doctor?.name || "Bilinmiyor"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {test.status === "COMPLETED" ? (
                      <div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/40">
                          <CheckCircle2 size={12} /> Tamamlandı
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-[200px] truncate" title={test.result}>
                          {test.result}
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-600 dark:bg-amber-900/40">
                        <Clock size={12} /> Bekliyor
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500">
                      {format(new Date(test.createdAt), "dd MMM yyyy", { locale: tr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedTestId(test.id);
                          setResultText(test.result || "");
                          setIsResultModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                        title={test.status === "COMPLETED" ? "Sonucu Düzenle" : "Sonuç Gir"}
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(test.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    {search ? "Arama kriterlerine uygun tetkik bulunamadı." : "Henüz kayıtlı tetkik bulunmuyor."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Test Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Yeni Tetkik İste</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hasta *</label>
                <select 
                  {...register("patientId")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Hasta Seçiniz</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.tcNo || "TC Yok"})</option>
                  ))}
                </select>
                {errors.patientId && <p className="text-xs text-red-500">{errors.patientId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">İsteyen Doktor *</label>
                <select 
                  {...register("doctorId")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Doktor Seçiniz</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.name}</option>
                  ))}
                </select>
                {errors.doctorId && <p className="text-xs text-red-500">{errors.doctorId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tetkik Adı *</label>
                <div className="relative">
                  <Microscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register("testName")}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Örn: Tam Kan Sayımı (Hemogram)"
                  />
                </div>
                {errors.testName && <p className="text-xs text-red-500">{errors.testName.message}</p>}
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
                  {isSubmitting ? "Kaydediliyor..." : "İsteği Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {isResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Tetkik Sonucu Gir / Düzenle</h2>
              <button 
                onClick={() => {
                  setIsResultModalOpen(false);
                  setResultText("");
                  setSelectedTestId(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sonuç Raporu</label>
                <textarea 
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Laboratuvar sonuçlarını buraya giriniz..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <button 
                  onClick={() => {
                    setIsResultModalOpen(false);
                    setResultText("");
                    setSelectedTestId(null);
                  }}
                  className="px-6 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  İptal
                </button>
                <button 
                  onClick={onSubmitResult}
                  disabled={isResultSubmitting || !resultText.trim()}
                  className="px-8 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResultSubmitting ? "Kaydediliyor..." : "Sonucu Onayla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
