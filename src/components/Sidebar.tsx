"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  Scissors,
  Activity, 
  Pill, 
  TestTube, 
  Wallet, 
  Package, 
  UserCog, 
  BarChart3, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FolderOpen,
  FileSignature
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Hastalar", href: "/hastalar" },
  { icon: Calendar, label: "Randevular", href: "/randevular" },
  { icon: Stethoscope, label: "Muayene", href: "/muayene" },
  { icon: Scissors, label: "Ameliyatlar", href: "/ameliyat" },
  { icon: Activity, label: "Tedaviler", href: "/tedaviler" },
  { icon: Pill, label: "Reçeteler", href: "/receteler" },
  { icon: TestTube, label: "Tetkikler", href: "/tetkikler" },
  { icon: FolderOpen, label: "Dosya Arşivi", href: "/dosyalar" },
  { icon: FileSignature, label: "Onam Formları", href: "/onam" },
  { icon: Wallet, label: "Finans", href: "/finans" },
  { icon: Package, label: "Stok", href: "/stok" },
  { icon: UserCog, label: "Personeller", href: "/personeller" },
  { icon: BarChart3, label: "Raporlar", href: "/raporlar" },
  { icon: Bell, label: "Bildirimler", href: "/bildirimler" },
  { icon: Settings, label: "Ayarlar", href: "/ayarlar" },
];

import { logoutAction } from "@/app/actions/auth";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside 
      className={cn(
        "h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col transition-all duration-300 border-r border-slate-200 dark:border-slate-800",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
            Hasta<span className="text-slate-800 dark:text-white">Takip</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-600 dark:text-slate-400"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-16 bg-slate-800 dark:bg-slate-950 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-sm whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={async () => {
            await logoutAction();
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 w-full",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
}
