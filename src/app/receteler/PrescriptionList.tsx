"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2,
  FileText,
  User as UserIcon,
  Pill,
  Printer,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createPrescription, deletePrescription } from "./actions";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(2, "İlaç adı en az 2 karakter olmalıdır."),
  dosage: z.string().min(1, "Doz belirtilmelidir."),
  frequency: z.string().min(1, "Kullanım sıklığı belirtilmelidir."),
  duration: z.string().min(1, "Kullanım süresi belirtilmelidir."),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Hasta seçimi zorunludur."),
  doctorId: z.string().min(1, "Doktor seçimi zorunludur."),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, "En az bir ilaç eklenmelidir."),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

export default function PrescriptionList({ 
  initialPrescriptions, 
  patients, 
  doctors 
}: { 
  initialPrescriptions: any[],
  patients: any[],
  doctors: any[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      items: [{ medicineName: "", dosage: "", frequency: "", duration: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const onSubmit = async (data: PrescriptionFormValues) => {
    try {
      const newPrescription = await createPrescription(data);
      setPrescriptions([newPrescription, ...prescriptions]);
      setIsModalOpen(false);
      reset({
        patientId: "",
        doctorId: "",
        diagnosis: "",
        notes: "",
        items: [{ medicineName: "", dosage: "", frequency: "", duration: "" }]
      });
    } catch (error) {
      console.error("Hata:", error);
      alert("Reçete kaydedilirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu reçeteyi silmek istediğinize emin misiniz?")) {
      try {
        await deletePrescription(id);
        setPrescriptions(prescriptions.filter(p => p.id !== id));
      } catch (error) {
        alert("Reçete silinemedi.");
      }
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Hasta adı veya tanı ile ara..." 
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
          Yeni Reçete Yaz
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Hasta Bilgisi</th>
                <th className="px-6 py-4">Tanı / Doktor</th>
                <th className="px-6 py-4">İlaç Sayısı</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPrescriptions.map((prescription) => (
                <React.Fragment key={prescription.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{prescription.patient?.fullName || "Bilinmiyor"}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {prescription.patient?.tcNo || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{prescription.diagnosis || "Belirtilmemiş"}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Dr. {prescription.doctor?.name || "Bilinmiyor"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40">
                        <Pill size={12} /> {prescription.items?.length || 0} İlaç
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500">
                        {format(new Date(prescription.createdAt), "dd MMM yyyy", { locale: tr })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setExpandedId(expandedId === prescription.id ? null : prescription.id)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all flex flex-col items-center justify-center text-[10px]"
                        >
                          {expandedId === prescription.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          İçerik
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all flex flex-col items-center justify-center text-[10px]">
                          <Printer size={18} />
                          Yazdır
                        </button>
                        <button 
                          onClick={() => handleDelete(prescription.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex flex-col items-center justify-center text-[10px]"
                        >
                          <Trash2 size={18} />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Content for Prescription Items */}
                  {expandedId === prescription.id && (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <td colSpan={5} className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <FileText size={18} className="text-blue-500" /> 
                            Reçete Detayları
                          </h4>
                          {prescription.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                              <span className="font-medium text-slate-700 dark:text-slate-300">Notlar: </span> 
                              {prescription.notes}
                            </p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {prescription.items?.map((item: any, idx: number) => (
                              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{item.medicineName}</div>
                                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                    <span><span className="font-medium">Doz:</span> {item.dosage}</span>
                                    <span><span className="font-medium">Sıklık:</span> {item.frequency}</span>
                                    <span><span className="font-medium">Süre:</span> {item.duration}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredPrescriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    {search ? "Arama kriterlerine uygun reçete bulunamadı." : "Henüz kayıtlı reçete bulunmuyor."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Prescription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-10">
              <h2 className="text-xl font-bold">Yeni Reçete Yaz</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doktor *</label>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanı (Teşhis)</label>
                <input 
                  {...register("diagnosis")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Örn: Akut Faranjit"
                />
              </div>

              {/* Medicines List */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Pill size={18} className="text-indigo-500" />
                    İlaç Listesi
                  </h3>
                  <button
                    type="button"
                    onClick={() => append({ medicineName: "", dosage: "", frequency: "", duration: "" })}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Plus size={14} /> İlaç Ekle
                  </button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 relative group">
                      
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      )}

                      <div className="md:col-span-4">
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 block mb-1">İlaç Adı</label>
                        <input 
                          {...register(`items.${index}.medicineName`)}
                          className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="Örn: Parol 500mg"
                        />
                        {errors?.items?.[index]?.medicineName && <p className="text-[10px] text-red-500 mt-1">{errors.items[index]?.medicineName?.message}</p>}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 block mb-1">Doz</label>
                        <input 
                          {...register(`items.${index}.dosage`)}
                          className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="Örn: 1 Tablet"
                        />
                      </div>
                      
                      <div className="md:col-span-3">
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 block mb-1">Sıklık</label>
                        <input 
                          {...register(`items.${index}.frequency`)}
                          className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="Örn: Günde 2 kez (Tok)"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 block mb-1">Süre</label>
                        <input 
                          {...register(`items.${index}.duration`)}
                          className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="Örn: 5 Gün"
                        />
                      </div>
                    </div>
                  ))}
                  {errors.items && typeof errors.items.message === "string" && (
                    <p className="text-sm text-red-500">{errors.items.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ek Notlar / Kullanım Tavsiyeleri</label>
                <textarea 
                  {...register("notes")}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Bol su ile tüketilmeli..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
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
                  className="px-8 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileText size={18} />
                  {isSubmitting ? "Kaydediliyor..." : "Reçeteyi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
