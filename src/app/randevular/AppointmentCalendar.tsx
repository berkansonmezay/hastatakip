"use client";

import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User as UserIcon, 
  Stethoscope,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock3
} from "lucide-react";
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths
} from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createAppointment, updateAppointmentStatus } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Hasta seçilmelidir."),
  doctorId: z.string().min(1, "Doktor seçilmelidir."),
  dateTime: z.string().min(1, "Tarih ve saat seçilmelidir."),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentCalendar({ 
  initialAppointments, 
  patients, 
  doctors 
}: { 
  initialAppointments: any[], 
  patients: any[], 
  doctors: any[] 
}) {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      const newApp = await createAppointment(data);
      setAppointments([...appointments, newApp]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Randevu oluşturulurken bir hata oluştu.");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateAppointmentStatus(id, status);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  // Calendar logic for different views
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setView("day")}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === "day" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            Gün
          </button>
          <button 
            onClick={() => setView("week")}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === "week" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            Hafta
          </button>
          <button 
            onClick={() => setView("month")}
            className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", view === "month" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            Ay
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(view === "month" ? subMonths(currentDate, 1) : subDays(currentDate, view === "week" ? 7 : 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold min-w-[120px] text-center">
            {format(currentDate, view === "month" ? "MMMM yyyy" : "d MMMM yyyy", { locale: tr })}
          </h2>
          <button onClick={() => setCurrentDate(view === "month" ? addMonths(currentDate, 1) : addDays(currentDate, view === "week" ? 7 : 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md shadow-blue-500/20"
      >
        <Plus size={20} />
        Randevu Oluştur
      </button>
    </div>
  );

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => {
          const dayAppointments = appointments.filter(a => isSameDay(new Date(a.dateTime), day));
          return (
            <div key={day.toString()} className="flex flex-col gap-4">
              <div className={cn(
                "p-3 rounded-xl text-center border transition-all",
                isToday(day) 
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              )}>
                <div className="text-xs font-semibold uppercase text-slate-400">{format(day, "eee", { locale: tr })}</div>
                <div className="text-xl font-bold">{format(day, "d")}</div>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {dayAppointments.map((app) => (
                  <div 
                    key={app.id} 
                    className={cn(
                      "p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group transition-all hover:scale-[1.02] hover:shadow-md",
                      app.status === "COMPLETED" ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50" : "bg-white dark:bg-slate-900"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        <Clock size={12} />
                        {format(new Date(app.dateTime), "HH:mm")}
                      </div>
                      <div className="flex items-center gap-1">
                        {app.status === "PENDING" && <Clock3 size={14} className="text-orange-500" />}
                        {app.status === "COMPLETED" && <CheckCircle2 size={14} className="text-emerald-500" />}
                        {app.status === "CANCELLED" && <XCircle size={14} className="text-red-500" />}
                      </div>
                    </div>
                    <div className="font-bold text-sm truncate">{app.patient.fullName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Stethoscope size={12} />
                      Dr. {app.doctor.name || "Bilinmiyor"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderHeader()}
      
      {view === "week" ? renderWeekView() : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          Bu görünüm yakında eklenecek. Şimdilik Hafta görünümünü kullanabilirsiniz.
        </div>
      )}

      {/* Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Yeni Randevu Oluştur</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hasta Seçiniz *</label>
                <select 
                  {...register("patientId")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Seçiniz</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
                {errors.patientId && <p className="text-xs text-red-500">{errors.patientId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Doktor Seçiniz *</label>
                <select 
                  {...register("doctorId")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Seçiniz</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                </select>
                {errors.doctorId && <p className="text-xs text-red-500">{errors.doctorId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tarih ve Saat *</label>
                <input 
                  type="datetime-local"
                  {...register("dateTime")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                {errors.dateTime && <p className="text-xs text-red-500">{errors.dateTime.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notlar</label>
                <textarea 
                  {...register("notes")}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                  placeholder="Randevu ile ilgili notlar..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
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
                  {isSubmitting ? "Kaydediliyor..." : "Randevu Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
