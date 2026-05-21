"use client";

import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  Wallet, 
  Activity, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  User, 
  Pill, 
  Scissors, 
  FileText,
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  CalendarCheck,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  stats: {
    totalPatients: number;
    pendingAppointmentsCount: number;
    earningsToday: number;
    activeExaminationsCount: number;
  };
  patients: any[];
  doctors: any[];
  upcomingControls: any[];
  dailyAppointments: any[];
}

export default function DashboardClient({
  stats,
  patients,
  doctors,
  upcomingControls,
  dailyAppointments
}: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");

  // Determine critical patients for the warning banner
  const criticalPatients = patients.filter(
    p => p.riskStatus === "CRITICAL" || p.riskStatus === "HIGH"
  );

  // Process and filter patients for the summary table
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.protocolNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.chronicDiseases || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.systemicDiseases || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.examinations[0]?.preliminaryDiag || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.examinations[0]?.finalDiagnosis || "").toLowerCase().includes(search.toLowerCase());

    const matchesRisk = selectedRisk === "ALL" || p.riskStatus === selectedRisk;

    // Sorumlu doktor match: check doctor in latest examination, appointment, or surgery
    let matchesDoctor = true;
    if (selectedDoctor !== "ALL") {
      const examDocId = p.examinations[0]?.doctorId;
      const apptDocId = p.appointments[0]?.doctorId;
      const surgeryDocId = p.surgeries[0]?.surgeonId;
      matchesDoctor = examDocId === selectedDoctor || apptDocId === selectedDoctor || surgeryDocId === selectedDoctor;
    }

    return matchesSearch && matchesRisk && matchesDoctor;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20 dark:bg-orange-950/30 dark:text-orange-400";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-400";
      case "LOW":
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-400";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "Kritik";
      case "HIGH": return "Yüksek";
      case "MEDIUM": return "Orta";
      case "LOW": default: return "Düşük";
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Warnings Banner */}
      {criticalPatients.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white p-4 rounded-2xl shadow-lg shadow-red-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base">Kritik Risk Durumu Uyarısı</h4>
              <p className="text-xs text-white/80 mt-0.5">Sistemde takip edilen {criticalPatients.length} hastanın risk seviyesi yüksek veya kritik düzeydedir. Lütfen kontrol tarihlerini ve tedavilerini inceleyin.</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedRisk("CRITICAL")}
            className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl shadow-md transition-all self-end md:self-auto whitespace-nowrap"
          >
            Kritik Hastaları Listele
          </button>
        </div>
      )}

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-all">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kayıtlı Hasta</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toplam Hasta</p>
            <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-white">{stats.totalPatients}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-all">
              <Calendar size={22} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Randevular</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bekleyen Randevu</p>
            <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-white">{stats.pendingAppointmentsCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-all">
              <Wallet size={22} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tahsilat</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bugünkü Ciro</p>
            <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-white">₺{stats.earningsToday.toLocaleString("tr-TR")}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-all">
              <Activity size={22} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Klinik Muayene</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bugünkü Muayene</p>
            <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-white">{stats.activeExaminationsCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Patient Summary Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Hasta Özeti Tablosu</h3>
                <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-800">
                  {filteredPatients.length} / {patients.length} Hasta Listeleniyor
                </span>
              </div>

              {/* Filters Box */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    placeholder="İsim, protokol no veya tanı ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-xs w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Doctor filter dropdown */}
                  <select 
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/45 focus:outline-none font-medium text-slate-600 dark:text-slate-400"
                  >
                    <option value="ALL">Tüm Doktorlar</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  {/* Risk filter dropdown */}
                  <select 
                    value={selectedRisk}
                    onChange={(e) => setSelectedRisk(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/45 focus:outline-none font-medium text-slate-600 dark:text-slate-400"
                  >
                    <option value="ALL">Tüm Risk Seviyeleri</option>
                    <option value="LOW">Düşük Risk</option>
                    <option value="MEDIUM">Orta Risk</option>
                    <option value="HIGH">Yüksek Risk</option>
                    <option value="CRITICAL">Kritik Risk</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="px-5 py-4">Hasta Bilgisi</th>
                    <th className="px-5 py-4">Ön Tanı / Hastalık</th>
                    <th className="px-5 py-4">Son Ameliyat</th>
                    <th className="px-5 py-4">Muayene / Kontrol</th>
                    <th className="px-5 py-4">Sorumlu Hekim</th>
                    <th className="px-5 py-4">Durum / Uyarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic text-sm">
                        Kriterlere uygun hasta kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => {
                      const latestExam = p.examinations[0];
                      const latestSurgery = p.surgeries[0];
                      const latestFollowUp = p.followUps[0];
                      const latestAppt = p.appointments[0];

                      // Sorumlu hekim logic: examination doc, or appointment doc, or surgery surgeon
                      const responsibleDoctorName = 
                        latestExam?.doctor?.name || 
                        latestAppt?.doctor?.name || 
                        latestSurgery?.surgeon?.name || 
                        "Atanmamış";

                      // Illness name logic
                      const illnessName = 
                        latestExam?.finalDiagnosis || 
                        latestExam?.preliminaryDiag || 
                        p.chronicDiseases || 
                        p.systemicDiseases ||
                        "Yok";

                      return (
                        <tr 
                          key={p.id} 
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors group cursor-pointer"
                        >
                          {/* Name / Protocol */}
                          <td className="px-5 py-4">
                            <Link href={`/hastalar/${p.id}`} className="block focus:outline-none">
                              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors text-sm">
                                {p.fullName}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                                Prot: {p.protocolNo || "—"}
                              </div>
                            </Link>
                          </td>

                          {/* Illness/Diagnosis */}
                          <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={illnessName}>
                            {illnessName}
                          </td>

                          {/* Last Surgery */}
                          <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {latestSurgery ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={latestSurgery.name}>
                                  {latestSurgery.name}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-0.5">
                                  {latestSurgery.date ? format(new Date(latestSurgery.date), "dd.MM.yyyy", { locale: tr }) : ""}
                                </span>
                              </div>
                            ) : (
                              <span className="italic text-slate-400">—</span>
                            )}
                          </td>

                          {/* Examination / Follow-up */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="text-slate-400 font-medium">Son Muayene:</span>
                                <span className="font-bold text-slate-600 dark:text-slate-300">
                                  {latestExam ? format(new Date(latestExam.createdAt), "dd.MM.yyyy") : "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="text-slate-400 font-medium">Kontrol:</span>
                                <span className="font-bold text-indigo-500">
                                  {latestFollowUp ? format(new Date(latestFollowUp.date), "dd.MM.yyyy") : "—"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Sorumlu Doktor */}
                          <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                            {responsibleDoctorName}
                          </td>

                          {/* Risk, Allergies, Medications */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Risk Status badge */}
                              <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border", getRiskBadge(p.riskStatus))}>
                                {getRiskLabel(p.riskStatus)}
                              </span>

                              {/* Allergies tag */}
                              {p.allergies.length > 0 ? (
                                <span 
                                  className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400"
                                  title={p.allergies.map((a: any) => a.name).join(", ")}
                                >
                                  Alerji ({p.allergies.length})
                                </span>
                              ) : null}

                              {/* Medications count */}
                              {p.medications.length > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
                                  İlaç: {p.medications.length}
                                </span>
                              ) : null}
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
        </div>

        {/* Right Side Panels */}
        <div className="space-y-6">
          
          {/* Today's Appointments List */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CalendarCheck size={18} className="text-blue-500" />
                Bugünkü Randevular
              </h3>
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md">
                {dailyAppointments.length} Randevu
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {dailyAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <Clock size={28} className="text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-semibold">Bugün için planlanmış randevu bulunmuyor.</p>
                </div>
              ) : (
                dailyAppointments.map((appt) => {
                  const init = appt.patient.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
                  
                  return (
                    <div 
                      key={appt.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                          {init}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{appt.patient.fullName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Hekim: {appt.doctor?.name || "Belirtilmemiş"}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {format(new Date(appt.dateTime), "HH:mm")}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded",
                          appt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                          appt.status === "CANCELLED" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                        )}>
                          {appt.status === "PENDING" ? "Bekliyor" : appt.status === "COMPLETED" ? "Yapıldı" : "İptal"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <Link 
              href="/randevular" 
              className="block text-center w-full mt-4 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors border-t border-slate-100 dark:border-slate-800 pt-3"
            >
              Randevuları Yönet
            </Link>
          </div>

          {/* Upcoming Controls / Follow-Ups */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-500" />
                Yaklaşan Kontroller
              </h3>
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md">
                {upcomingControls.length} Kontrol
              </span>
            </div>

            <div className="space-y-3">
              {upcomingControls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <Clock size={28} className="text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-semibold">Yakın tarihte kontrol randevusu bulunmuyor.</p>
                </div>
              ) : (
                upcomingControls.map((follow) => (
                  <div 
                    key={follow.id} 
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/20 transition-all duration-200 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {follow.patient.fullName}
                      </span>
                      <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/20">
                        {follow.type === "CONTROL" ? "Genel Kontrol" : 
                         follow.type === "STITCH_REMOVAL" ? "Dikiş Alma" : 
                         follow.type === "DRESSING" ? "Pansuman" : "Değerlendirme"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="font-semibold text-slate-500">Hekim: {follow.doctor?.name || "Belirtilmemiş"}</span>
                      <span>{format(new Date(follow.date), "dd MMM yyyy", { locale: tr })}</span>
                    </div>

                    {follow.notes && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic bg-slate-100/50 dark:bg-slate-900 p-1.5 rounded mt-0.5">
                        "{follow.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
