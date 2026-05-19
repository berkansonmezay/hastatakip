"use client";

import React, { useState } from "react";
import { Plus, Search, Wallet, CreditCard, Banknote, Landmark, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createPayment } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const paymentSchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  amount: z.string().min(1, "Tutar girilmelidir."),
  type: z.string().min(1, "Ödeme türü seçilmelidir."),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentList({ initialPayments, patients }: { initialPayments: any[], patients: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState(initialPayments);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const newPayment = await createPayment({
        ...data,
        amount: parseFloat(data.amount)
      });
      setPayments([newPayment, ...payments]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Ödeme kaydedilirken bir hata oluştu.");
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "CASH": return <Banknote size={16} />;
      case "CREDIT_CARD": return <CreditCard size={16} />;
      case "TRANSFER": return <Landmark size={16} />;
      default: return <Wallet size={16} />;
    }
  };

  const getLabel = (type: string) => {
    switch(type) {
      case "CASH": return "Nakit";
      case "CREDIT_CARD": return "Kredi Kartı";
      case "TRANSFER": return "Havale/EFT";
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-64 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Hasta adı ile ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus size={20} />
          Yeni Tahsilat
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-semibold">
              <th className="px-6 py-4">Hasta</th>
              <th className="px-6 py-4">Tutar</th>
              <th className="px-6 py-4">Tür</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-bold">{payment.patient.fullName}</td>
                <td className="px-6 py-4">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ₺{payment.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                      {getIcon(payment.type)}
                    </span>
                    {getLabel(payment.type)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {format(new Date(payment.date), "dd MMM yyyy", { locale: tr })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><MoreHorizontal size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Yeni Tahsilat</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><Plus size={24} className="rotate-45" /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hasta *</label>
                <select {...register("patientId")} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950">
                  <option value="">Seçiniz</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tutar (₺) *</label>
                <input type="number" {...register("amount")} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950" placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ödeme Türü *</label>
                <select {...register("type")} className="w-full px-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-950">
                  <option value="CASH">Nakit</option>
                  <option value="CREDIT_CARD">Kredi Kartı</option>
                  <option value="TRANSFER">Havale/EFT</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400">İptal</button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-2 rounded-lg font-medium bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                  {isSubmitting ? "Kaydediliyor..." : "Tahsilatı Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
