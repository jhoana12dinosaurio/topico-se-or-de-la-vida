import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";

type View = "dashboard" | "register" | "history" | "students" | "reports" | "informes" | "medications" | "settings" | "detail";

interface MedicationUsage {
  id: number;
  attentionId: number;
  patientName: string;
  medication: string;
  dose: string;
  date: string;
  time: string;
  notes: string;
}

interface Attention {
  id: number;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  educationLevel: "inicial" | "primaria" | "secundaria";
  date: string;
  time: string;
  reason: string;
  diagnosis: string;
  symptoms: string;
  vitals: string;
  imc?: number;
  medication?: string;
  hasRecipe?: boolean;
  treatment: string;
  observations: string;
  parentContact?: {
    contacted: boolean;
    callTime?: string;
    authorization?: boolean;
    authorizationTime?: string;
  };
  status: "atendido" | "pendiente" | "derivado";
}

const SAMPLE_DATA: Attention[] = [
  { id: 1, firstName: "Valentina", lastName: "Torres Ruiz", grade: "3°", section: "A", educationLevel: "primaria", date: "2026-08-20", time: "08:15", reason: "Dolor de cabeza", diagnosis: "Cefalea tensional", symptoms: "Cefalea, mareos leves", vitals: "T: 37.1°C, FC: 82 bpm, PA: 110/70", imc: 22.5, medication: "Paracetamol", hasRecipe: false, treatment: "Paracetamol 500mg, reposo 30 min", observations: "Mejoró satisfactoriamente", parentContact: { contacted: false }, status: "atendido" },
  { id: 2, firstName: "Sebastián", lastName: "Morales Díaz", grade: "5°", section: "B", educationLevel: "primaria", date: "2026-08-20", time: "09:40", reason: "Rotura / Accidente", diagnosis: "Herida en rodilla", symptoms: "Raspón en rodilla derecha, leve sangrado", vitals: "T: 36.8°C, FC: 90 bpm", imc: 24.1, treatment: "Limpieza y curación de herida", observations: "Se indicó a los padres cuidados en casa", parentContact: { contacted: true, callTime: "09:45", authorization: true }, status: "atendido" },
  { id: 3, firstName: "Camila", lastName: "Jiménez Paredes", grade: "1°", section: "C", educationLevel: "primaria", date: "2026-08-20", time: "10:55", reason: "Malestar estomacal", diagnosis: "Gastroenteritis leve", symptoms: "Náuseas, dolor abdominal", vitals: "T: 37.4°C, FC: 88 bpm", imc: 21.8, treatment: "Hidratación oral, reposo", observations: "Pendiente de evaluación médica", parentContact: { contacted: true, callTime: "10:58", authorization: false }, status: "pendiente" },
  { id: 4, firstName: "Mateo", lastName: "Quispe Sánchez", grade: "4°", section: "A", educationLevel: "primaria", date: "2026-08-20", time: "11:30", reason: "Fiebre", diagnosis: "Fiebre de origen desconocido", symptoms: "Temperatura elevada, escalofríos", vitals: "T: 38.5°C, FC: 96 bpm", imc: 23.2, treatment: "Derivado al centro de salud", observations: "Se llamó a los padres inmediatamente", parentContact: { contacted: true, callTime: "11:32", authorization: true }, status: "derivado" },
  { id: 5, firstName: "Luciana", lastName: "Vega Castro", grade: "2°", section: "B", educationLevel: "primaria", date: "2026-08-19", time: "14:20", reason: "Alergia", diagnosis: "Reacción alérgica leve", symptoms: "Ronchas en brazo, picazón", vitals: "T: 36.9°C, FC: 80 bpm", imc: 20.5, medication: "Antihistamínico", hasRecipe: false, treatment: "Antihistamínico, observación 20 min", observations: "Sin antecedentes previos de alergia", parentContact: { contacted: false }, status: "atendido" },
  { id: 6, firstName: "Diego", lastName: "Rojas Huanca", grade: "6°", section: "A", educationLevel: "secundaria", date: "2026-08-19", time: "08:00", reason: "Dolor de garganta", diagnosis: "Faringitis", symptoms: "Odinofagia, congestión nasal", vitals: "T: 37.6°C, FC: 84 bpm", imc: 23.8, treatment: "Reposo, indicaciones de hidratación", observations: "Se recomienda visita médica", parentContact: { contacted: false }, status: "pendiente" },
];

const GRADES = ["1°", "2°", "3°", "4°", "5°", "6°"];
const SECTIONS = ["A", "B", "C", "D"];
const EDUCATION_LEVELS = ["inicial", "primaria", "secundaria"];
const REASONS = ["Dolor de cabeza", "Malestar estomacal", "Caída / Trauma", "Rotura / Accidente", "Fiebre", "Alergia", "Dolor de garganta", "Mareos", "Cólico menstrual", "Herida / Corte", "Otro"];
const MEDICATIONS = ["Paracetamol", "Ibuprofeno", "Ampolla", "Antibiótico", "Antihistamínico", "Otro"];

const MEDICATION_CATALOG = [
  { name: "Paracetamol", stock: 48, presentation: "Tableta 500mg" },
  { name: "Ibuprofeno", stock: 32, presentation: "Tableta 400mg" },
  { name: "Ampolla", stock: 12, presentation: "Inyectable" },
  { name: "Antibiótico", stock: 20, presentation: "Suspensión" },
  { name: "Antihistamínico", stock: 26, presentation: "Jarabe" },
];

const INITIAL_MEDICATION_USAGES: MedicationUsage[] = SAMPLE_DATA
  .filter((a) => a.medication)
  .map((a) => ({
    id: a.id,
    attentionId: a.id,
    patientName: `${a.firstName} ${a.lastName}`,
    medication: a.medication || "",
    dose: "1 dosis",
    date: a.date,
    time: a.time,
    notes: "Registro migrado desde atención previa",
  }));

// Icons
const Icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  print: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="6,9 6,2 18,2 18,9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  cross: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <rect x="10" y="2" width="4" height="20" rx="2" /><rect x="2" y="10" width="20" height="4" rx="2" />
    </svg>
  ),
  stethoscope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 100 .3" />
      <path d="M8 15v1a6 6 0 006 6 6 6 0 006-6v-4" /><circle cx="20" cy="10" r="2" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
};

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
        <div className="text-blue-700 scale-90">{Icons.cross}</div>
      </div>
      <div className="leading-tight">
        <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-widest">Tópico Escolar</div>
        <div className="text-white font-bold text-sm leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>Señor de la Vida</div>
      </div>
    </div>
  );
}

