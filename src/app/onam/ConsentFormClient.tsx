"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  FileSignature, 
  Plus, 
  Search, 
  Trash2, 
  Printer, 
  User, 
  FileText, 
  PenTool, 
  Check, 
  Calendar,
  X,
  FileCheck,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { createConsentForm, deleteConsentForm } from "./actions";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const CONSENT_TEMPLATES = {
  KVKK: {
    title: "KVKK Aydınlatma ve Açık Rıza Metni",
    text: `6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, kliniğimiz nezdinde işlenen kişisel verilerimin, özellikle sağlık verilerimin tıbbi teşhis, tedavi ve bakım hizmetlerinin yürütülmesi, randevu süreçlerinin yönetilmesi, yasal yükümlülüklerin yerine getirilmesi amacıyla kaydedilmesine, depolanmasına, güncellenmesine ve mevzuatın izin verdiği ölçüde ilgili üçüncü kişilere veya sağlık kuruluşlarına aktarılmasına açık rıza gösteriyorum.

Kişisel verilerimin işlenmesi ile ilgili haklarım konusunda (başvuru, düzeltme, silme talepleri dahil) aydınlatıldığımı beyan ederim.`
  },
  SURGERY: {
    title: "Cerrahi Girişim / Ameliyat Rıza Belgesi",
    text: `Hekimim tarafından bana önerilen cerrahi müdahalenin (operasyonun) amacı, riskleri, olası faydaları ve ameliyat esnasında karşılaşılabilecek komplikasyonlar (kanama, enfeksiyon, anestezi reaksiyonları, doku veya organ hasarı vb.) detaylı bir biçimde anlatıldı. 

Bu müdahalenin alternatif tedavi yöntemleri ve bu yöntemlerin riskleri hakkında bilgi edindim. Önerilen ameliyatın gerçekleştirilmesini özgür irademle kabul ediyor ve onaylıyorum.`
  },
  ANESTHESIA: {
    title: "Anestezi Uygulaması Onam Formu",
    text: `Gerçekleştirilecek operasyon için şahsıma uygulanacak anestezi türünün (genel, bölgesel, sedasyon vb.), anestezi hekimi tarafından uygulanacak işlemlerin ve bu işlemlerle ilişkili olası hayati tehlikeler dahil risklerin (solunum problemleri, alerjik reaksiyonlar, geçici veya kalıcı sinir hasarı vb.) farkındayım. 

Anestezi hekiminin operasyon sürecinde gerekli gördüğü tıbbi değişiklikleri yapmasına rıza gösteriyorum.`
  },
  TREATMENT: {
    title: "Genel Teşhis ve Tedavi Onam Formu",
    text: `Kliniğimizde uygulanacak fiziksel muayeneler, laboratuvar testleri, radyolojik tetkikler (röntgen, MR, tomografi vb.) ve hekimim tarafından reçete edilecek ilaç tedavilerinin faydaları, olası yan etkileri ve tedaviye uyum göstermediğim takdirde karşılaşabileceğim sağlık riskleri tarafıma açıklandı.

Önerilen tanısal ve tedaviye yönelik süreçleri kendi rızamla onaylıyorum.`
  }
};

const typeLabels: Record<string, string> = {
  KVKK: "KVKK Rıza Metni",
  SURGERY: "Ameliyat Onam Formu",
  ANESTHESIA: "Anestezi Onam Formu",
  TREATMENT: "Tedavi Onam Formu",
};

