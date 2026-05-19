import { 
  Users, 
  Calendar, 
  Wallet, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Search,
  Bell,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { 
    label: "Toplam Hasta", 
    value: "1,284", 
    change: "+12%", 
    trend: "up", 
    icon: Users,
    color: "bg-blue-500" 
  },
  { 
    label: "Bekleyen Randevu", 
    value: "14", 
    change: "+3", 
    trend: "up", 
    icon: Calendar,
    color: "bg-purple-500" 
  },
  { 
    label: "Günlük Tahsilat", 
    value: "₺12,450", 
    change: "-5%", 
    trend: "down", 
    icon: Wallet,
    color: "bg-emerald-500" 
  },
  { 
    label: "Aktif Muayene", 
    value: "4", 
    change: "Normal", 
    trend: "neutral", 
    icon: Activity,
    color: "bg-orange-500" 
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Kliniğinizin genel durumuna hoş geldiniz.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
            <Plus size={20} />
            Yeni Kayıt
          </button>
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
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-red-500" : "text-slate-400"
              )}>
                {stat.change}
                {stat.trend === "up" && <ArrowUpRight size={16} />}
                {stat.trend === "down" && <ArrowDownRight size={16} />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Lists Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500 mb-4">
            <BarChart3 size={40} />
          </div>
          <h3 className="text-xl font-semibold">Gelir Analizi</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Grafik bileşenleri buraya eklenecek.</p>
        </div>

        {/* Side List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Bekleyen Randevular</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-bold">
                    H{i}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Hasta Adı Soyadı {i}</p>
                    <p className="text-xs text-slate-500">14:30 - Muayene</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-blue-500 hover:underline">Detay</button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            Tümünü Gör
          </button>
        </div>
      </div>
    </div>
  );
}
