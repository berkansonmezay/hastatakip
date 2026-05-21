"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Wallet, Landmark, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import PaymentList from "./PaymentList";
import ExpenseList from "./ExpenseList";
import { cn } from "@/lib/utils";

export default function FinanceDashboard({
  payments,
  expenses,
  patients
}: {
  payments: any[];
  expenses: any[];
  patients: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Income Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Gelir (Tahsilat)</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">₺{totalIncome.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-1">
              <TrendingUp size={12} className="text-emerald-500" /> Aktif hasta tahsilatları
            </span>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <ArrowUpRight size={24} />
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Gider</p>
            <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">₺{totalExpense.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-1">
              <TrendingDown size={12} className="text-red-500" /> Klinik ve personel giderleri
            </span>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <ArrowDownRight size={24} />
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Bakiye (Kasa)</p>
            <p className={cn(
              "text-3xl font-extrabold",
              balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
            )}>
              {balance < 0 ? "-" : ""}₺{Math.abs(balance).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-1">
              <Wallet size={12} className="text-blue-500" /> Net klinik karlılığı
            </span>
          </div>
          <div className={cn(
            "p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300",
            balance >= 0 
              ? "bg-blue-50 dark:bg-blue-950/20 text-blue-500" 
              : "bg-amber-50 dark:bg-amber-950/20 text-amber-500"
          )}>
            <Landmark size={24} />
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("income")}
          className={cn(
            "px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2",
            activeTab === "income"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <ArrowUpRight size={16} /> Gelir & Tahsilatlar
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={cn(
            "px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2",
            activeTab === "expense"
              ? "border-red-500 text-red-600 dark:text-red-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <ArrowDownRight size={16} /> Giderler & Harcamalar
        </button>
      </div>

      {/* Render selected list */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "income" ? (
          <PaymentList initialPayments={payments} patients={patients} />
        ) : (
          <ExpenseList initialExpenses={expenses} onExpenseAddedOrDeleted={handleRefresh} />
        )}
      </div>
    </div>
  );
}
