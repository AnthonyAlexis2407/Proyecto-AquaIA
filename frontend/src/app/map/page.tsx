"use client";

import dynamic from "next/dynamic";
import { 
  ZoomIn, Map as MapIcon, ShieldAlert, 
  Cpu, Route, TrendingUp, Search, Filter,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-blue-900/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function MapPage() {
  const [activeTab, setActiveTab] = useState("Alertas");

  return (
    <div className="h-full flex flex-col space-y-6 animate-in">
      {/* Top Navigation Bar Interior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Red Hídrica <span className="text-gray-600">—</span> Huancayo</h2>
          <div className="flex items-center space-x-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monitoreo en tiempo real · 5 zonas · Rutas VRP activas</p>
          </div>
        </div>
        
        <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <MapNavBtn icon={<ShieldAlert size={14} />} label="Alertas" active={activeTab === "Alertas"} onClick={() => setActiveTab("Alertas")} />
          <MapNavBtn icon={<Cpu size={14} />} label="Sensores" active={activeTab === "Sensores"} onClick={() => setActiveTab("Sensores")} />
          <MapNavBtn icon={<Route size={14} />} label="Rutas VRP" active={activeTab === "Rutas VRP"} onClick={() => setActiveTab("Rutas VRP")} />
          <MapNavBtn icon={<TrendingUp size={14} />} label="Demanda" active={activeTab === "Demanda"} onClick={() => setActiveTab("Demanda")} />
        </div>
      </div>

      {/* Split Layout: Map & Control Panel */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Map Container */}
        <div className="flex-1 glass-card rounded-3xl relative overflow-hidden flex items-center justify-center border-white/5 shadow-2xl">
          <DynamicMap />
          
          {/* Floating Search in Map */}
          <div className="absolute top-6 left-6 z-[400] w-64 group">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar sector o sensor..."
                  className="w-full pl-12 pr-4 py-3.5 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
             </div>
          </div>

          {/* Map Legend/Controls */}
          <div className="absolute bottom-6 right-6 z-[400] flex flex-col space-y-3">
             <button className="p-3 bg-background/80 backdrop-blur-xl border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-xl">
                <ZoomIn size={18} />
             </button>
             <button className="p-3 bg-background/80 backdrop-blur-xl border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all shadow-xl">
                <Filter size={18} />
             </button>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="w-[420px] flex flex-col space-y-6 overflow-hidden">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <MapStatCard val="3" label="Alertas" color="text-red-400" bg="bg-red-500/10" />
            <MapStatCard val="5" label="Zonas OK" color="text-emerald-400" bg="bg-emerald-500/10" />
            <MapStatCard val="130" label="Sensores" color="text-sky-400" bg="bg-sky-500/10" />
          </div>

          {/* Panel de Información Dynamic */}
          <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Panel de alertas</h3>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Actualizado · 16:42:11</span>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                <AlertItem 
                  zone="ZONA CHILCA · FL-03"
                  desc="Caudal 97 m³/h supera umbral máximo (80 m³/h). Posible fuga en red."
                  time="hace 4 min"
                  status="Crítica — Sin resolver"
                  type="danger"
                />
                <AlertItem 
                  zone="ZONA EL TAMBO · PR-01"
                  desc="Presión cae a 28 PSI. Límite mínimo 30 PSI. Inspección recomendada."
                  time="hace 18 min"
                  status="Alta — En revisión"
                  type="warning"
                />
                <AlertItem 
                  zone="MODELO IA · PREDICCIÓN"
                  desc="Pico proyectado de 510 m³ en El Tambo para las 14:00–16:00 hrs."
                  time="hace 32 min"
                  status="Media — Informativo"
                  type="info"
                />
                <AlertItem 
                  zone="RUTA VRP · COMPLETADA"
                  desc="Distribución diaria generada. 36 km optimizados. 5 zonas cubiertas."
                  time="hace 1 hora"
                  status="Resuelto"
                  type="success"
                />
             </div>

             <div className="mt-6 pt-6 border-t border-white/5">
                <button className="w-full flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-xs font-bold transition-all">
                   <span>Ver historial completo</span>
                   <ArrowRight size={14} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapNavBtn({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        px-4 py-2 flex items-center space-x-2 rounded-xl text-xs font-bold transition-all duration-300
        ${active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MapStatCard({ val, label, color, bg }: any) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1">
      <span className={`text-2xl font-black ${color}`}>{val}</span>
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function AlertItem({ zone, desc, time, status, type }: any) {
  const styles = {
    danger: "border-red-500/30 bg-red-500/5 text-red-400",
    warning: "border-orange-500/30 bg-orange-500/5 text-orange-400",
    info: "border-sky-500/30 bg-sky-500/5 text-sky-400",
    success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  };
  
  return (
    <div className={`p-4 rounded-2xl border ${styles[type as keyof typeof styles]} space-y-2 group cursor-pointer transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
         <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{zone}</span>
         <span className="text-[10px] font-medium opacity-50">{time}</span>
      </div>
      <p className="text-sm font-medium text-white/90 leading-tight">
        {desc}
      </p>
      <div className="flex items-center space-x-2 pt-1">
         <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
         <span className="text-[9px] font-black uppercase tracking-widest">{status}</span>
      </div>
    </div>
  );
}
