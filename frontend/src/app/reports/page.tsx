"use client";

import { useState } from "react";
import { 
  FileText, Download, BarChart2, CheckCircle2, 
  Search, Clock, Filter, FileSpreadsheet,
  RefreshCw, ChevronRight
} from "lucide-react";

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setExportComplete(false);
    // Simular generación de reporte (PDF/Excel)
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 5000);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Reportes de Gestión</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">Descarga y análisis histórico del sistema AquaIA</p>
        </div>
        <div className="flex items-center space-x-3">
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className={`
               flex items-center space-x-3 px-8 py-3.5 bg-white/5 border border-white/10 text-white text-xs font-black rounded-2xl transition-all hover:bg-white/10 relative overflow-hidden
               ${isExporting ? 'cursor-not-allowed opacity-80' : ''}
             `}
           >
             {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span>GENERANDO ARCHIVOS...</span>
                  <div className="absolute bottom-0 left-0 h-1 bg-primary animate-[loading_4s_linear]" />
                </>
             ) : exportComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 uppercase">DESCARGA LISTA</span>
                </>
             ) : (
                <>
                   <Download size={16} />
                   <span>EXPORTAR DATOS (CSV/PDF)</span>
                </>
             )}
           </button>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-12 min-h-0">
         {/* Left: Quick Access Reports */}
         <div className="lg:col-span-8 flex flex-col space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <ReportCategory 
                  icon={<BarChart2 className="text-primary" />} 
                  title="Análisis de Caudal" 
                  desc="Consumo agrupado por sector y hora."
               />
               <ReportCategory 
                  icon={<FileSpreadsheet className="text-emerald-400" />} 
                  title="Inventario IoT" 
                  desc="Salud de sensores y estado de batería."
               />
            </div>

            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 flex flex-col flex-1">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-bold text-white tracking-tight">Historial de Reportes</h3>
                  <div className="flex bg-white/5 p-1 rounded-xl">
                     <button className="px-4 py-2 text-[10px] font-black uppercase text-white bg-white/5 rounded-lg border border-white/10 shadow-lg">Semanal</button>
                     <button className="px-4 py-2 text-[10px] font-black uppercase text-gray-500 hover:text-gray-300 transition-colors">Mensual</button>
                  </div>
               </div>

               <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
                  <ReportRow date="2026-04-16" title="Resumen Operativo Diario - Junín" size="4.2 MB" type="PDF" />
                  <ReportRow date="2026-04-15" title="Listado de Alertas Críticas - Semana 15" size="1.8 MB" type="XLS" />
                  <ReportRow date="2026-04-14" title="Proyección de Demanda - Abril 2026" size="12.4 MB" type="PDF" />
                  <ReportRow date="2026-04-13" title="Log de Eventos del Sistema (Debug)" size="0.5 MB" type="TXT" />
                  <ReportRow date="2026-04-12" title="Mantenimiento Preventivo Pilcomayo" size="3.1 MB" type="PDF" />
               </div>
            </div>
         </div>

         {/* Right: Stats & Filter */}
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-8">
               <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Filtros Avanzados</h3>
                  <p className="text-xs text-gray-500 font-medium">Segmentación de datos históricos</p>
               </div>

               <div className="space-y-6">
                  <FilterGroup label="Rango de Fecha" val="Últimos 30 días" />
                  <FilterGroup label="Sectores" val="Todos los Sectores" />
                  <FilterGroup label="Tipo de Sensor" val="Caudal y Presión" />
               </div>

               <div className="pt-6 border-t border-white/5">
                  <button className="w-full py-4 bg-primary text-white text-xs font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center space-x-2">
                     <span>Aplicar Filtros</span>
                     <ChevronRight size={16} />
                  </button>
               </div>
            </div>

            <div className="bg-gradient-to-tr from-primary/20 to-transparent p-8 rounded-[2.5rem] border border-primary/20 space-y-4">
               <Clock className="w-8 h-8 text-primary opacity-50" />
               <h4 className="text-white font-bold text-lg leading-tight">Generación Programada</h4>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">Los reportes ejecutivos se envían automáticamente al correo institucional cada lunes a las 06:00 AM.</p>
            </div>
         </div>
      </div>

      <style jsx global>{`
        @keyframes loading {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function ReportCategory({ icon, title, desc }: any) {
  return (
    <div className="glass-card rounded-[2rem] p-8 border-white/5 space-y-4 hover:scale-[1.03] transition-all cursor-pointer group">
       <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors w-fit">
          {icon}
       </div>
       <div>
          <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">{desc}</p>
       </div>
    </div>
  );
}

function ReportRow({ date, title, size, type }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group cursor-pointer">
       <div className="flex items-center space-x-6">
          <div className="p-3 bg-white/5 rounded-xl text-gray-500 group-hover:text-white transition-colors">
             <FileText size={20} />
          </div>
          <div>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{date}</p>
             <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
          </div>
       </div>
       <div className="flex items-center space-x-8">
          <div className="text-right flex flex-col items-end">
             <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${type === 'PDF' ? 'border-red-500/30 text-red-500' : 'border-emerald-500/30 text-emerald-500'} bg-white/5`}>{type}</span>
             <span className="text-[9px] font-bold text-gray-600 mt-1 uppercase tracking-widest">{size}</span>
          </div>
          <button className="p-2 hover:bg-primary/20 rounded-lg text-gray-500 hover:text-primary transition-all">
             <Download size={18} />
          </button>
       </div>
    </div>
  );
}

function FilterGroup({ label, val }: any) {
  return (
    <div className="space-y-2">
       <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">{label}</p>
       <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
          <span>{val}</span>
          <Filter size={14} className="text-gray-600" />
       </div>
    </div>
  );
}
