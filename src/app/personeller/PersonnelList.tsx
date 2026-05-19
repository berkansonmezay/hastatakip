"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2,
  Edit2,
  ChevronRight,
  User as UserIcon,
  Mail,
  ShieldAlert
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createUser, deleteUser } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const RoleEnum = z.enum(["ADMIN", "DOCTOR", "SECRETARY", "ACCOUNTING", "LAB"]);

const userSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  email: z.string().email("Geçerli bir e-posta giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
  role: RoleEnum,
});

type UserFormValues = z.infer<typeof userSchema>;

const roleTranslations: Record<string, string> = {
  ADMIN: "Yönetici",
  DOCTOR: "Doktor",
  SECRETARY: "Sekreter",
  ACCOUNTING: "Muhasebe",
  LAB: "Laboratuvar"
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-600 dark:bg-red-900/40",
  DOCTOR: "bg-blue-100 text-blue-600 dark:bg-blue-900/40",
  SECRETARY: "bg-green-100 text-green-600 dark:bg-green-900/40",
  ACCOUNTING: "bg-amber-100 text-amber-600 dark:bg-amber-900/40",
  LAB: "bg-purple-100 text-purple-600 dark:bg-purple-900/40",
};

export default function PersonnelList({ initialUsers }: { initialUsers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "DOCTOR"
    }
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      const newUser = await createUser(data);
      setUsers([newUser, ...users]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Personel kaydedilirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu personeli silmek istediğinize emin misiniz? (Bağlı işlemleri varsa silinemez)")) {
      try {
        await deleteUser(id);
        setUsers(users.filter(p => p.id !== id));
      } catch (error) {
        alert("Personel silinemedi. Bağlı işlemler (randevu, muayene vb.) olabilir.");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    roleTranslations[u.role]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Personel adı, e-posta veya rol ile ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-blue-500/20 whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Yeni Personel Ekle
        </button>
      </div>

      {/* Personnel Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Personel Bilgileri</th>
                <th className="px-6 py-4">Rol / Yetki</th>
                <th className="px-6 py-4">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name || "İsimsiz"}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || "bg-slate-100 text-slate-600"}`}>
                      {roleTranslations[user.role] || user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: tr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    {search ? "Arama kriterlerine uygun personel bulunamadı." : "Henüz kayıtlı personel bulunmuyor."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Personnel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Yeni Personel Kaydı</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ad Soyad *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register("name")}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Dr. Ahmet Yılmaz"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta (Kullanıcı Adı) *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register("email")}
                    type="email"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="ornek@hastane.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Şifre *</label>
                <div className="relative">
                  <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register("password")}
                    type="password"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="******"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rol / Yetki *</label>
                <select 
                  {...register("role")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="DOCTOR">Doktor</option>
                  <option value="SECRETARY">Sekreter</option>
                  <option value="ADMIN">Yönetici</option>
                  <option value="ACCOUNTING">Muhasebe</option>
                  <option value="LAB">Laboratuvar</option>
                </select>
                {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
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
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
