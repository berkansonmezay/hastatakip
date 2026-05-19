"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  CalendarCheck,
  Banknote,
  PieChart,
  BarChart4,
  Activity
} from "lucide-react";

export default function ReportsDashboard({ stats }: { stats: any }) {
  const { patients, appointments, revenue } = stats;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
            <Banknote size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote size={20} />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Aylık Ciro</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {revenue.thisMonth.toLocaleString('tr-TR')} ₺
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 font-medium ${revenue.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {revenue.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(revenue.trend)}%
            </span>
            <span className="text-slate-500">geçen aya göre</span>
          </div>
        </div>

        {/* Metric 2: New Patients */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
            <Users size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Yeni Hastalar</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {patients.newThisMonth} <span className="text-lg font-normal text-slate-500">/ {patients.total} Toplam</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 font-medium ${patients.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {patients.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(patients.trend)}%
            </span>
            <span className="text-slate-500">geçen aya göre</span>
          </div>
        </div>

        {/* Metric 3: Appointments */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
            <CalendarCheck size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarCheck size={20} />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Randevu Tamamlama</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {appointments.completionRate}%
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">
              Bu ay toplam <strong>{appointments.total}</strong> randevudan <strong>{appointments.completed}</strong> adedi tamamlandı.
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${appointments.completionRate}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Charts / Data Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChart size={20} className="text-blue-500" />
              Ödeme Yöntemleri Dağılımı
            </h3>
          </div>
          
          <div className="space-y-4">
            {revenue.byType.length > 0 ? revenue.byType.map((typeData: any) => {
              const total = revenue.thisMonth || 1;
              const percentage = Math.round((typeData.amount / total) * 100);
              
              const labels: Record<string, { label: string, color: string, bg: string }> = {
                'CASH': { label: 'Nakit', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
                'CREDIT_CARD': { label: 'Kredi Kartı', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500' },
                'TRANSFER': { label: 'Havale / EFT', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500' },
              };

              const conf = labels[typeData.type] || { label: typeData.type, color: 'text-slate-600', bg: 'bg-slate-500' };

              return (
                <div key={typeData.type} className="flex items-center gap-4">
                  <div className="w-24 font-medium text-sm text-slate-700 dark:text-slate-300">{conf.label}</div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className={`${conf.bg} h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className={`w-20 text-right font-bold text-sm ${conf.color}`}>
                    {percentage}%
                  </div>
                  <div className="w-24 text-right text-sm text-slate-500 font-medium">
                    {typeData.amount.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-slate-500 py-8 italic">Bu ay henüz ödeme kaydı bulunmuyor.</div>
            )}
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              Sistem Sağlığı & İşlemler
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group">
              <BarChart4 size={32} className="text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Detaylı Rapor İndir</span>
              <span className="text-xs text-slate-500 mt-1">PDF formatında</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group">
              <Banknote size={32} className="text-slate-400 group-hover:text-emerald-500 mb-3 transition-colors" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Muhasebe Aktarımı</span>
              <span className="text-xs text-slate-500 mt-1">Excel (XLSX)</span>
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
            <span className="text-slate-500">Son Güncelleme:</span>
            <span className="font-medium text-slate-900 dark:text-white">Şimdi</span>
          </div>
        </div>

      </div>
    </div>
  );
}
