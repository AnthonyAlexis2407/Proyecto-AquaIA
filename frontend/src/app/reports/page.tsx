"use client";

import { useState } from "react";
import { 
  FileText, FileSpreadsheet, ShieldCheck, 
  Download, Clock, Filter, 
  CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { getToken } from "@/lib/api";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: string, endpoint: string) => {
    setDownloading(type);
    try {
      const token = getToken();
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Error al descargar el reporte");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Intentar obtener el nombre del archivo desde el header
      let filename = `reporte_${type.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${type === 'PDF' ? 'pdf' : type === 'Excel' ? 'xlsx' : 'csv'}`;
      const contentDisposition = res.headers.get("Content-Disposition");
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, '');
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("No tiene permisos suficientes o hubo un error al generar el reporte.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Centro de Reportes</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">Generación de informes técnicos y operativos (HU-13)</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Report Card: Infraestructura PDF */}
         <ReportCard 
            title="Inventario IoT" 
            desc="Resumen técnico de sensores, estados de batería y ubicación por zona. Ideal para mantenimiento físico."
            icon={<FileText className="text-sky-400" />}
            format="PDF"
            isDownloading={downloading === "PDF"}
            onDownload={() => handleDownload("PDF", "/api/v1/reports/sensors/pdf")}
         />

         {/* Report Card: Lecturas Excel */}
         <ReportCard 
            title="Historial de Lecturas" 
            desc="Dataset completo de consumos y anomalías detectadas. Formato compatible con Excel para análisis externo."
            icon={<FileSpreadsheet className="text-emerald-400" />}
            format="Excel"
            isDownloading={downloading === "Excel"}
            onDownload={() => handleDownload("Excel", "/api/v1/reports/readings/excel")}
         />

         {/* Report Card: Auditoría CSV */}
         <ReportCard 
            title="Log de Auditoría" 
            desc="Registro completo de acciones de usuario, IPs y timestamps. Requerido para cumplimiento de RNF-06."
            icon={<ShieldCheck className="text-amber-400" />}
            format="CSV"
            isDownloading={downloading === "CSV"}
            onDownload={() => handleDownload("CSV", "/api/v1/reports/audit/csv")}
         />
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
         <div className="flex items-start space-x-6">
            <div className="p-4 bg-primary/10 rounded-2xl flex-shrink-0"><Clock className="w-6 h-6 text-primary" /></div>
            <div className="flex-1">
               <h3 className="text-xl font-bold text-white mb-2">Programación de Reportes Automáticos</h3>
               <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Próximamente podrá configurar el envío automático de reportes semanales a los correos electrónicos de los analistas y operadores responsables. Esta función ayudará a reducir la latencia operativa en la toma de decisiones.
               </p>
               <div className="flex items-center space-x-4 opacity-50 cursor-not-allowed">
                  <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-gray-500 tracking-widest border border-white/5">Envío Semanal</div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-gray-500 tracking-widest border border-white/5">Envío Mensual</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ReportCard({ title, desc, icon, format, onDownload, isDownloading }: any) {
  return (
    <div className="glass-card rounded-[2.5rem] p-8 border-white/5 flex flex-col hover-glow transition-all group bg-white/[0.01]">
       <div className="flex justify-between items-start mb-6">
          <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
             {icon}
          </div>
          <span className="text-[10px] font-black px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-500 uppercase tracking-widest">
             {format}
          </span>
       </div>
       <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
       <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
          {desc}
       </p>
       <button 
         onClick={onDownload}
         disabled={isDownloading}
         className={`
           w-full flex items-center justify-center space-x-3 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]
           ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}
         `}
       >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="uppercase tracking-widest text-xs">Generando...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span className="uppercase tracking-widest text-xs">Descargar Reporte</span>
            </>
          )}
       </button>
    </div>
  );
}