// ─── UTILIDADES PDF ─────────────────────────────────────────────────────────
const generatePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("No se encontró el informe para descargar");

  if (document.fonts?.ready) await document.fonts.ready;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (clonedDocument) => {
      // Remover estilos Tailwind que contienen oklch incompatible con html2canvas
      clonedDocument.querySelectorAll("style, link[rel='stylesheet']").forEach((el) => {
        el.remove();
      });

      // Agregar estilos CSS básicos compatibles
      const basicStyle = clonedDocument.createElement("style");
      basicStyle.textContent = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito', sans-serif; background: #ffffff; color: #1e293b; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #cbd5e1; padding: 0.5rem; text-align: left; }
        th { background: #f1f5f9; font-weight: 700; }
        tr:nth-child(even) { background: #f8fafc; }
        h1, h2, h3 { color: #1e293b; font-weight: 700; }
        p { margin-bottom: 1rem; }
        .bg-white { background: #ffffff; }
        .bg-slate-100 { background: #f1f5f9; }
        .bg-slate-50 { background: #f8fafc; }
        .bg-blue-50 { background: #eff6ff; }
        .bg-blue-100 { background: #dbeafe; }
        .bg-blue-700 { background: #1d4ed8; color: #ffffff; }
        .text-blue-700 { color: #1d4ed8; }
        .text-blue-800 { color: #1e3a8a; }
        .text-blue-900 { color: #1e3a8a; }
        .text-slate-600 { color: #475569; }
        .text-slate-700 { color: #374151; }
        .border-b-2 { border-bottom: 2px solid #1d4ed8; }
        .border-slate-300 { border-color: #cbd5e1; }
        .font-bold { font-weight: 700; }
        .font-600 { font-weight: 600; }
        .uppercase { text-transform: uppercase; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-5 { margin-bottom: 1.25rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-10 { margin-top: 2.5rem; }
        .pb-2 { padding-bottom: 0.5rem; }
        .pb-4 { padding-bottom: 1rem; }
        .pt-2 { padding-top: 0.5rem; }
        .pt-3 { padding-top: 0.75rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .leading-relaxed { line-height: 1.625; }
      `;
      clonedDocument.head.appendChild(basicStyle);
    },
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = 210;
  const pageHeight = 297;
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  let remainingHeight = imageHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pageWidth, imageHeight);
  remainingHeight -= pageHeight;
  while (remainingHeight > 0) {
    position = remainingHeight - imageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imageHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save(filename);
};

// ─── HEADER PROFESIONAL ─────────────────────────────────────────────────────
function ReportHeader() {
  return (
    <div className="border-b-2 border-blue-700 pb-4 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs font-bold text-blue-800">INSTITUCIÓN EDUCATIVA PRIVADA</div>
          <div className="text-lg font-bold text-blue-900">Señor de la Vida</div>
          <div className="text-xs text-slate-600">Resolución Directoral Nº 02578 - SREP</div>
        </div>
        <div className="text-right">
          <div className="w-12 h-12 rounded-full border-2 border-blue-700 flex items-center justify-center text-2xl font-bold text-blue-700">✚</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Attention["status"] }) {
  const map = {
    atendido: "bg-emerald-100 text-emerald-700",
    pendiente: "bg-yellow-100 text-yellow-700",
    derivado: "bg-orange-100 text-orange-700",
  };
  const labels = { atendido: "Atendido", pendiente: "Pendiente", derivado: "Derivado" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-700 ${map[status]}`}>{labels[status]}</span>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-white border-l-4 border-emerald-500 rounded-xl shadow-xl px-5 py-4 animate-bounce-in" style={{ animation: "slideIn .3s ease" }}>
      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">{Icons.check}</div>
      <span className="text-sm font-600 text-slate-700">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">{Icons.x}</button>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: number | string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-800 text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</div>
        <div className="text-sm font-700 text-slate-700 mt-0.5">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

// ─── INFORME MENSUAL ────────────────────────────────────────────────────────
function MonthlyReport({ data }: { data: Attention[] }) {
  const currentMonth = "2026-08";
  const monthData = data.filter((a) => a.date.startsWith(currentMonth));
  
  const studentCounts = { alumnos: 0, docentes: 0, administrativo: 0 };
  monthData.forEach((a) => {
    if (a.educationLevel) studentCounts.alumnos++;
  });

  const reasonCounts: Record<string, number> = {};
  monthData.forEach((a) => { reasonCounts[a.reason] = (reasonCounts[a.reason] || 0) + 1; });
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  const medicated = monthData.filter((a) => a.medication).length;

  return (
    <div id="monthly-report" className="bg-white px-12 py-10 shadow-sm border border-slate-300 max-w-3xl mx-auto text-slate-900 min-h-[1050px] text-[13px] leading-relaxed">
      <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Institución Educativa Privada</div>
        <div className="text-xl font-extrabold text-blue-900 uppercase" style={{ fontFamily: "Outfit, sans-serif" }}>Señor de la Vida</div>
        <div className="text-[11px] text-slate-600">Tópico Escolar | Área de atención y cuidado estudiantil</div>
      </div>

      <div className="text-right mb-6 text-xs text-slate-700">Lima, 31 de agosto de 2026</div>
      <div className="mb-5 space-y-1 text-sm">
        <p><strong>INFORME N.° 001-2026-TÓPICO-IEP-SV</strong></p>
        <p><strong>A:</strong> Dirección de la Institución Educativa Señor de la Vida</p>
        <p><strong>DE:</strong> Lic. María García, responsable del Tópico Escolar</p>
        <p><strong>ASUNTO:</strong> Informe mensual de atenciones del Tópico Escolar</p>
        <p><strong>REFERENCIA:</strong> Registro de atenciones correspondiente a agosto de 2026</p>
      </div>

      <p className="mb-4 text-justify">
        Por medio del presente, me dirijo a usted para informar las actividades realizadas por el Tópico Escolar durante el mes de agosto de 2026. Las atenciones fueron registradas de acuerdo con el motivo de consulta, evaluación inicial, tratamiento brindado y seguimiento correspondiente.
      </p>

      <h3 className="font-bold uppercase text-center border-y border-slate-700 py-2 mb-3">I. Resumen de atenciones</h3>
      <table className="w-full border-collapse border border-slate-700 mb-5 text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-700 p-2 text-left">Concepto</th>
            <th className="border border-slate-700 p-2 text-center">Cantidad</th>
            <th className="border border-slate-700 p-2 text-left">Detalle</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border border-slate-700 p-2">Estudiantes atendidos</td><td className="border border-slate-700 p-2 text-center font-bold">{monthData.length}</td><td className="border border-slate-700 p-2">Atenciones registradas en el tópico</td></tr>
          <tr><td className="border border-slate-700 p-2">Medicamentos administrados</td><td className="border border-slate-700 p-2 text-center font-bold">{medicated}</td><td className="border border-slate-700 p-2">Con registro en la historia de atención</td></tr>
          <tr><td className="border border-slate-700 p-2">Casos pendientes</td><td className="border border-slate-700 p-2 text-center font-bold">{monthData.filter((a) => a.status === "pendiente").length}</td><td className="border border-slate-700 p-2">Requieren seguimiento</td></tr>
          <tr><td className="border border-slate-700 p-2">Casos derivados</td><td className="border border-slate-700 p-2 text-center font-bold">{monthData.filter((a) => a.status === "derivado").length}</td><td className="border border-slate-700 p-2">Referidos a un centro de salud</td></tr>
        </tbody>
      </table>

      <h3 className="font-bold uppercase text-center border-y border-slate-700 py-2 mb-3">II. Motivos de consulta</h3>
      <table className="w-full border-collapse border border-slate-700 mb-5 text-xs">
        <thead><tr className="bg-slate-100"><th className="border border-slate-700 p-2 text-left">Motivo</th><th className="border border-slate-700 p-2 text-center">N.° de casos</th></tr></thead>
        <tbody>
          {topReasons.map(([reason, count]) => <tr key={reason}><td className="border border-slate-700 p-2">{reason}</td><td className="border border-slate-700 p-2 text-center">{count}</td></tr>)}
          <tr className="font-bold bg-slate-100"><td className="border border-slate-700 p-2">TOTAL</td><td className="border border-slate-700 p-2 text-center">{monthData.length}</td></tr>
        </tbody>
      </table>

      <h3 className="font-bold uppercase text-center border-y border-slate-700 py-2 mb-3">III. Conclusiones</h3>
      <p className="mb-2 text-justify">Se brindó atención inicial a los estudiantes que acudieron al Tópico Escolar, dejando constancia de cada caso en el registro institucional.</p>
      <p className="mb-8 text-justify">Los casos que requirieron comunicación con los padres o derivación fueron gestionados según la situación presentada. Se recomienda continuar con el seguimiento de los casos pendientes.</p>

      <div className="mt-10 text-center text-xs">
        <div className="mx-auto mb-2 w-48 border-t border-slate-700 pt-2">Lic. María García</div>
        <div>Responsable del Tópico Escolar</div>
        <div>IEP Señor de la Vida</div>
      </div>

      <div className="border-t border-slate-400 mt-10 pt-3 text-[10px] text-slate-500 flex justify-between">
        <span>Documento generado por el Tópico Escolar</span>
        <span>Informe mensual | Agosto 2026</span>
      </div>
    </div>
  );
}

// ─── INFORME DE INCIDENCIAS ─────────────────────────────────────────────────
function IncidenceReport({ data }: { data: Attention[] }) {
  const currentMonth = "2026-08";
  const incidentTypes = ["Rotura / Accidente", "Caída / Trauma", "Herida / Corte"];
  const monthData = data.filter((a) => a.date.startsWith(currentMonth) && incidentTypes.includes(a.reason));

  return (
    <div id="incidence-report" className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-4xl mx-auto text-slate-900">
      <ReportHeader />
      
      <h1 className="text-2xl font-bold text-center text-red-800 mb-2">Reporte de Incidencias y Traumatismos</h1>
      <p className="text-center text-sm text-slate-600 mb-6">Mes de Agosto de 2026</p>

      {monthData.length === 0 ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-center py-8">
          <p className="text-green-800 font-600">✓ Sin incidencias registradas en el mes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {monthData.map((inc) => (
            <div key={inc.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-bold text-slate-700">Estudiante:</span> {inc.firstName} {inc.lastName}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Grado:</span> {inc.grade} "{inc.section}"
                </div>
                <div>
                  <span className="font-bold text-slate-700">Fecha:</span> {inc.date} - {inc.time}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Tipo:</span> <span className="text-red-700 font-bold">{inc.reason}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-700">Diagnóstico:</span> {inc.diagnosis}
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-700">Síntomas:</span> {inc.symptoms}
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-700">Tratamiento:</span> {inc.treatment}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t-2 border-blue-700 pt-4 mt-6">
        <p className="text-xs text-slate-600 text-center">
          <strong>Reportados por:</strong> Técnica en Enfermería<br />
          <strong>Fecha:</strong> {new Date().toLocaleDateString("es-PE")} | <strong>Total de incidencias:</strong> {monthData.length}
        </p>
      </div>
    </div>
  );
}

// ─── COMPROBANTE DE SALIDA ──────────────────────────────────────────────────
function ExitVoucherReport({ attention }: { attention: Attention | null }) {
  if (!attention) return <div className="text-center text-slate-600">Selecciona una atención para generar comprobante</div>;

  return (
    <div id="exit-voucher" className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto text-slate-900">
      <ReportHeader />
      
      <h1 className="text-xl font-bold text-center text-blue-900 mb-6 border-b-2 border-blue-700 pb-4">COMPROBANTE DE SALIDA ESCOLAR</h1>

      <div className="space-y-4 text-sm mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-slate-700">Código único:</span>
            <div className="bg-slate-100 p-2 rounded font-mono text-xs mt-1">{`ATT-${attention.id.toString().slice(-6)}`}</div>
          </div>
          <div>
            <span className="font-bold text-slate-700">Fecha:</span>
            <div className="bg-slate-100 p-2 rounded mt-1">{attention.date}</div>
          </div>
        </div>

        <div>
          <span className="font-bold text-slate-700">Estudiante:</span>
          <div className="bg-slate-100 p-2 rounded mt-1">{attention.firstName} {attention.lastName}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-slate-700">Grado:</span>
            <div className="bg-slate-100 p-2 rounded mt-1">{attention.grade}</div>
          </div>
          <div>
            <span className="font-bold text-slate-700">Sección:</span>
            <div className="bg-slate-100 p-2 rounded mt-1">{attention.section}</div>
          </div>
        </div>

        <div>
          <span className="font-bold text-slate-700">Hora de salida autorizada:</span>
          <div className="bg-slate-100 p-2 rounded mt-1">{attention.time}</div>
        </div>

        <div>
          <span className="font-bold text-slate-700">Motivo de la consulta:</span>
          <div className="bg-slate-100 p-2 rounded mt-1">{attention.reason} - {attention.diagnosis}</div>
        </div>

        <div>
          <span className="font-bold text-slate-700">Atendido por:</span>
          <div className="bg-slate-100 p-2 rounded mt-1">Lic. María García - Enfermera Escolar</div>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded my-6">
        <p className="font-bold text-green-800">✓ AUTORIZACIÓN CONFIRMADA</p>
        <p className="text-xs text-green-700 mt-1">El estudiante está autorizado para retirarse de la institución por atención en el tópico escolar.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8 text-center text-xs">
        <div>
          <p className="font-bold mb-12">_____________________</p>
          <p className="font-bold">Lic. María García</p>
          <p>Enfermera Escolar</p>
        </div>
        <div>
          <p className="font-bold mb-12">_____________________</p>
          <p className="font-bold">Firma Apoderado</p>
          <p>Recibido</p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t">Documento generado automáticamente por el Sistema de Tópico - {new Date().toLocaleString("es-PE")}</p>
    </div>
  );
}

// ─── INFORMES AUTOMATIZADOS ─────────────────────────────────────────────────
function AutomatedReports({ data, onViewAttention }: { data: Attention[]; onViewAttention: (a: Attention) => void }) {
  const [reportType, setReportType] = useState<"monthly" | "incidence" | "voucher">("monthly");
  const [selectedAttention, setSelectedAttention] = useState<Attention | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const download = async (elementId: string, filename: string) => {
    setDownloading(true);
    setDownloadError("");
    try {
      await generatePDF(elementId, filename);
    } catch (error) {
      console.error("No se pudo generar el PDF", error);
      setDownloadError("No se pudo descargar el informe. Inténtalo nuevamente.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab selector */}
      <div className="flex gap-3 flex-wrap">
        {[
          { id: "monthly", label: "📋 Informe Mensual", icon: "📊" },
          { id: "incidence", label: "🚨 Reporte de Incidencias", icon: "⚠️" },
          { id: "voucher", label: "📄 Comprobante de Salida", icon: "📝" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-5 py-3 rounded-xl font-600 text-sm transition-all ${
              reportType === tab.id
                ? "bg-blue-700 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report selector for voucher */}
      {reportType === "voucher" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-700 text-slate-800 mb-4">Selecciona una atención para generar comprobante</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAttention(a)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedAttention?.id === a.id
                    ? "bg-blue-50 border-blue-500"
                    : "bg-slate-50 border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="font-600 text-slate-800">{a.firstName} {a.lastName}</div>
                <div className="text-xs text-slate-500">{a.grade} "{a.section}" - {a.date} {a.time} - {a.reason}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report preview and download */}
      <div className="space-y-4">
        {downloadError && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">{downloadError}</div>}
        {reportType === "monthly" && (
          <div>
            <MonthlyReport data={data} />
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => download("monthly-report", "Informe_Mensual_Agosto_2026.pdf")}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-wait text-white font-600 transition-colors shadow-md"
              >
                {Icons.download} {downloading ? "Generando PDF..." : "Descargar PDF"}
              </button>
            </div>
          </div>
        )}

        {reportType === "incidence" && (
          <div>
            <IncidenceReport data={data} />
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => download("incidence-report", "Reporte_Incidencias_Agosto_2026.pdf")}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-600 transition-colors shadow-md"
              >
                {Icons.download} Descargar PDF
              </button>
            </div>
          </div>
        )}

        {reportType === "voucher" && selectedAttention && (
          <div>
            <ExitVoucherReport attention={selectedAttention} />
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => download("exit-voucher", `Comprobante_Salida_${selectedAttention.firstName}_${selectedAttention.lastName}.pdf`)}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-600 transition-colors shadow-md"
              >
                {Icons.download} Descargar Comprobante
              </button>
            </div>
          </div>
        )}

        {reportType === "voucher" && !selectedAttention && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded text-yellow-800 text-sm">
            Selecciona una atención de la lista arriba para generar el comprobante de salida.
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ data, onView, onRegister }: { data: Attention[]; onView: (a: Attention) => void; onRegister: () => void }) {
  const today = "2026-08-20";
  const todayData = data.filter((a) => a.date === today);
  const pending = data.filter((a) => a.status === "pendiente");
  const derived = data.filter((a) => a.status === "derivado");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <div className="text-blue-200 text-sm font-600 mb-1">Miércoles, 20 de agosto de 2026</div>
          <h1 className="text-2xl font-800" style={{ fontFamily: "Outfit, sans-serif" }}>¡Buenos días, Lic. García!</h1>
          <p className="text-blue-100 text-sm mt-1">Tienes {pending.length} caso{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""} de seguimiento hoy.</p>
        </div>
        <button
          onClick={onRegister}
          className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-700 text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-lg flex-shrink-0"
        >
          {Icons.plus}
          Registrar atención
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Atenciones del día" value={todayData.length} sub="Hoy, 20 ago" color="bg-blue-100 text-blue-600" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} />
        <StatCard label="Estudiantes únicos" value={new Set(data.map((a) => `${a.firstName} ${a.lastName}`)).size} sub="Total del mes" color="bg-emerald-100 text-emerald-600" icon={Icons.users} />
        <StatCard label="Casos pendientes" value={pending.length} sub="Requieren seguimiento" color="bg-yellow-100 text-yellow-600" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>} />
        <StatCard label="Derivaciones" value={derived.length} sub="Al centro de salud" color="bg-orange-100 text-orange-600" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><polyline points="9,18 15,12 9,6" /></svg>} />
      </div>

      {/* Recent table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-700 text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Atenciones recientes</h2>
          <span className="text-xs text-slate-400">{data.length} registros totales</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Estudiante", "Grado", "Motivo", "Fecha", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-700 text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((a, i) => (
                <tr key={a.id} className={`border-t border-slate-50 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  <td className="px-5 py-3.5 font-600 text-slate-700">{a.firstName} {a.lastName}</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.grade} "{a.section}"</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.reason}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{a.date} {a.time}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => onView(a)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Ver detalle">{Icons.eye}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER FORM ───────────────────────────────────────────────────────────
function RegisterForm({ onSave }: { onSave: (a: Attention) => void }) {
  type FormState = Omit<Attention, 'id' | 'parentContact'> & {
    parentContact: NonNullable<Attention['parentContact']>;
  };
  type FormFieldKey = Exclude<keyof FormState, 'parentContact'>;
  
  const [form, setForm] = useState<FormState>({
    firstName: "", lastName: "", grade: "1°", section: "A", educationLevel: "primaria",
    date: "2026-08-20", time: "12:00", reason: "", diagnosis: "", symptoms: "", vitals: "", imc: undefined,
    medication: "", hasRecipe: false, treatment: "", observations: "",
    parentContact: { contacted: false, callTime: "", authorization: false },
    status: "atendido",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends FormFieldKey>(k: K, v: FormState[K] | string) => {
    if (k === "imc") {
      setForm((f) => ({ ...f, [k]: v ? parseFloat(String(v)) : undefined } as FormState));
    } else {
      setForm((f) => ({ ...f, [k]: v } as FormState));
    }
  };
  const setParentContact = <K extends keyof FormState['parentContact']>(subKey: K, v: FormState['parentContact'][K]) =>
    setForm((f) => ({ ...f, parentContact: { ...f.parentContact, [subKey]: v } }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Nombre requerido";
    if (!form.lastName.trim()) e.lastName = "Apellido requerido";
    if (!form.reason.trim()) e.reason = "Motivo requerido";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnóstico requerido";
    if (!form.symptoms.trim()) e.symptoms = "Síntomas requeridos";
    if (!form.treatment.trim()) e.treatment = "Tratamiento requerido";
    if (form.medication === "Ampolla" && !form.hasRecipe) {
      e.medication = "⚠️ Ampolla SOLO con receta médica. Marque la casilla de receta.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ id: Date.now(), ...form } as Attention);
    setForm({ firstName: "", lastName: "", grade: "1°", section: "A", educationLevel: "primaria", date: "2026-08-20", time: "12:00", reason: "", diagnosis: "", symptoms: "", vitals: "", imc: undefined, medication: "", hasRecipe: false, treatment: "", observations: "", parentContact: { contacted: false, callTime: "", authorization: false }, status: "atendido" });
  };

  const field = (label: string, key: FormFieldKey, type = "text", opts?: string[]) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">{label}</label>
      {opts ? (
        <select value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white">
          {opts.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={type === "number" && form[key] === undefined ? "" : String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} className={`rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white ${errors[key] ? "border-red-300" : "border-slate-200"}`} />
      )}
      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  const textarea = (label: string, key: FormFieldKey) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">{label}</label>
      <textarea rows={3} value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} className={`rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white resize-none ${errors[key] ? "border-red-300" : "border-slate-200"}`} />
      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-800 text-lg text-blue-800 mb-5" style={{ fontFamily: "Outfit, sans-serif" }}>Datos del estudiante</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {field("Nombre", "firstName")}
          {field("Apellido", "lastName")}
          {field("Nivel educativo", "educationLevel", "text", EDUCATION_LEVELS)}
          {field("Grado", "grade", "text", GRADES)}
          {field("Sección", "section", "text", SECTIONS)}
          {field("Estado de la atención", "status", "text", ["atendido", "pendiente", "derivado"])}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-800 text-lg text-blue-800 mb-5" style={{ fontFamily: "Outfit, sans-serif" }}>Fecha y hora</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("Fecha", "date", "date")}
          {field("Hora", "time", "time")}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-800 text-lg text-blue-800 mb-5" style={{ fontFamily: "Outfit, sans-serif" }}>Información clínica</h2>
        <div className="grid grid-cols-1 gap-4">
          {field("Motivo de consulta", "reason", "text", REASONS)}
          {field("Diagnóstico", "diagnosis")}
          {textarea("Síntomas", "symptoms")}
          {field("Signos vitales (T°, FC, PA, etc.)", "vitals")}
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1">{field("IMC", "imc", "number")}</div>
          </div>
          {textarea("Atención o tratamiento realizado", "treatment")}
          {textarea("Observaciones", "observations")}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-800 text-lg text-blue-800 mb-5" style={{ fontFamily: "Outfit, sans-serif" }}>Medicamento y autorización</h2>
        <div className="grid grid-cols-1 gap-4">
          {field("Medicamento administrado", "medication", "text", ["", ...MEDICATIONS])}
          {form.medication && (
            <label className="flex items-center gap-3 cursor-pointer bg-blue-50 border border-blue-200 rounded-xl p-3">
              <input type="checkbox" checked={form.hasRecipe} onChange={(e) => set("hasRecipe", e.target.checked)} className="w-5 h-5 rounded border-blue-300 accent-blue-600" />
              <span className="text-sm font-600 text-blue-700">¿Tiene receta médica? {form.medication === "Ampolla" && <span className="text-red-600">*Obligatorio para ampollas</span>}</span>
            </label>
          )}
          {errors.medication && <p className="text-xs text-red-500">{errors.medication}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-800 text-lg text-blue-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Contacto con padres / apoderado</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setParentContact("contacted", !form.parentContact.contacted)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.parentContact.contacted ? "bg-blue-600" : "bg-slate-200"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.parentContact.contacted ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm font-600 text-slate-700">Se contactó a los padres / apoderado</span>
          </label>

          {form.parentContact.contacted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">Hora de la llamada</label>
                <input type="time" value={form.parentContact.callTime || ""} onChange={(e) => setParentContact("callTime", e.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.parentContact.authorization || false} onChange={(e) => setParentContact("authorization", e.target.checked)} className="w-5 h-5 rounded border-slate-300 accent-green-600" />
                <span className="text-sm font-600 text-slate-700">Autorización obtenida para tratamiento</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => setForm({ firstName: "", lastName: "", grade: "1°", section: "A", educationLevel: "primaria", date: "2026-08-20", time: "12:00", reason: "", diagnosis: "", symptoms: "", vitals: "", imc: undefined, medication: "", hasRecipe: false, treatment: "", observations: "", parentContact: { contacted: false, callTime: "", authorization: false }, status: "atendido" })} className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-700 text-slate-600 hover:bg-slate-50 transition-colors">
          Limpiar
        </button>
        <button type="submit" className="px-7 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-700 text-sm flex items-center gap-2 transition-colors shadow-sm">
          {Icons.check} Guardar atención
        </button>
      </div>
    </form>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
function History({ data, onView }: { data: Attention[]; onView: (a: Attention) => void }) {
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterDate, setFilterDate] = useState("");

  const filtered = data.filter((a) => {
    const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase());
    const matchGrade = filterGrade === "Todos" || a.grade === filterGrade;
    const matchStatus = filterStatus === "Todos" || a.status === filterStatus;
    const matchDate = !filterDate || a.date === filterDate;
    return matchSearch && matchGrade && matchStatus && matchDate;
  });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{Icons.search}</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o motivo..." className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
          </div>
          <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option>Todos</option>
            {GRADES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option>Todos</option>
            <option value="atendido">Atendido</option>
            <option value="pendiente">Pendiente</option>
            <option value="derivado">Derivado</option>
          </select>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-700 text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Historial de atenciones</h2>
          <span className="text-xs text-slate-400">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Estudiante", "Grado", "Motivo", "Medicamento", "Fecha", "Hora", "Padres", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-700 text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No se encontraron registros</td></tr>
              ) : filtered.map((a, i) => (
                <tr key={a.id} className={`border-t border-slate-50 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  <td className="px-5 py-3.5 font-600 text-slate-700">{a.firstName} {a.lastName}</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.grade} "{a.section}"</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.reason}</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.medication ? <span className="text-emerald-700 font-600">{a.medication}</span> : <span className="text-slate-300 text-xs">Sin medicación</span>}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{a.date}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{a.time}</td>
                  <td className="px-5 py-3.5">{a.parentContact?.contacted ? <span className="text-emerald-600 text-xs font-700">Sí</span> : <span className="text-slate-300 text-xs">No</span>}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3.5 flex gap-1">
                    <button onClick={() => onView(a)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Ver">{Icons.eye}</button>
                    <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors" title="Editar">{Icons.edit}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MEDICATIONS ────────────────────────────────────────────────────────────
function Medications({
  data,
  usages,
  onRegisterUsage,
}: {
  data: Attention[];
  usages: MedicationUsage[];
  onRegisterUsage: (usage: MedicationUsage) => void;
}) {
  const [attentionId, setAttentionId] = useState<number | "">("");
  const [medication, setMedication] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("2026-08-20");
  const [time, setTime] = useState("12:30");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!attentionId) e.attentionId = "Selecciona un paciente";
    if (!medication) e.medication = "Selecciona un medicamento";
    if (!dose.trim()) e.dose = "Indica dosis o cantidad";
    if (!date) e.date = "Fecha requerida";
    if (!time) e.time = "Hora requerida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedAttention = data.find((a) => a.id === attentionId);
    if (!selectedAttention) return;

    onRegisterUsage({
      id: Date.now(),
      attentionId: selectedAttention.id,
      patientName: `${selectedAttention.firstName} ${selectedAttention.lastName}`,
      medication,
      dose: dose.trim(),
      date,
      time,
      notes: notes.trim(),
    });

    setAttentionId("");
    setMedication("");
    setDose("");
    setNotes("");
    setErrors({});
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-700 text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Stock de medicamentos</h2>
          <div className="space-y-3">
            {MEDICATION_CATALOG.map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-700 text-slate-800 text-sm">{item.name}</div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-700 ${item.stock <= 15 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {item.stock} en stock
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{item.presentation}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-700 text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Registrar medicamento en historial</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">Paciente (atención)</label>
                <select
                  value={attentionId}
                  onChange={(e) => setAttentionId(e.target.value ? Number(e.target.value) : "")}
                  className={`rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.attentionId ? "border-red-300" : "border-slate-200"}`}
                >
                  <option value="">Seleccionar atención</option>
                  {data.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.firstName} {a.lastName} - {a.date} {a.time}
                    </option>
                  ))}
                </select>
                {errors.attentionId && <p className="text-xs text-red-500">{errors.attentionId}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">Medicamento</label>
                <select
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className={`rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.medication ? "border-red-300" : "border-slate-200"}`}
                >
                  <option value="">Seleccionar medicamento</option>
                  {MEDICATIONS.filter((m) => m !== "Otro").map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.medication && <p className="text-xs text-red-500">{errors.medication}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">Dosis / cantidad</label>
                <input
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="Ej. 1 tableta de 500mg"
                  className={`rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.dose ? "border-red-300" : "border-slate-200"}`}
                />
                {errors.dose && <p className="text-xs text-red-500">{errors.dose}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.date ? "border-red-300" : "border-slate-200"}`}
                  />
                  {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">Hora</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.time ? "border-red-300" : "border-slate-200"}`}
                  />
                  {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-700 text-slate-600 uppercase tracking-wide">Observación (opcional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Paciente toleró correctamente la medicación"
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-sm font-700 transition-colors">
                Guardar en historial
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-700 text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Últimos medicamentos administrados</h2>
          <span className="text-xs text-slate-400">{usages.length} registro{usages.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Paciente", "Medicamento", "Dosis", "Fecha", "Hora", "Observación"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-700 text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usages.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Sin registros de medicación</td></tr>
              ) : usages.slice(0, 10).map((u, i) => (
                <tr key={u.id} className={`border-t border-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  <td className="px-5 py-3.5 font-600 text-slate-700">{u.patientName}</td>
                  <td className="px-5 py-3.5 text-emerald-700 font-700">{u.medication}</td>
                  <td className="px-5 py-3.5 text-slate-600">{u.dose}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.date}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.time}</td>
                  <td className="px-5 py-3.5 text-slate-500">{u.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL VIEW ─────────────────────────────────────────────────────────────
function DetailView({ attention, onBack }: { attention: Attention; onBack: () => void }) {
  const [editing, setEditing] = useState(false);
  const [notif, setNotif] = useState("");

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="sm:w-48 text-xs font-700 text-slate-500 uppercase tracking-wide flex-shrink-0">{label}</div>
      <div className="text-sm text-slate-700 font-500">{value}</div>
    </div>
  );

  const triggerNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(""), 3000);
  };

  return (
    <div className="space-y-5">
      {notif && <Toast message={notif} onClose={() => setNotif("")} />}

      {/* Header bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-600 text-slate-500 hover:text-blue-700 transition-colors">
          {Icons.back} Volver
        </button>
        <div className="flex-1" />
        <button onClick={() => triggerNotif("Imprimiendo registro...")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
          {Icons.print} Imprimir
        </button>
        <button onClick={() => triggerNotif("Registro exportado como PDF")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
          {Icons.download} Exportar
        </button>
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-sm font-600 transition-colors">
          {Icons.edit} {editing ? "Cerrar edición" : "Editar"}
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Top accent */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-800" style={{ fontFamily: "Outfit, sans-serif" }}>{attention.firstName} {attention.lastName}</h2>
              <p className="text-blue-200 text-sm mt-1">{attention.grade} Grado – Sección "{attention.section}" – {attention.educationLevel.toUpperCase()}</p>
            </div>
            <StatusBadge status={attention.status} />
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="md:pr-8 pb-6 md:pb-0">
            <h3 className="font-700 text-sm text-blue-700 mb-3 uppercase tracking-wide">Datos de la atención</h3>
            <InfoRow label="Fecha" value={attention.date} />
            <InfoRow label="Hora" value={attention.time} />
            <InfoRow label="Motivo de consulta" value={attention.reason} />
            <InfoRow label="Diagnóstico" value={attention.diagnosis} />
            <InfoRow label="Síntomas" value={attention.symptoms} />
            <InfoRow label="Signos vitales" value={attention.vitals || "No registrado"} />
            <InfoRow label="IMC" value={attention.imc ? attention.imc.toString() : "No registrado"} />
          </div>
          <div className="md:pl-8 pt-6 md:pt-0">
            <h3 className="font-700 text-sm text-blue-700 mb-3 uppercase tracking-wide">Tratamiento y seguimiento</h3>
            <InfoRow label="Medicamento" value={attention.medication || "No se administró"} />
            {attention.medication && <InfoRow label="Con receta médica" value={attention.hasRecipe ? "✓ Sí" : "✗ No"} />}
            <InfoRow label="Tratamiento realizado" value={attention.treatment} />
            <InfoRow label="Observaciones" value={attention.observations || "Sin observaciones adicionales"} />
            <InfoRow label="Contacto con padres" value={attention.parentContact?.contacted ? `Sí - Llamada a las ${attention.parentContact.callTime || "N/A"}` : "No fue necesario"} />
            {attention.parentContact?.contacted && <InfoRow label="Autorización obtenida" value={attention.parentContact.authorization ? "✓ Sí" : "✗ No"} />}
            <InfoRow label="Estado" value={attention.status.charAt(0).toUpperCase() + attention.status.slice(1)} />
          </div>
        </div>
      </div>

      {editing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-sm text-yellow-800 font-600">
          Modo edición activo. Los cambios se guardarán al confirmar.
        </div>
      )}
    </div>
  );
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────
function Students({ data }: { data: Attention[] }) {
  const byStudent: Record<string, Attention[]> = {};
  data.forEach((a) => {
    const fullName = `${a.firstName} ${a.lastName}`;
    if (!byStudent[fullName]) byStudent[fullName] = [];
    byStudent[fullName].push(a);
  });

  // Calcular recurrencia del mes actual (agosto 2026)
  const currentMonth = "2026-08";
  const getRecurrence = (records: Attention[]) => {
    const thisMonth = records.filter((r) => r.date.startsWith(currentMonth)).length;
    const isRecurrent = thisMonth >= 3;
    return { thisMonth, isRecurrent };
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(byStudent).map(([name, records]) => {
          const { thisMonth, isRecurrent } = getRecurrence(records);
          return (
            <div key={name} className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${isRecurrent ? "border-red-200 bg-red-50" : "border-slate-100"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-700 text-sm flex-shrink-0 ${isRecurrent ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                  {name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="font-700 text-slate-800 text-sm">{name}</div>
                  <div className="text-xs text-slate-400">{records[0].grade} – Sección "{records[0].section}" ({records[0].educationLevel})</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-700 rounded-lg">{records.length} atención{records.length > 1 ? "es" : ""}</span>
                <span className={`px-2.5 py-1 text-xs font-700 rounded-lg ${isRecurrent ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{thisMonth} este mes</span>
                {records.some((r) => r.status === "pendiente") && <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-700 rounded-lg">Pendiente</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({ data }: { data: Attention[] }) {
  const reasonCounts: Record<string, number> = {};
  data.forEach((a) => { reasonCounts[a.reason] = (reasonCounts[a.reason] || 0) + 1; });
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  const total = data.length;

  // Reporte de incidencias (traumatismos, accidentes, reacciones alérgicas)
  const incidentTypes = ["Rotura / Accidente", "Caída / Trauma", "Herida / Corte"];
  const incidents = data.filter((a) => incidentTypes.includes(a.reason));

  // Estudiantes recurrentes (3+ visitas en el mes)
  const currentMonth = "2026-08";
  const studentCounts: Record<string, Attention[]> = {};
  data.forEach((a) => {
    const fullName = `${a.firstName} ${a.lastName}`;
    if (!studentCounts[fullName]) studentCounts[fullName] = [];
    studentCounts[fullName].push(a);
  });
  const recurrentStudents = Object.entries(studentCounts)
    .filter(([_, records]) => records.filter((r) => r.date.startsWith(currentMonth)).length >= 3)
    .map(([name, records]) => ({ name, count: records.filter((r) => r.date.startsWith(currentMonth)).length }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-700 text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Motivos más frecuentes</h3>
          <div className="space-y-3">
            {topReasons.map(([reason, count]) => (
              <div key={reason}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-500">{reason}</span>
                  <span className="text-slate-500 font-700">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-700 text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Estado de atenciones</h3>
          {(["atendido", "pendiente", "derivado"] as const).map((s) => {
            const count = data.filter((a) => a.status === s).length;
            const colors = { atendido: "bg-emerald-500", pendiente: "bg-yellow-400", derivado: "bg-orange-400" };
            const labels = { atendido: "Atendidos", pendiente: "Pendientes", derivado: "Derivados" };
            return (
              <div key={s} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-500">{labels[s]}</span>
                  <span className="text-slate-500 font-700">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors[s]}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-700 text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Reporte de incidencias</h3>
        <p className="text-sm text-slate-600 mb-4">Traumatismos, accidentes, heridas y lesiones registradas</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Estudiante", "Tipo de incidencia", "Fecha", "Diagnóstico"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-700 text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">Sin incidencias registradas</td></tr>
              ) : incidents.map((inc, i) => (
                <tr key={inc.id} className={`border-t border-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  <td className="px-4 py-3 font-600 text-slate-700">{inc.firstName} {inc.lastName}</td>
                  <td className="px-4 py-3 text-red-700 font-600">{inc.reason}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{inc.date}</td>
                  <td className="px-4 py-3 text-slate-600">{inc.diagnosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {recurrentStudents.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-6">
          <h3 className="font-700 text-red-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>⚠️ Estudiantes recurrentes (agosto 2026)</h3>
          <p className="text-sm text-red-700 mb-3">3 o más visitas en el mes — Requiere seguimiento especial</p>
          <div className="space-y-2">
            {recurrentStudents.map(({ name, count }) => (
              <div key={name} className="flex justify-between items-center bg-white rounded-lg px-4 py-2 border border-red-200">
                <span className="text-slate-700 font-600">{name}</span>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-700">{count} visitas</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-700 text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Exportar reportes</h3>
        <p className="text-sm text-slate-500 mb-4">Genera reportes detallados para compartir con dirección o padres de familia.</p>
        <div className="flex gap-3 flex-wrap">
          {["Reporte mensual", "Reporte de incidencias", "Estudiantes recurrentes"].map((r) => (
            <button key={r} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors">
              {Icons.download} {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function Settings() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-700 text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Información de la institución</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[["Nombre del colegio", "Colegio Señor de la Vida"], ["UGEL", "UGEL 01 – San Juan de Miraflores"], ["Dirección", "Av. Principal 123, Lima"], ["Teléfono", "(01) 555-1234"]].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-700 text-slate-500 uppercase tracking-wide">{label}</label>
              <input defaultValue={value} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-700 text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Personal del tópico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[["Nombre del responsable", "Lic. María García"], ["Cargo", "Enfermera escolar"], ["Email", "topico@señordelavida.edu.pe"]].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-700 text-slate-500 uppercase tracking-wide">{label}</label>
              <input defaultValue={value} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-sm font-700 transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Inicio", icon: Icons.home },
  { id: "register", label: "Registrar atención", icon: Icons.plus },
  { id: "history", label: "Historial", icon: Icons.history },
  { id: "students", label: "Estudiantes", icon: Icons.users },
  { id: "reports", label: "Reportes", icon: Icons.chart },
  { id: "informes", label: "Informes Automatizados", icon: Icons.download },
  { id: "medications", label: "Medicamentos", icon: Icons.heart },
  { id: "settings", label: "Configuración", icon: Icons.settings },
];

const PAGE_TITLES: Record<View, string> = {
  dashboard: "Inicio",
  register: "Registrar nueva atención",
  history: "Historial de atenciones",
  students: "Estudiantes",
  reports: "Reportes",
  informes: "Informes Automatizados",
  medications: "Medicamentos",
  settings: "Configuración",
  detail: "Detalle de atención",
};

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<Attention[]>(SAMPLE_DATA);
  const [medicationUsages, setMedicationUsages] = useState<MedicationUsage[]>(INITIAL_MEDICATION_USAGES);
  const [selectedAttention, setSelectedAttention] = useState<Attention | null>(null);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const navigate = (v: View) => {
    setView(v);
    setSidebarOpen(false);
  };

  const handleViewAttention = (a: Attention) => {
    setSelectedAttention(a);
    setView("detail");
  };

  const handleSaveAttention = (a: Attention) => {
    setData((prev) => [a, ...prev]);
    showToast("¡Atención registrada correctamente!");
    navigate("history");
  };

  const handleRegisterMedicationUsage = (usage: MedicationUsage) => {
    setMedicationUsages((prev) => [usage, ...prev]);
    setData((prev) =>
      prev.map((a) => {
        if (a.id !== usage.attentionId) return a;

        const treatmentLine = `${usage.medication} (${usage.dose})`;
        const hasLine = a.treatment.includes(treatmentLine);

        return {
          ...a,
          medication: usage.medication,
          treatment: hasLine ? a.treatment : `${a.treatment}. Medicación administrada: ${treatmentLine}`,
          observations: usage.notes ? `${a.observations}${a.observations ? " | " : ""}${usage.notes}` : a.observations,
        };
      }),
    );

    showToast("Medicamento guardado y añadido al historial del paciente");
    navigate("history");
  };

  const { isAuthenticated, user, logout } = useAuth();

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-full bg-slate-50" style={{ fontFamily: "Nunito, sans-serif" }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-800 to-blue-900 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-blue-700/50">
          <Logo />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id || (view === "detail" && item.id === "history");
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-600 transition-all ${active ? "bg-white text-blue-800 shadow-sm" : "text-blue-200 hover:bg-blue-700/50 hover:text-white"}`}
              >
                <span className={active ? "text-blue-700" : ""}>{item.icon}</span>
                {item.label}
                {item.id === "register" && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-yellow-400 text-yellow-900 text-xs font-800 flex items-center justify-center">+</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom info */}
        <div className="px-5 py-4 border-t border-blue-700/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center text-xs font-700">{user?.username.charAt(0).toUpperCase()}</div>
            <div>
              <div className="text-white text-xs font-700">{user?.username}</div>
              <div className="text-blue-300 text-xs">Administrador</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-600 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 p-1">{Icons.menu}</button>
          <div>
            <h1 className="font-700 text-slate-800 text-base" style={{ fontFamily: "Outfit, sans-serif" }}>{PAGE_TITLES[view]}</h1>
            <p className="text-xs text-slate-400">Tópico Escolar – Colegio Señor de la Vida</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-slate-500 hover:text-blue-700 p-2 rounded-xl hover:bg-blue-50 transition-colors">
              {Icons.bell}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
            </button>
            <button
              onClick={() => navigate("register")}
              className="hidden sm:flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-700 text-sm px-4 py-2 rounded-xl transition-colors"
            >
              {Icons.plus} Nueva atención
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {view === "dashboard" && <Dashboard data={data} onView={handleViewAttention} onRegister={() => navigate("register")} />}
          {view === "register" && <RegisterForm onSave={handleSaveAttention} />}
          {view === "history" && <History data={data} onView={handleViewAttention} />}
          {view === "students" && <Students data={data} />}
          {view === "reports" && <Reports data={data} />}
          {view === "informes" && <AutomatedReports data={data} onViewAttention={handleViewAttention} />}
          {view === "medications" && <Medications data={data} usages={medicationUsages} onRegisterUsage={handleRegisterMedicationUsage} />}
          {view === "settings" && <Settings />}
          {view === "detail" && selectedAttention && <DetailView attention={selectedAttention} onBack={() => navigate("history")} />}
        </main>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