const typeColors: Record<string, string> = {
  KVKK: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  SURGERY: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  ANESTHESIA: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  TREATMENT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export default function ConsentFormClient({
  initialForms,
  patients
}: {
  initialForms: any[];
  patients: any[];
}) {
  const { theme } = useTheme();
  const [forms, setForms] = useState(initialForms);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState<any | null>(null);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedType, setSelectedType] = useState<"KVKK" | "SURGERY" | "ANESTHESIA" | "TREATMENT">("KVKK");
  const [editedText, setEditedText] = useState(CONSENT_TEMPLATES.KVKK.text);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setEditedText(CONSENT_TEMPLATES[selectedType].text);
  }, [selectedType]);

  // Canvas Signature Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = theme === "dark" ? "#ffffff" : "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    const coords = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    
    // Check if it's touch event
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedPatientId) {
      setFormError("Lütfen bir hasta seçiniz.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if signature is empty
    const isEmpty = isCanvasEmpty(canvas);
    if (isEmpty) {
      setFormError("Lütfen hastanın imzasını alınız.");
      return;
    }

    const signatureBase64 = canvas.toDataURL("image/png");

    try {
      setIsSubmitting(true);
      const newForm = await createConsentForm({
        patientId: selectedPatientId,
        type: selectedType,
        content: editedText,
        signature: signatureBase64,
      });

      setForms(prev => [newForm, ...prev]);
      setIsNewOpen(false);
      clearForm();
    } catch (err: any) {
      setFormError(err.message || "Onam formu kaydedilirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCanvasEmpty = (canvas: HTMLCanvasElement) => {
    const buffer = new Uint32Array(
      canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !buffer.some(color => color !== 0);
  };

  const clearForm = () => {
    setSelectedPatientId("");
    setSelectedType("KVKK");
    setEditedText(CONSENT_TEMPLATES.KVKK.text);
    setFormError("");
    clearCanvas();
  };

  const handleDelete = async (id: string, patientId: string) => {
    if (!confirm("Bu onam formunu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteConsentForm(id, patientId);
      setForms(prev => prev.filter(f => f.id !== id));
      if (selectedForm?.id === id) {
        setSelectedForm(null);
      }
    } catch (err) {
      alert("Form silinirken bir hata oluştu.");
    }
  };

  const filteredForms = forms.filter(f => 
    (f.patient.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeLabels[f.type] || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      
      {/* LEFT: Consent Forms List */}
      <div className={cn(
        "lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[calc(100vh-12rem)] min-h-[500px]",
        selectedForm ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Hasta adı veya form türü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setIsNewOpen(true);
              setSelectedForm(null);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25 shrink-0"
          >
            <Plus size={15} /> Yeni Form
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredForms.length === 0 ? (
            <div className="text-center py-12 text-slate-400 italic text-xs">
              Kayıtlı onam formu bulunmamaktadır.
            </div>
          ) : (
            filteredForms.map((f) => (
              <div
                key={f.id}
                onClick={() => {
                  setSelectedForm(f);
                  setIsNewOpen(false);
                }}
                className={cn(
                  "p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] flex flex-col gap-2 relative group",
                  selectedForm?.id === f.id ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20" : "bg-white dark:bg-slate-900"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold",
                    typeColors[f.type]
                  )}>
                    {typeLabels[f.type]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(f.signedAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5 mt-1">
                  <User size={14} className="text-slate-400" />
                  {f.patient.fullName}
                </div>

                <div className="text-slate-400 text-[10px] flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Protokol: {f.patient.protocolNo || "-"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(f.id, f.patientId);
                    }}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Detail View or Create Form */}
      <div className="lg:col-span-7 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
        {/* NEW FORM MODE */}
        {isNewOpen && (
          <form 
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-full animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <FileSignature className="text-blue-500" />
                Yeni Onam Belgesi İmzalama
              </h3>
              <button 
                type="button"
                onClick={() => setIsNewOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {/* Patient Selection & Template Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Hasta Seçimi</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Hasta seçin...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} {p.protocolNo ? `(Protokol: ${p.protocolNo})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Onam Belgesi Türü</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="KVKK">KVKK Aydınlatma Metni</option>
                    <option value="SURGERY">Cerrahi Girişim Rıza Belgesi</option>
                    <option value="ANESTHESIA">Anestezi Onam Formu</option>
                    <option value="TREATMENT">Genel Tedavi Onam Formu</option>
                  </select>
                </div>
              </div>

              {/* Dynamic content edit area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                  <span>Belge İçeriği</span>
                  <span className="text-[10px] text-slate-400 font-medium">Dokunarak düzenleyebilirsiniz</span>
                </label>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-40 px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed font-sans"
                  placeholder="Onam metni..."
                />
              </div>

              {/* Digital Signature Drawing Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <PenTool size={13} /> Dijital İmza Alanı
                  </span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] text-red-500 font-bold hover:underline"
                  >
                    Temizle
                  </button>
                </label>
                
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 cursor-crosshair touch-none"
                  />
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[9px] text-slate-400 font-medium pointer-events-none uppercase tracking-wider">
                    Buraya İmzalayın (Fare veya Dokunmatik Ekran)
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsNewOpen(false);
                  clearForm();
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-75"
              >
                {isSubmitting ? "Kaydediliyor..." : (
                  <>
                    <FileCheck size={16} /> Onam Formunu Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* DETAIL VIEW MODE */}
        {selectedForm && !isNewOpen && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-full animate-in fade-in duration-300 relative group">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/10">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {CONSENT_TEMPLATES[selectedForm.type as keyof typeof CONSENT_TEMPLATES]?.title || typeLabels[selectedForm.type]}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Bu belge, {new Date(selectedForm.signedAt).toLocaleString("tr-TR")} tarihinde dijital olarak imzalanmıştır.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold shadow-sm transition-all"
                  title="Yazdır / PDF Kaydet"
                >
                  <Printer size={15} />
                </button>
                <button 
                  onClick={() => setSelectedForm(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar print:overflow-visible">
              
              {/* Patient Information Panel */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 print:bg-white print:border-none print:p-0">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hasta Adı Soyadı</div>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1">{selectedForm.patient.fullName}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Protokol No</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{selectedForm.patient.protocolNo || "-"}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tarih / Saat</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    {new Date(selectedForm.signedAt).toLocaleDateString("tr-TR")} {new Date(selectedForm.signedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              {/* Consent Text */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">AÇIK RIZA & BEYAN METNİ</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedForm.content}
                </p>
              </div>

              {/* Signature Output */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 print:pt-6 print:border-t-2 print:border-slate-400">
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={16} />
                    DİJİTAL OLARAK İMZALANDI
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Hasta, yukarıdaki beyan metninin tamamını okuduğunu, <br />anladığını ve kendi hür iradesiyle imzaladığını beyan etmiştir.
                  </p>
                </div>

                <div className="text-center border border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950 w-52 print:border-none print:bg-white">
                  <div className="text-[9px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">HASTA İMZASI</div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-2 flex items-center justify-center border border-slate-100 dark:border-slate-800 h-20 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={selectedForm.signature} 
                      alt="Hasta Dijital İmzası" 
                      className="max-h-full max-w-full object-contain dark:invert"
                    />
                  </div>
                  <div className="text-[9px] font-bold text-slate-800 dark:text-slate-200 mt-2 truncate">
                    {selectedForm.patient.fullName}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* DEFAULT VIEW MODE */}
        {!selectedForm && !isNewOpen && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center justify-center text-center h-full animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-900/10 mb-6">
              <FileSignature size={32} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">Onam Belgeleri Yönetimi</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
              Sol taraftaki listeden bir form seçerek detayları ve dijital imzayı görüntüleyebilir veya "Yeni Form" butonuyla hastanıza yeni bir onam belgesi imzalattırabilirsiniz.
            </p>
            <button
              onClick={() => setIsNewOpen(true)}
              className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25"
            >
              <Plus size={16} /> Yeni Onam Belgesi Oluştur
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
