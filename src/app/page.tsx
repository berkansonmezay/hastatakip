import { 
  Users, 
  Calendar, 
  Wallet, 
  Activity, 
  Plus,
  Search,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  // Query actual dashboard statistics
  const totalPatients = await prisma.patient.count();
  
  const pendingAppointmentsCount = await prisma.appointment.count({
    where: { status: "PENDING" },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dailyEarningsResult = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });
  const earningsToday = dailyEarningsResult._sum.amount || 0;

  const activeExaminationsCount = await prisma.examination.count({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  const stats = [
    { 
      label: "Toplam Hasta", 
      value: totalPatients.toLocaleString("tr-TR"), 
      change: "Sistemde kayıtlı", 
      trend: "neutral", 
      icon: Users,
      color: "bg-blue-500" 
    },
    { 
      label: "Bekleyen Randevu", 
      value: pendingAppointmentsCount.toLocaleString("tr-TR"), 
      change: "Aktif randevular", 
      trend: "neutral", 
      icon: Calendar,
      color: "bg-purple-500" 
    },
    { 
      label: "Günlük Tahsilat", 
      value: `₺${earningsToday.toLocaleString("tr-TR")}`, 
      change: "Bugün yapılan", 
      trend: "neutral", 
      icon: Wallet,
      color: "bg-emerald-500" 
    },
    { 
      label: "Aktif Muayene", 
      value: activeExaminationsCount.toLocaleString("tr-TR"), 
      change: "Bugün yapılan", 
      trend: "neutral", 
      icon: Activity,
      color: "bg-orange-500" 
    },
  ];

  // Query actual pending appointments for the sidebar
  const pendingAppointmentsList = await prisma.appointment.findMany({
    where: { status: "PENDING" },
    include: {
      patient: true,
    },
    orderBy: {
      dateTime: "asc",
    },
    take: 4,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Kliniğinizin genel durumuna hoş geldiniz.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hastalar" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
            <Plus size={20} />
            Yeni Kayıt
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Hasta ara..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl text-white", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Lists Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500 mb-4">
            <BarChart3 size={40} />
          </div>
          <h3 className="text-xl font-semibold">Gelir Analizi</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Grafik bileşenleri buraya eklenecek.</p>
        </div>

        {/* Dynamic Side List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Bekleyen Randevular</h3>
          <div className="space-y-4">
            {pendingAppointmentsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500">
                <Calendar size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">Bekleyen randevu bulunmuyor.</p>
              </div>
            ) : (
              pendingAppointmentsList.map((appointment) => {
                const init = appointment.patient.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();
                
                const timeString = new Date(appointment.dateTime).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-bold">
                        {init}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{appointment.patient.fullName}</p>
                        <p className="text-xs text-slate-500">{timeString} - Randevu</p>
                      </div>
                    </div>
                    <Link href="/randevular" className="text-xs font-medium text-blue-500 hover:underline">Detay</Link>
                  </div>
                );
              })
            )}
          </div>
          <Link href="/randevular" className="block text-center w-full mt-6 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            Tümünü Gör
          </Link>
        </div>
      </div>
    </div>
  );
}
