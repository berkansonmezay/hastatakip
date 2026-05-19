"use client";

import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2,
  Package,
  AlertTriangle,
  CalendarDays,
  Pill,
  Syringe,
  Box,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createInventoryItem, deleteInventoryItem, updateInventoryQuantity } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const inventoryItemSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır."),
  category: z.string().min(2, "Kategori seçilmelidir."),
  quantity: z.string().min(1, "Miktar girilmelidir."),
  unit: z.string().min(1, "Birim seçilmelidir."),
  unitPrice: z.string().min(1, "Birim fiyatı girilmelidir."),
  minThreshold: z.string().min(1, "Minimum sınır girilmelidir."),
  expiration: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventoryItemSchema>;

const categories = [
  { id: "İlaç", icon: <Pill size={16} /> },
  { id: "Sarf Malzeme", icon: <Syringe size={16} /> },
  { id: "Genel Malzeme", icon: <Box size={16} /> },
];

export default function InventoryList({ initialItems }: { initialItems: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(initialItems);
  const [updateQuantityId, setUpdateQuantityId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      category: "İlaç",
      unit: "Kutu",
      quantity: "0",
      minThreshold: "10",
      unitPrice: "0",
    }
  });

  const onSubmit = async (data: InventoryFormValues) => {
    try {
      const newItem = await createInventoryItem({
        ...data,
        quantity: parseFloat(data.quantity),
        minThreshold: parseFloat(data.minThreshold),
        unitPrice: parseFloat(data.unitPrice),
      });
      setItems([newItem, ...items]);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Hata:", error);
      alert("Ürün kaydedilirken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu ürünü stoktan silmek istediğinize emin misiniz?")) {
      try {
        await deleteInventoryItem(id);
        setItems(items.filter(i => i.id !== id));
      } catch (error) {
        alert("Ürün silinemedi.");
      }
    }
  };

  const handleUpdateQuantity = async (id: string) => {
    try {
      const updated = await updateInventoryQuantity(id, newQuantity);
      setItems(items.map(i => i.id === id ? updated : i));
      setUpdateQuantityId(null);
    } catch (error) {
      alert("Miktar güncellenemedi.");
    }
  };

  const filteredItems = items.filter(i => 
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Ürün Çeşidi</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Package size={24} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Kritik Stok Uyarıları</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">
              {items.filter(i => i.quantity <= i.minThreshold).length}
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Stok Değeri</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">
              {items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0).toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Ürün adı veya kategori ile ara..." 
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
          Yeni Ürün Ekle
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Ürün Bilgisi</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Miktar / Durum</th>
                <th className="px-6 py-4">Son Kullanma</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => {
                const isCritical = item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Birim Fiyat: {item.unitPrice} ₺</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {categories.find(c => c.id === item.category)?.icon || <Box size={14} />}
                        {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {updateQuantityId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-20 px-2 py-1 text-sm border border-slate-300 rounded dark:bg-slate-800 dark:border-slate-700" 
                            value={newQuantity}
                            onChange={e => setNewQuantity(Number(e.target.value))}
                            autoFocus
                          />
                          <button onClick={() => handleUpdateQuantity(item.id)} className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded hover:bg-green-200">Kaydet</button>
                          <button onClick={() => setUpdateQuantityId(null)} className="text-slate-500 text-xs font-bold px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">İptal</button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer group-hover:bg-slate-100 dark:group-hover:bg-slate-800 p-1 -ml-1 rounded transition-colors"
                          onClick={() => {
                            setUpdateQuantityId(item.id);
                            setNewQuantity(item.quantity);
                          }}
                          title="Miktarı Güncellemek İçin Tıklayın"
                        >
                          <div className={`text-base font-bold ${isCritical ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                            {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                          </div>
                          {isCritical && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                              <AlertTriangle size={10} /> Kritik
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.expiration ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <CalendarDays size={14} className="text-slate-400" />
                          {format(new Date(item.expiration), "dd MMM yyyy", { locale: tr })}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 italic">
                    {search ? "Arama kriterlerine uygun ürün bulunamadı." : "Henüz stokta ürün bulunmuyor."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold">Yeni Stok Kaydı</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ürün Adı *</label>
                <input 
                  {...register("name")}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Örn: Parol 500mg Tablet"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori *</label>
                  <select 
                    {...register("category")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Birim (Kutu, Adet vb.) *</label>
                  <input 
                    {...register("unit")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Örn: Kutu"
                  />
                  {errors.unit && <p className="text-xs text-red-500">{errors.unit.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Başlangıç Miktarı *</label>
                  <input 
                    type="number"
                    {...register("quantity")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kritik Stok Sınırı *</label>
                  <input 
                    type="number"
                    {...register("minThreshold")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    title="Miktar bu değerin altına düşerse uyarı verir"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Birim Fiyat (₺) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register("unitPrice")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Son Kullanma Tarihi</label>
                  <input 
                    type="date"
                    {...register("expiration")}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
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
