"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, User, Heart, Pill, AlertTriangle, Users, Stethoscope,
  Scissors, FileText, Phone, Mail, MapPin, Calendar, Shield,
  Plus, Trash2, Save, Activity, Clock, ChevronRight, AlertCircle,
  Upload, Download, Eye, ExternalLink, Grid, List, Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { uploadFile, deleteFile } from "@/app/dosyalar/actions";
import {
  updatePatient, createAllergy, deleteAllergy,
  createMedication, deleteMedication,
  createFamilyHistory, deleteFamilyHistory,
  createSurgery, deleteSurgery
} from "./actions";

const TABS = [
  { id: "genel", label: "Genel Bilgiler", icon: User },
  { id: "tibbi", label: "Tıbbi Özgeçmiş", icon: Heart },
  { id: "ilaclar", label: "İlaçlar", icon: Pill },
  { id: "alerjiler", label: "Alerjiler", icon: AlertTriangle },
  { id: "soygecmis", label: "Soygeçmiş", icon: Users },
  { id: "muayeneler", label: "Muayeneler", icon: Stethoscope },
  { id: "ameliyatlar", label: "Ameliyatlar", icon: Scissors },
  { id: "dosyalar", label: "Dosyalar", icon: FileText },
];

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const RISK_LABELS: Record<string, string> = {
  LOW: "Düşük", MEDIUM: "Orta", HIGH: "Yüksek", CRITICAL: "Kritik",
};

