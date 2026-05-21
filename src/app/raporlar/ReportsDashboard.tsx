"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  CalendarCheck,
  Banknote,
  PieChart,
  BarChart4,
  Activity,
  Printer,
  Scissors,
  Pill,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp as TrendUpIcon,
  CreditCard,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  CASH: "Nakit",
  CREDIT_CARD: "Kredi Kartı",
  TRANSFER: "Havale / EFT"
};

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  CLINIC: "Klinik Harcaması",
  PERSONNEL: "Personel / Maaş",
  SUPPLY: "Sarf Malzeme",
  RENT: "Kira",
  TAX: "Vergi",
  BILL: "Fatura"
};

export default function ReportsDashboard({ stats }: { stats: any }) {
  const [activeTab, setActiveTab] = useState<"summary" | "financial" | "doctors" | "surgeries" | "meds">("summary");
  
  const { 
    patients, 
    appointments, 
    revenue, 
    expenses, 
    doctorPerformance, 
    surgeries, 
    frequentMedications 
  } = stats;

  const handlePrint = () => {
    window.print();
  };

  const netProfit = revenue.thisMonth - expenses.thisMonth;

  return (
    <div className="space-y-6">
      
      {/* Navigation tabs and print action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={() => setActiveTab("summary")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "summary" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            Genel Özet
          </button>
          <button 
            onClick={() => setActiveTab("financial")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "financial" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            Finansal Analiz
          </button>
          <button 
            onClick={() => setActiveTab("doctors")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "doctors" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            Hekim Performansı
          </button>
          <button 
            onClick={() => setActiveTab("surgeries")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "surgeries" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            Ameliyat & Tedavi
          </button>
          <button 
            onClick={() => setActiveTab("meds")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === "meds" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            İlaç Kullanımı
          </button>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Printer size={15} />
          Sayfayı Yazdır / PDF
        </button>
      </div>

      {/* Tab contents */}
      
      {/* 1. GENERAL SUMMARY TAB */}
      {activeTab === "summary" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Monthly Revenue */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none text-slate-700 dark:text-white">
                <Banknote size={100} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/20">
                  <Banknote size={20} />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Aylık Toplam Gelir</h3>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                ₺{revenue.thisMonth.toLocaleString('tr-TR')}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className={cn(
                  "flex items-center gap-0.5",
                  revenue.trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
                )}>
                  {revenue.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(revenue.trend)}%
                </span>
                <span className="text-slate-400">geçen aya göre</span>
              </div>
            </div>

            {/* New Patients */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none text-slate-700 dark:text-white">
                <Users size={100} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/20">
                  <Users size={20} />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Yeni Kayıtlı Hastalar</h3>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {patients.newThisMonth} <span className="text-xs font-semibold text-slate-400">/ {patients.total} Toplam</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className={cn(
                  "flex items-center gap-0.5",
                  patients.trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
                )}>
                  {patients.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(patients.trend)}%
                </span>
                <span className="text-slate-400">geçen aya göre</span>
              </div>
            </div>

            {/* Appointment Completion Rate */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none text-slate-700 dark:text-white">
                <CalendarCheck size={100} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/20">
                  <CalendarCheck size={20} />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Randevu Tamamlama Oranı</h3>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                %{appointments.completionRate}
              </div>
              <div className="text-xs text-slate-500 font-semibold leading-relaxed">
                Bu ayki <strong>{appointments.total}</strong> randevunun <strong>{appointments.completed}</strong> tanesi tamamlandı.
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden border border-slate-200/20">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${appointments.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Metrics and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Payment Methods */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-black flex items-center gap-2 mb-5">
                <PieChart size={18} className="text-blue-500" />
                Ödeme Türleri Dağılımı (Aylık)
              </h3>
              
              <div className="space-y-4">
                {revenue.byType.length > 0 ? revenue.byType.map((typeData: any) => {
                  const total = revenue.thisMonth || 1;
                  const percentage = Math.round((typeData.amount / total) * 100);
                  
                  const colors: Record<string, { bg: string, text: string }> = {
                    CASH: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
                    CREDIT_CARD: { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
                    TRANSFER: { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
                  };

                  const currentColors = colors[typeData.type] || { bg: "bg-slate-500", text: "text-slate-600" };

                  return (
                    <div key={typeData.type} className="flex items-center gap-4">
                      <div className="w-24 font-bold text-xs text-slate-700 dark:text-slate-300">
                        {PAYMENT_TYPE_LABELS[typeData.type] || typeData.type}
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200/25">
                        <div className={cn(currentColors.bg, "h-full rounded-full")} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className={cn(currentColors.text, "w-10 text-right font-bold text-xs")}>
                        %{percentage}
                      </div>
                      <div className="w-28 text-right text-xs text-slate-500 dark:text-slate-400 font-bold">
                        ₺{typeData.amount.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic text-xs">Bu ay henüz gelir kaydı bulunmuyor.</div>
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2 mb-5">
                  <Activity size={18} className="text-indigo-500" />
                  Performans & Hızlı Rapor Çıktısı
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Buradaki tüm grafik verileri, hekimlerinizin aylık başarı grafiklerini, ameliyat başarı oranlarını ve reçete eğilimlerini içerir. Bilgisayarınıza PDF olarak indirebilir veya doğrudan yazıcıya gönderebilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handlePrint}
                  className="flex flex-col items-center justify-center p-5 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group text-center"
                >
                  <BarChart4 size={28} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Rapor PDF Kaydet</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Mevcut Görünüm</span>
                </button>
                
                <button 
                  onClick={handlePrint}
                  className="flex flex-col items-center justify-center p-5 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group text-center"
                >
                  <Printer size={28} className="text-slate-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Yazıcıya Gönder</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Yazdırılabilir Sayfa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FINANCIAL ANALYSIS TAB */}
      {activeTab === "financial" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Key Financial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gelir */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aylık Gelir</span>
                <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₺{revenue.thisMonth.toLocaleString('tr-TR')}</h4>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <ArrowUpRight size={22} />
              </div>
            </div>

            {/* Gider */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aylık Gider</span>
                <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400">₺{expenses.thisMonth.toLocaleString('tr-TR')}</h4>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl">
                <ArrowDownRight size={22} />
              </div>
            </div>

            {/* Net Kâr */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Kâr / Zarar</span>
                <h4 className={cn(
                  "text-2xl font-black",
                  netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600"
                )}>
                  ₺{netProfit.toLocaleString('tr-TR')}
                </h4>
              </div>
              <div className={cn(
                "p-3 rounded-xl",
                netProfit >= 0 ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" : "bg-red-500/10 text-red-600"
              )}>
                <DollarSign size={22} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Expense breakdown by category */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-black flex items-center gap-2 mb-5">
                <PieChart size={18} className="text-rose-500" />
                Gider Kalemleri Dağılımı
              </h3>
              
              <div className="space-y-4">
                {expenses.byCategory.length > 0 ? expenses.byCategory.map((catData: any) => {
                  const total = expenses.thisMonth || 1;
                  const percentage = Math.round((catData.amount / total) * 100);

                  return (
                    <div key={catData.category} className="flex items-center gap-4">
                      <div className="w-28 font-bold text-xs text-slate-700 dark:text-slate-300 truncate">
                        {EXPENSE_CATEGORY_LABELS[catData.category] || catData.category}
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200/25">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="w-10 text-right font-bold text-xs text-rose-600 dark:text-rose-400">
                        %{percentage}
                      </div>
                      <div className="w-28 text-right text-xs text-slate-500 dark:text-slate-400 font-bold">
                        ₺{catData.amount.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center text-slate-400 py-8 italic text-xs">Bu ay henüz gider/harcama kaydı bulunmuyor.</div>
                )}
              </div>
            </div>

            {/* Income breakdown by medical category */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-black flex items-center gap-2 mb-5">
                <PieChart size={18} className="text-emerald-500" />
                Gelir Kaynağı Kırılımları
              </h3>
              
              <div className="space-y-4">
                {revenue.byCategory.length > 0 ? revenue.byCategory.map((catData: any) => {
                  const total = revenue.thisMonth || 1;
                  const percentage = Math.round((catData.amount / total) * 100);

                  const labels: Record<string, string> = {
                    EXAMINATION: "Muayene Ücreti",
                    SURGERY: "Ameliyat / Operasyon",
                    OTHER: "Diğer Hizmetler",
                  };

                  return (
                    <div key={catData.category} className="flex items-center gap-4">
                      <div className="w-28 font-bold text-xs text-slate-700 dark:text-slate-300 truncate">
                        {labels[catData.category] || catData.category}
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200/25">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="w-10 text-right font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        %{percentage}
                      </div>
                      <div className="w-28 text-right text-xs text-slate-500 dark:text-slate-400 font-bold">
                        ₺{catData.amount.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center text-slate-400 py-8 italic text-xs">Bu ay henüz gelir kırılım kaydı bulunmuyor.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOCTOR PERFORMANCE TAB */}
      {activeTab === "doctors" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-base font-black flex items-center gap-2">
              <UserCheck size={18} className="text-blue-500" />
              Hekim Performans Analizi
            </h3>
            <p className="text-xs text-slate-500 mt-1">Hekimlerin gerçekleştirdiği muayene, ameliyat notları ve randevu sayıları.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Doktor Adı</th>
                  <th className="px-6 py-4 text-center">Toplam Muayene</th>
                  <th className="px-6 py-4 text-center">Toplam Ameliyat</th>
                  <th className="px-6 py-4 text-center">Randevu Sayısı</th>
                  <th className="px-6 py-4 text-right">Verimlilik Puanı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctorPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic text-xs">
                      Sistemde kayıtlı hekim bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  doctorPerformance.map((d: any) => {
                    const score = Math.min(100, Math.round((d.examinationsCount * 2 + d.surgeriesCount * 5 + d.appointmentsCount * 1)));
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {d.name}
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {d.examinationsCount}
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {d.surgeriesCount}
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {d.appointmentsCount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{score} / 100</span>
                            <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/20">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${score}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SURGERIES & TREATMENTS TAB */}
      {activeTab === "surgeries" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Surgeries */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Operasyon</span>
                <h4 className="text-2xl font-black mt-1">{surgeries.total}</h4>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Scissors size={20} />
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tamamlanan Ameliyat</span>
                <h4 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{surgeries.completed}</h4>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CheckCircle size={20} />
              </div>
            </div>

            {/* Complications */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Komplikasyon Kaydı</span>
                <h4 className="text-2xl font-black mt-1 text-orange-600 dark:text-orange-400">{surgeries.complications}</h4>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-xl">
                <AlertTriangle size={20} />
              </div>
            </div>

          </div>

          {/* Surgeries by Technique */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-black flex items-center gap-2 mb-5">
              <Activity size={18} className="text-blue-500" />
              Uygulanan Ameliyat Teknikleri
            </h3>
            
            <div className="space-y-4">
              {surgeries.byTechnique.length > 0 ? surgeries.byTechnique.map((t: any) => {
                const percentage = Math.round((t.count / surgeries.total) * 100);
                return (
                  <div key={t.technique} className="flex items-center gap-4">
                    <div className="w-48 font-bold text-xs text-slate-700 dark:text-slate-300 truncate">
                      {t.technique}
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200/25">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="w-10 text-right font-bold text-xs text-blue-600 dark:text-blue-400">
                      %{percentage}
                    </div>
                    <div className="w-16 text-right text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {t.count} Vaka
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-slate-400 py-8 italic text-xs">Uygulanmış ameliyat tekniği kaydı bulunmuyor.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MEDICATION DISTRIBUTION TAB */}
      {activeTab === "meds" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <Pill size={18} className="text-blue-500" />
                En Sık Tercih Edilen İlaçlar
              </h3>
              <p className="text-xs text-slate-400 mt-1">Hastaların profillerine en çok eklenen ve aktif kullanılan tedavi ilaçları.</p>
            </div>
          </div>

          <div className="space-y-5">
            {frequentMedications.length > 0 ? frequentMedications.map((med: any, index: number) => {
              const maxCount = frequentMedications[0]?.count || 1;
              const widthPerc = Math.round((med.count / maxCount) * 100);
              
              return (
                <div key={med.name} className="flex items-center gap-4">
                  <span className="w-6 text-xs text-slate-400 font-bold text-center">#{index + 1}</span>
                  <div className="w-36 text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={med.name}>
                    {med.name}
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200/25">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${widthPerc}%` }}></div>
                  </div>
                  <div className="w-20 text-right text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {med.count} Hasta
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-slate-400 py-12 italic text-xs">Sistemde henüz aktif ilaç kaydı bulunmamaktadır.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
