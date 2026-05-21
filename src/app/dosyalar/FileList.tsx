"use client";

import React, { useState } from "react";
import { 
  Upload, Search, FileText, Image as ImageIcon, FileCheck, Eye, Trash2, 
  Tag, Calendar, User, Download, ExternalLink, Grid, List, AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { uploadFile, deleteFile } from "./actions";
import { cn } from "@/lib/utils";

const FILE_TYPE_LABELS: Record<string, string> = {
  LAB_RESULT: "Laboratuvar Sonucu",
  XRAY: "Röntgen",
  CT: "BT (Tomografi)",
  MR: "MR (Rezonans)",
  ULTRASOUND: "Ultrason",
  PATHOLOGY: "Patoloji Raporu",
  PHOTO: "Klinik Fotoğraf"
};

const FILE_TYPE_COLORS: Record<string, string> = {
  LAB_RESULT: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
  XRAY: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/40",
  CT: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40",
  MR: "bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200 dark:border-violet-800/40",
  ULTRASOUND: "bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400 border-teal-200 dark:border-teal-800/40",
  PATHOLOGY: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  PHOTO: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
};

export default function FileList({ 
  initialFiles, 
  patients 
}: { 
  initialFiles: any[], 
  patients: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [files, setFiles] = useState(initialFiles);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPreview, setSelectedPreview] = useState<any>(null);

  // Form State
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      setErrorMsg("Lütfen geçerli bir dosya seçin.");
      setUploading(false);
      return;
    }

    try {
      const newFile = await uploadFile(formData);
      setFiles([newFile, ...files]);
      setIsModalOpen(false);
      e.currentTarget.reset();
    } catch (err: any) {
      setErrorMsg(err.message || "Dosya yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, patientId: string) => {
    if (confirm("Bu dosyayı arşivden tamamen silmek istediğinize emin misiniz?")) {
      try {
        await deleteFile(id, patientId);
        setFiles(files.filter(f => f.id !== id));
        if (selectedPreview?.id === id) {
          setSelectedPreview(null);
        }
      } catch (err) {
        alert("Dosya silinirken hata oluştu.");
      }
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = 
      f.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (f.patient?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || f.fileType === typeFilter;

    return matchesSearch && matchesType;
  });

  const isImage = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Dosya adı, hasta veya açıklama ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* File Type Filter */}
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tüm Dosya Türleri</option>
            {Object.keys(FILE_TYPE_LABELS).map((type) => (
              <option key={type} value={type}>{FILE_TYPE_LABELS[type]}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-1 rounded-md text-slate-500", viewMode === "grid" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "hover:text-slate-800")}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-1 rounded-md text-slate-500", viewMode === "list" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "hover:text-slate-800")}
            >
              <List size={16} />
            </button>
          </div>

          {/* Add file button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-xs shadow-md shadow-blue-500/20"
          >
            <Upload size={16} />
            Arşive Ekle
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div 
              key={file.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Media Preview Box */}
              <div className="aspect-video bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
                {isImage(file.filePath) ? (
                  <img 
                    src={file.filePath} 
                    alt={file.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350 cursor-pointer"
                    onClick={() => setSelectedPreview(file)}
                  />
                ) : (
                  <FileText className="text-slate-400 dark:text-slate-700" size={48} />
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setSelectedPreview(file)}
                    className="p-2 bg-white text-slate-800 hover:bg-slate-100 rounded-xl shadow-md transition-all"
                    title="Önizle"
                  >
                    <Eye size={16} />
                  </button>
                  <a 
                    href={file.filePath}
                    download={file.fileName}
                    className="p-2 bg-white text-slate-800 hover:bg-slate-100 rounded-xl shadow-md transition-all"
                    title="İndir"
                  >
                    <Download size={16} />
                  </a>
                  <button 
                    onClick={() => handleDelete(file.id, file.patientId)}
                    className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-md transition-all"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border block w-fit", FILE_TYPE_COLORS[file.fileType] || "")}>
                    {FILE_TYPE_LABELS[file.fileType] || file.fileType}
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate" title={file.fileName}>
                    {file.fileName}
                  </h4>
                  {file.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {file.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">
                      {file.patient?.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{format(new Date(file.uploadedAt), "dd MMM yyyy HH:mm", { locale: tr })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-semibold">
                  <th className="px-6 py-4">Dosya</th>
                  <th className="px-6 py-4">Tür</th>
                  <th className="px-6 py-4">Hasta</th>
                  <th className="px-6 py-4">Açıklama</th>
                  <th className="px-6 py-4">Yüklenme Tarihi</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                          {isImage(file.filePath) ? <ImageIcon size={18} /> : <FileText size={18} />}
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs block" title={file.fileName}>
                          {file.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", FILE_TYPE_COLORS[file.fileType] || "")}>
                        {FILE_TYPE_LABELS[file.fileType] || file.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {file.patient?.fullName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {file.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {format(new Date(file.uploadedAt), "dd MMM yyyy HH:mm", { locale: tr })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedPreview(file)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <a 
                          href={file.filePath}
                          download={file.fileName}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors"
                        >
                          <Download size={16} />
                        </a>
                        <button 
                          onClick={() => handleDelete(file.id, file.patientId)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Arşivde kayıtlı dosya bulunamadı.</p>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Upload size={20} className="text-blue-500" /> Arşive Dosya Yükle
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl">×</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Hasta Seçin *</label>
                <select name="patientId" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                  <option value="">Seçiniz</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Dosya Türü *</label>
                <select name="fileType" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                  {Object.keys(FILE_TYPE_LABELS).map((type) => (
                    <option key={type} value={type}>{FILE_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Kategori (Alt Kırılım / Örn: Sağ Eklem, Kan Değerleri)</label>
                <input name="category" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Örn: MRI-T2, Hemogram" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Açıklama / Klinik Bulgu Özeti</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Kısaca dosya içeriğinden bahsedin..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Dosya Seçin *</label>
                <input 
                  type="file" 
                  name="file" 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/30 dark:file:text-blue-400 hover:file:bg-blue-100 focus:outline-none" 
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">İptal</button>
                <button type="submit" disabled={uploading} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all">
                  {uploading ? "Yükleniyor..." : "Yüklemeyi Başlat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Drawer */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-bold text-base">{selectedPreview.fileName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hasta: {selectedPreview.patient?.fullName} • Tür: {FILE_TYPE_LABELS[selectedPreview.fileType]}</p>
              </div>
              <button onClick={() => setSelectedPreview(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl">×</button>
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-6 relative">
              {isImage(selectedPreview.filePath) ? (
                <img 
                  src={selectedPreview.filePath} 
                  alt={selectedPreview.fileName} 
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
                />
              ) : (
                <div className="text-center text-slate-400 space-y-4">
                  <FileText className="mx-auto text-slate-600" size={80} />
                  <p className="text-sm">Bu dosya türü doğrudan önizlenemiyor.</p>
                  <div className="flex justify-center gap-3">
                    <a 
                      href={selectedPreview.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-md transition-all"
                    >
                      <ExternalLink size={14} /> Yeni Sekmede Aç
                    </a>
                    <a 
                      href={selectedPreview.filePath}
                      download={selectedPreview.fileName}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-md transition-all border border-slate-700"
                    >
                      <Download size={14} /> Bilgisayara İndir
                    </a>
                  </div>
                </div>
              )}
            </div>

            {selectedPreview.description && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Klinik Not / Bulgu</span>
                <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
                  {selectedPreview.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