export default function PatientDetail({ patient }: { patient: any }) {
  const [activeTab, setActiveTab] = useState("genel");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(patient);
  const [saving, setSaving] = useState(false);

  const age = patient.birthDate
    ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePatient(patient.id, {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
      });
      setEditMode(false);
    } catch (e) {
      alert("Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/hastalar" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{patient.fullName}</h1>
            {patient.riskStatus && patient.riskStatus !== "LOW" && (
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", RISK_COLORS[patient.riskStatus] || "")}>
                {RISK_LABELS[patient.riskStatus] || patient.riskStatus} Risk
              </span>
            )}
            {patient.allergies?.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} /> {patient.allergies.length} Alerji
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {patient.tcNo && `TC: ${patient.tcNo}`}
            {patient.protocolNo && ` • Protokol: ${patient.protocolNo}`}
            {age !== null && ` • ${age} yaş`}
            {patient.gender && ` • ${patient.gender === "MALE" ? "Erkek" : patient.gender === "FEMALE" ? "Kadın" : patient.gender}`}
            {patient.bloodGroup && ` • ${patient.bloodGroup}`}
          </p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium">İptal</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50">
                <Save size={16} /> {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">Düzenle</button>
          )}
        </div>
      </div>

      {/* Allergy Alert Banner */}
      {patient.allergies?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Alerji Uyarısı</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              {patient.allergies.map((a: any) => `${a.name} (${a.type === "DRUG" ? "İlaç" : a.type === "FOOD" ? "Gıda" : a.type === "LATEX" ? "Lateks" : "Diğer"})`).join(" • ")}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-b-0 border-slate-200 dark:border-slate-800"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={16} /> {tab.label}
            {tab.id === "alerjiler" && patient.allergies?.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{patient.allergies.length}</span>
            )}
            {tab.id === "ilaclar" && patient.medications?.filter((m: any) => m.isActive).length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{patient.medications.filter((m: any) => m.isActive).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        {activeTab === "genel" && <GenelTab data={formData} editMode={editMode} updateField={updateField} />}
        {activeTab === "tibbi" && <TibbiTab data={formData} editMode={editMode} updateField={updateField} />}
        {activeTab === "ilaclar" && <IlaclarTab patientId={patient.id} medications={patient.medications} />}
        {activeTab === "alerjiler" && <AlerjilerTab patientId={patient.id} allergies={patient.allergies} />}
        {activeTab === "soygecmis" && <SoygecmisTab patientId={patient.id} familyHistory={patient.familyHistory} />}
        {activeTab === "muayeneler" && <MuayenelerTab examinations={patient.examinations} />}
        {activeTab === "ameliyatlar" && <AmeliyatlarTab patientId={patient.id} surgeries={patient.surgeries} />}
        {activeTab === "dosyalar" && <DosyalarTab files={patient.fileAttachments || []} patientId={patient.id} />}
      </div>
    </div>
  );
}

// ========================
// FIELD HELPER
// ========================
function Field({ label, value, icon: Icon, editMode, onChange, type = "text", options }: any) {
  if (editMode) {
    if (options) {
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">{label}</label>
          <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">Seçiniz</option>
            {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    }
    if (type === "textarea") {
      return (
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-medium text-slate-500">{label}</label>
          <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">{Icon && <Icon size={12} />} {label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value || "—"}</p>
    </div>
  );
}

// ========================
// GENEL BİLGİLER
// ========================
function GenelTab({ data, editMode, updateField }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={18} className="text-blue-500" /> Kişisel Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Ad Soyad" value={data.fullName} icon={User} editMode={editMode} onChange={(v: string) => updateField("fullName", v)} />
          <Field label="TC Kimlik No" value={data.tcNo} editMode={editMode} onChange={(v: string) => updateField("tcNo", v)} />
          <Field label="Protokol No" value={data.protocolNo} editMode={editMode} onChange={(v: string) => updateField("protocolNo", v)} />
          <Field label="Doğum Tarihi" value={data.birthDate ? new Date(data.birthDate).toLocaleDateString("tr-TR") : null} editMode={editMode} type="date" onChange={(v: string) => updateField("birthDate", v)} />
          <Field label="Cinsiyet" value={data.gender === "MALE" ? "Erkek" : data.gender === "FEMALE" ? "Kadın" : data.gender} editMode={editMode} options={[{ value: "MALE", label: "Erkek" }, { value: "FEMALE", label: "Kadın" }]} onChange={(v: string) => updateField("gender", v)} />
          <Field label="Kan Grubu" value={data.bloodGroup} editMode={editMode} options={["A+","A-","B+","B-","AB+","AB-","0+","0-"].map(v => ({ value: v, label: v }))} onChange={(v: string) => updateField("bloodGroup", v)} />
          <Field label="Sigorta Bilgisi" value={data.insuranceInfo} editMode={editMode} onChange={(v: string) => updateField("insuranceInfo", v)} />
          <Field label="Risk Durumu" value={data.riskStatus ? ({ LOW: "Düşük", MEDIUM: "Orta", HIGH: "Yüksek", CRITICAL: "Kritik" } as any)[data.riskStatus] : null} editMode={editMode} options={[{ value: "LOW", label: "Düşük" }, { value: "MEDIUM", label: "Orta" }, { value: "HIGH", label: "Yüksek" }, { value: "CRITICAL", label: "Kritik" }]} onChange={(v: string) => updateField("riskStatus", v)} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Phone size={18} className="text-blue-500" /> İletişim</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Telefon" value={data.phone} icon={Phone} editMode={editMode} onChange={(v: string) => updateField("phone", v)} />
          <Field label="İkinci Telefon" value={data.secondPhone} icon={Phone} editMode={editMode} onChange={(v: string) => updateField("secondPhone", v)} />
          <Field label="E-posta" value={data.email} icon={Mail} editMode={editMode} onChange={(v: string) => updateField("email", v)} />
          <Field label="Adres" value={data.address} icon={MapPin} editMode={editMode} type="textarea" onChange={(v: string) => updateField("address", v)} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Yakın Bilgisi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Yakın Adı" value={data.relativeName} editMode={editMode} onChange={(v: string) => updateField("relativeName", v)} />
          <Field label="Yakın Telefonu" value={data.relativePhone} editMode={editMode} onChange={(v: string) => updateField("relativePhone", v)} />
          <Field label="Yakınlık Derecesi" value={data.relativeRelation} editMode={editMode} onChange={(v: string) => updateField("relativeRelation", v)} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield size={18} className="text-red-500" /> Acil Durum İletişim</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Acil Durum Kişisi" value={data.emergencyName} editMode={editMode} onChange={(v: string) => updateField("emergencyName", v)} />
          <Field label="Acil Durum Telefonu" value={data.emergencyPhone} editMode={editMode} onChange={(v: string) => updateField("emergencyPhone", v)} />
          <Field label="Yakınlık Derecesi" value={data.emergencyRelation} editMode={editMode} onChange={(v: string) => updateField("emergencyRelation", v)} />
        </div>
      </div>
    </div>
  );
}

// ========================
// TIBBİ ÖZGEÇMİŞ
// ========================
function TibbiTab({ data, editMode, updateField }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2"><Heart size={18} className="text-red-500" /> Tıbbi Özgeçmiş</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Kronik Hastalıklar" value={data.chronicDiseases} editMode={editMode} type="textarea" onChange={(v: string) => updateField("chronicDiseases", v)} />
        <Field label="Geçirilmiş Operasyonlar" value={data.pastOperations} editMode={editMode} type="textarea" onChange={(v: string) => updateField("pastOperations", v)} />
        <Field label="Sistemik Hastalıklar" value={data.systemicDiseases} editMode={editMode} type="textarea" onChange={(v: string) => updateField("systemicDiseases", v)} />
        <Field label="Önceki Hastane Kayıtları" value={data.previousHospitalRecords} editMode={editMode} type="textarea" onChange={(v: string) => updateField("previousHospitalRecords", v)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Sigara Kullanımı" value={data.smokingStatus === "AKTIF" ? "Aktif" : data.smokingStatus === "BIRAKTI" ? "Bıraktı" : data.smokingStatus === "YOK" ? "Yok" : data.smokingStatus} editMode={editMode} options={[{ value: "YOK", label: "Yok" }, { value: "BIRAKTI", label: "Bıraktı" }, { value: "AKTIF", label: "Aktif" }]} onChange={(v: string) => updateField("smokingStatus", v)} />
        <Field label="Alkol Kullanımı" value={data.alcoholStatus === "YOK" ? "Yok" : data.alcoholStatus === "ARA_SIRA" ? "Ara Sıra" : data.alcoholStatus === "DUZENLI" ? "Düzenli" : data.alcoholStatus} editMode={editMode} options={[{ value: "YOK", label: "Yok" }, { value: "ARA_SIRA", label: "Ara Sıra" }, { value: "DUZENLI", label: "Düzenli" }]} onChange={(v: string) => updateField("alcoholStatus", v)} />
      </div>
      <Field label="Notlar" value={data.notes} editMode={editMode} type="textarea" onChange={(v: string) => updateField("notes", v)} />
    </div>
  );
}

// ========================
// İLAÇLAR
// ========================
function IlaclarTab({ patientId, medications }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "", notes: "" });

  const handleAdd = async () => {
    if (!form.name) return;
    await createMedication(patientId, form);
    setForm({ name: "", dosage: "", frequency: "", notes: "" });
    setShowForm(false);
  };

  const activeMeds = medications.filter((m: any) => m.isActive);
  const inactiveMeds = medications.filter((m: any) => !m.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Pill size={18} className="text-blue-500" /> Kullanılan İlaçlar ({activeMeds.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all">
          <Plus size={16} /> Ekle
        </button>
      </div>
      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <input placeholder="İlaç Adı *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <input placeholder="Doz" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <input placeholder="Sıklık" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">Kaydet</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-all">İptal</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {activeMeds.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center">Aktif ilaç kaydı bulunmuyor.</p>}
        {activeMeds.map((m: any) => (
          <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-medium text-sm">{m.name}</p>
              <p className="text-xs text-slate-500">{[m.dosage, m.frequency].filter(Boolean).join(" • ")}</p>
            </div>
            <button onClick={() => deleteMedication(m.id, patientId)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================
// ALERJİLER
// ========================
function AlerjilerTab({ patientId, allergies }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "DRUG", severity: "MODERATE", reaction: "" });

  const handleAdd = async () => {
    if (!form.name) return;
    await createAllergy(patientId, form);
    setForm({ name: "", type: "DRUG", severity: "MODERATE", reaction: "" });
    setShowForm(false);
  };

  const typeLabels: Record<string, string> = { DRUG: "İlaç", FOOD: "Gıda", LATEX: "Lateks", OTHER: "Diğer" };
  const severityColors: Record<string, string> = { MILD: "bg-yellow-100 text-yellow-700", MODERATE: "bg-orange-100 text-orange-700", SEVERE: "bg-red-100 text-red-700" };
  const severityLabels: Record<string, string> = { MILD: "Hafif", MODERATE: "Orta", SEVERE: "Ciddi" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle size={18} className="text-red-500" /> Alerjiler ({allergies.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all">
          <Plus size={16} /> Ekle
        </button>
      </div>
      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
          <input placeholder="Alerjen Adı *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none">
            <option value="DRUG">İlaç</option><option value="FOOD">Gıda</option><option value="LATEX">Lateks</option><option value="OTHER">Diğer</option>
          </select>
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none">
            <option value="MILD">Hafif</option><option value="MODERATE">Orta</option><option value="SEVERE">Ciddi</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all">Kaydet</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-all">İptal</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {allergies.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center">Alerji kaydı bulunmuyor.</p>}
        {allergies.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-500" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{a.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{typeLabels[a.type] || a.type}</span>
                  {a.severity && <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", severityColors[a.severity] || "")}>{severityLabels[a.severity] || a.severity}</span>}
                </div>
                {a.reaction && <p className="text-xs text-slate-500 mt-0.5">Reaksiyon: {a.reaction}</p>}
              </div>
            </div>
            <button onClick={() => deleteAllergy(a.id, patientId)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================
// SOYGEÇMİŞ
// ========================
function SoygecmisTab({ patientId, familyHistory }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ condition: "", relation: "", notes: "" });

  const handleAdd = async () => {
    if (!form.condition) return;
    await createFamilyHistory(patientId, form);
    setForm({ condition: "", relation: "", notes: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Users size={18} className="text-purple-500" /> Aile Sağlık Geçmişi ({familyHistory.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
          <Plus size={16} /> Ekle
        </button>
      </div>
      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
          <input placeholder="Hastalık *" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
            <option value="">Yakınlık Seçiniz</option><option value="Anne">Anne</option><option value="Baba">Baba</option><option value="Kardeş">Kardeş</option><option value="Büyükanne">Büyükanne</option><option value="Büyükbaba">Büyükbaba</option><option value="Diğer">Diğer</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all">Kaydet</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-all">İptal</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {familyHistory.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center">Aile sağlık geçmişi kaydı bulunmuyor.</p>}
        {familyHistory.map((fh: any) => (
          <div key={fh.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-medium text-sm">{fh.condition}</p>
              {fh.relation && <p className="text-xs text-slate-500">Yakınlık: {fh.relation}</p>}
            </div>
            <button onClick={() => deleteFamilyHistory(fh.id, patientId)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================
// MUAYENELER (read-only list)
// ========================
function MuayenelerTab({ examinations }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2"><Stethoscope size={18} className="text-teal-500" /> Muayene Geçmişi ({examinations.length})</h3>
      {examinations.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center">Muayene kaydı bulunmuyor.</p>}
      {examinations.map((e: any) => (
        <div key={e.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-sm font-medium">{new Date(e.createdAt).toLocaleDateString("tr-TR")} {new Date(e.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
              {e.doctor?.name && <span className="text-xs text-slate-500">• Dr. {e.doctor.name}</span>}
            </div>
          </div>
          {e.complaint && <p className="text-sm"><span className="font-medium text-slate-500">Şikayet:</span> {e.complaint}</p>}
          {e.diagnosis && <p className="text-sm"><span className="font-medium text-slate-500">Tanı:</span> {e.diagnosis}</p>}
          {e.treatment && <p className="text-sm"><span className="font-medium text-slate-500">Tedavi:</span> {e.treatment}</p>}
          {e.notes && <p className="text-sm text-slate-500 italic">{e.notes}</p>}
        </div>
      ))}
    </div>
  );
}

// ========================
// AMELİYATLAR
// ========================
function AmeliyatlarTab({ patientId, surgeries }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", technique: "", anesthesiaType: "", operationNote: "", duration: "" });

  const handleAdd = async () => {
    if (!form.name) return;
    await createSurgery(patientId, form);
    setForm({ name: "", date: "", technique: "", anesthesiaType: "", operationNote: "", duration: "" });
    setShowForm(false);
  };

  const statusLabels: Record<string, string> = { PLANNED: "Planlandı", COMPLETED: "Tamamlandı", CANCELLED: "İptal" };
  const statusColors: Record<string, string> = { PLANNED: "bg-blue-100 text-blue-700", COMPLETED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-slate-100 text-slate-700" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Scissors size={18} className="text-indigo-500" /> Ameliyatlar ({surgeries.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
          <Plus size={16} /> Ekle
        </button>
      </div>
      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <input placeholder="Operasyon Adı *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <input placeholder="Teknik" value={form.technique} onChange={(e) => setForm({ ...form, technique: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <input placeholder="Anestezi Türü" value={form.anesthesiaType} onChange={(e) => setForm({ ...form, anesthesiaType: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <input placeholder="Süre (dk)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all">Kaydet</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-all">İptal</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {surgeries.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center">Ameliyat kaydı bulunmuyor.</p>}
        {surgeries.map((s: any) => (
          <div key={s.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-medium">{s.name}</p>
                <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", statusColors[s.status] || "")}>{statusLabels[s.status] || s.status}</span>
              </div>
              <button onClick={() => deleteSurgery(s.id, patientId)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={16} /></button>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              {s.date && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(s.date).toLocaleDateString("tr-TR")}</span>}
              {s.technique && <span>Teknik: {s.technique}</span>}
              {s.anesthesiaType && <span>Anestezi: {s.anesthesiaType}</span>}
              {s.duration && <span>Süre: {s.duration} dk</span>}
            </div>
            {s.operationNote && <p className="text-sm text-slate-600 dark:text-slate-400">{s.operationNote}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================
// DOSYALAR (Patient-specific file management)
// ========================

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
  ULTRASOUND: "bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400 border-teal-200 dark:border-slate-800/40",
  PATHOLOGY: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  PHOTO: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
};

function DosyalarTab({ files = [], patientId }: { files: any[], patientId: string }) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPreview, setSelectedPreview] = useState<any>(null);

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.append("patientId", patientId);

    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      setErrorMsg("Lütfen geçerli bir dosya seçin.");
      setUploading(false);
      return;
    }

    try {
      await uploadFile(formData);
      setShowUploadForm(false);
      e.currentTarget.reset();
    } catch (err: any) {
      setErrorMsg(err.message || "Dosya yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu dosyayı arşivden tamamen silmek istediğinize emin misiniz?")) {
      try {
        await deleteFile(id, patientId);
        if (selectedPreview?.id === id) {
          setSelectedPreview(null);
        }
      } catch (err) {
        alert("Dosya silinirken hata oluştu.");
      }
    }
  };

  const isImage = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
  };

  return (
    <div className="space-y-6">
      {/* Tab Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText size={18} className="text-emerald-500" />
          Hasta Dosya Arşivi ({files.length})
        </h3>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-800 text-xs">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-md text-slate-500 transition-all", viewMode === "grid" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "hover:text-slate-800 dark:hover:text-white")}
            >
              <Grid size={14} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-md text-slate-500 transition-all", viewMode === "list" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "hover:text-slate-800 dark:hover:text-white")}
            >
              <List size={14} />
            </button>
          </div>

          <button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/10 transition-all"
          >
            <Upload size={14} />
            Dosya Ekle
          </button>
        </div>
      </div>

      {/* Upload Form Box */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Yeni Dosya Yükle</h4>
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900/30">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Dosya Türü *</label>
              <select name="fileType" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                <option value="">Seçiniz</option>
                {Object.keys(FILE_TYPE_LABELS).map((type) => (
                  <option key={type} value={type}>{FILE_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Kategori / Bölüm</label>
              <input type="text" name="category" placeholder="Örn: Kardiyoloji, Check-up" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Dosya Seçin *</label>
              <input type="file" name="file" className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-slate-800 file:text-blue-700 dark:file:text-slate-300 hover:file:bg-blue-100 transition-all border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-950" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Açıklama / Klinik Bulgular</label>
            <textarea name="description" rows={2} placeholder="Dosya ile ilgili önemli notlar veya bulgular..." className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowUploadForm(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-all font-semibold">İptal</button>
            <button type="submit" disabled={uploading} className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5">
              {uploading ? "Yükleniyor..." : "Kaydet ve Yükle"}
            </button>
          </div>
        </form>
      )}

      {/* Grid/List Content */}
      {viewMode === "grid" ? (
        files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file) => (
              <div 
                key={file.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Preview Thumbnail */}
                <div className="aspect-video bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
                  {isImage(file.filePath) ? (
                    <img 
                      src={file.filePath} 
                      alt={file.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedPreview(file)}
                    />
                  ) : (
                    <FileText className="text-slate-400 dark:text-slate-700" size={36} />
                  )}
                  
                  {/* Hover Actions overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setSelectedPreview(file)}
                      className="p-1.5 bg-white text-slate-800 hover:bg-slate-100 rounded-lg shadow transition-all"
                      title="Önizle"
                    >
                      <Eye size={14} />
                    </button>
                    <a 
                      href={file.filePath}
                      download={file.fileName}
                      className="p-1.5 bg-white text-slate-800 hover:bg-slate-100 rounded-lg shadow transition-all"
                      title="İndir"
                    >
                      <Download size={14} />
                    </a>
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow transition-all"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border block w-fit", FILE_TYPE_COLORS[file.fileType] || "")}>
                      {FILE_TYPE_LABELS[file.fileType] || file.fileType}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate" title={file.fileName}>
                      {file.fileName}
                    </h4>
                    {file.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {file.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {file.category || "Genel Arşiv"}
                    </span>
                    <span>{format(new Date(file.uploadedAt), "dd MMM yyyy HH:mm", { locale: tr })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <FileText size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Henüz yüklenmiş bir dosya bulunmuyor.</p>
          </div>
        )
      ) : (
        /* List View */
        files.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3">Dosya Adı</th>
                    <th className="px-4 py-3">Tür</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Açıklama</th>
                    <th className="px-4 py-3">Tarih</th>
                    <th className="px-4 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-xs transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                            {isImage(file.filePath) ? <ImageIcon size={14} /> : <FileText size={14} />}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs block" title={file.fileName}>
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border", FILE_TYPE_COLORS[file.fileType] || "")}>
                          {FILE_TYPE_LABELS[file.fileType] || file.fileType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {file.category || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {file.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {format(new Date(file.uploadedAt), "dd MMM yyyy HH:mm", { locale: tr })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setSelectedPreview(file)}
                            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <a 
                            href={file.filePath}
                            download={file.fileName}
                            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded transition-colors"
                          >
                            <Download size={14} />
                          </a>
                          <button 
                            onClick={() => handleDelete(file.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <FileText size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Henüz yüklenmiş bir dosya bulunmuyor.</p>
          </div>
        )
      )}

      {/* Image Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-bold text-base">{selectedPreview.fileName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tür: {FILE_TYPE_LABELS[selectedPreview.fileType]}</p>
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
