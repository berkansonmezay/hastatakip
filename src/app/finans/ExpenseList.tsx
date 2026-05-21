"use client";

import React, { useState } from "react";
import { Plus, Search, Calendar as CalendarIcon, Tag, FileText, Trash2, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createExpense, deleteExpense } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const expenseSchema = z.object({
  category: z.string().min(1, "Kategori seçilmelidir."),
  description: z.string().optional().or(z.literal("")),
  amount: z.string().min(1, "Tutar girilmelidir."),
  date: z.string().min(1, "Gider tarihi gereklidir."),
  notes: z.string().optional().or(z.literal("")),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  CLINIC: "Klinik Gideri",
  PERSONNEL: "Personel Gideri",
  SUPPLY: "Sarf Malzeme",
  RENT: "Kira",
  TAX: "Vergi",
  BILL: "Fatura",
  OTHER: "Diğer Gider"
};

const CATEGORY_COLORS: Record<string, string> = {
  CLINIC: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
  PERSONNEL: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/40",
  SUPPLY: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  RENT: "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border-orange-200 dark:border-orange-800/40",
  TAX: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-800/40",
  BILL: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40",
  OTHER: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-800/40"
};

export default function ExpenseList({ 
  initialExpenses,
  onExpenseAddedOrDeleted
}: { 
  initialExpenses: any[],
  onExpenseAddedOrDeleted: () => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [expenses, setExpenses] = useState(initialExpenses);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<any>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "CLINIC",
      date: format(new Date(), "yyyy-MM-dd")
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const newExpense = await createExpense({
        ...data,
        amount: parseFloat(data.amount)
      });
      setExpenses([newExpense, ...expenses]);
      setIsModalOpen(false);
      reset();
      onExpenseAddedOrDeleted();
    } catch (error) {
      console.error("Hata:", error);
      alert("Gider kaydedilirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu gider kaydını silmek istediğinize emin misiniz?")) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter(e => e.id !== id));
        onExpenseAddedOrDeleted();
      } catch (error) {
        alert("Silme işlemi sırasında hata oluştu.");
      }
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = 
      (e.description?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (e.notes?.toLowerCase() || "").includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Gider açıklaması veya notlarda ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tüm Kategoriler</option>
            {Object.keys(CATEGORY_LABELS).map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-xs shadow-md shadow-red-500/20"
          >
            <Plus size={16} />
            Yeni Gider Ekle
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4">Tutar</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border", CATEGORY_COLORS[expense.category] || "")}>
                      {CATEGORY_LABELS[expense.category] || expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-300">
                      {expense.description || "—"}
                    </div>
                    {expense.notes && (
                      <div className="text-xs text-slate-400 mt-0.5 max-w-md truncate">
                        Not: {expense.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                      <ArrowDownRight size={14} />
                      ₺{expense.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {format(new Date(expense.date), "dd MMM yyyy", { locale: tr })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Tag size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Kayıtlı gider bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                <ArrowDownRight size={20} /> Yeni Gider Ekle
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl">×</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Kategori *</label>
                <select {...register("category")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {Object.keys(CATEGORY_LABELS).map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-red-500">{(errors.category as any).message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Açıklama *</label>
                <input {...register("description")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ör. Aylık kira bedeli, Ofis malzemeleri" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Tutar (₺) *</label>
                <input type="number" step="0.01" {...register("amount")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0.00" required />
                {errors.amount && <p className="text-xs text-red-500">{(errors.amount as any).message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Gider Tarihi *</label>
                <input type="date" {...register("date")} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                {errors.date && <p className="text-xs text-red-500">{(errors.date as any).message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Gider Notu / Ek Detay</label>
                <textarea {...register("notes")} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Opsiyonel detaylı not..." />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">İptal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all">
                  {isSubmitting ? "Kaydediliyor..." : "Gideri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
