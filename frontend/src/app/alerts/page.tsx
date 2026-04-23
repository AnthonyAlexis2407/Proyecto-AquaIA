"use client";

import { useEffect, useState } from "react";
import { 
  Bell, Filter, Search, ShieldAlert, 
  MapPin, Clock, ArrowRight, Share2,
  AlertTriangle, Info, CheckCircle2,
  MoreVertical, Check
} from "lucide-react";

interface Alert {
  id: string;
  location: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  timestamp: string;
  is_active: boolean;
  source: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todas");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/alerts");
        if (res.ok) {
           setAlerts(await res.json());
        } else {
           // Datos mock de respaldo si el backend falla
           setAlerts([
            { id: "ALT-001", location: "El Tambo Sect 2", severity: "HIGH", description: "Caudal excede el umbral en 4.5 m3/s. Posible ruptura de tubería principal.", timestamp: "Hace 5 min", is_active: true, source: "Sensor SN-04" },
            { id: "ALT-002", location: "Chilca Nodo B", severity: "MEDIUM", description: "Batería del sensor críticamente baja (12%). Mantenimiento requerido.", timestamp: "Hace 14 min", is_active: true, source: "Telemetría" },
            { id: "ALT-003", location: "Huancayo Centro", severity: "LOW", description: "Fluctuación inusual de pH detectada (7.8 -> 8.1).", timestamp: "Hace 32 min", is_active: true, source: "Motor IA" }
           ]);
        }
      } catch (err) {
        setAlerts([
          { id: "ALT-001", location: "El Tambo Sect 2", severity: "HIGH", description: "Caudal excede el umbral en 4.5 m3/s. Posible ruptura de tubería principal.", timestamp: "Hace 5 min", is_active: true, source: "Sensor SN-04" },
          { id: "ALT-002", location: "Chilca Nodo B", severity: "MEDIUM", description: "Batería del sensor críticamente baja (12%). Mantenimiento requerido.", timestamp: "Hace 14 min", is_active: true, source: "Telemetría" },
          { id: "ALT-003", location: "Huancayo Centro", severity: "LOW", description: "Fluctuación inusual de pH detectada (7.8 -> 8.1).", timestamp: "Hace 32 min", is_active: true, source: "Motor IA" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const resolveAlert = (id: string) => {
    // Simulación de resolución
    setAlerts(prev => prev.filter(al => al.id !== id));
  };

  const filteredAlerts = alerts.filter(al => {
    if (activeFilter === "Todas") return true;
    if (activeFilter === "Críticas") return al.severity === "HIGH";
    if (activeFilter === "Advertencias") return al.severity === "MEDIUM";
    if (activeFilter === "Informativas") return al.severity === "LOW";
    return true;
  });

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Alertas Activas</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">
             Gestión de incidencias — Central de Monitoreo Junín
           </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
           <button 
             onClick={() => setActiveFilter("Todas")}
             className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeFilter === "Todas" ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Todas
           </button>
           <button 
             onClick={() => setActiveFilter("Historial")}
             className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeFilter === "Historial" ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Historial
           </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 min-h-0">
         {/* Left: Filters and Stats */}
         <div className="lg:col-span-3 space-y-6">
            <div className="glass-card rounded-[2.5rem] p-8 space-y-8">
               <div>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Filtrar por Severidad</h3>
                  <div className="space-y-2">
                     <FilterItem label="Todas" count={alerts.length} active={activeFilter === "Todas"} onClick={() => setActiveFilter("Todas")} color="bg-gray-500" />
                     <FilterItem label="Críticas" count={alerts.filter(a => a.severity === 'HIGH').length} active={activeFilter === "Críticas"} onClick={() => setActiveFilter("Críticas")} color="bg-red-500" />
                     <FilterItem label="Advertencias" count={alerts.filter(a => a.severity === 'MEDIUM').length} active={activeFilter === "Advertencias"} onClick={() => setActiveFilter("Advertencias")} color="bg-orange-500" />
                     <FilterItem label="Informativas" count={alerts.filter(a => a.severity === 'LOW').length} active={activeFilter === "Informativas"} onClick={() => setActiveFilter("Informativas")} color="bg-sky-500" />
                  </div>
               </div>
               
               <div className="pt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Filtros Geográficos</h3>
                  <div className="space-y-3">
                     <SectorItem label="Huancayo Centro" active />
                     <SectorItem label="El Tambo" />
                     <SectorItem label="Chilca" />
                     <SectorItem label="Pilcomayo" />
                  </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-transparent p-8 rounded-[2.5rem] border border-red-500/20">
               <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
               <h3 className="text-white font-bold leading-none">Monitoreo Crítico</h3>
               <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">El sistema ha bloqueado 2 sectores preventivamente en la última hora.</p>
            </div>
         </div>

         {/* Right: Alert List */}
         <div className="lg:col-span-9 flex flex-col space-y-6">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
              <div className="relative flex-1 max-w-sm ml-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Buscar alerta por ID o descripción..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-gray-700"
                />
              </div>
              <button className="p-3 text-gray-600 hover:text-white transition-all"><MoreVertical size={18} /></button>
           </div>

           <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 min-h-0">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onResolve={() => resolveAlert(alert.id)} />
                ))
              ) : (
                <div className="h-64 glass-card rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 border-white/5 text-center">
                   <CheckCircle2 size={48} className="text-emerald-500 opacity-20" />
                   <div>
                      <h4 className="text-white font-bold">Sin alertas pendientes</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Todas las incidencias han sido resueltas</p>
                   </div>
                </div>
              )}
           </div>
         </div>
      </div>
    </div>
  );
}

function FilterItem({ label, count, active, onClick, color }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all cursor-pointer group ${active ? 'bg-white/5 border-white/10 shadow-xl' : 'border-transparent hover:bg-white/[0.02]'}`}
    >
       <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <span className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>{label}</span>
       </div>
       <span className="text-[10px] font-black text-gray-600">{count}</span>
    </div>
  );
}

function SectorItem({ label, active }: any) {
  return (
    <div className="flex items-center space-x-3 px-5 py-2.5 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
       <div className={`w-2 h-2 rounded-full transition-all ${active ? 'bg-primary ring-4 ring-primary/20' : 'bg-gray-800 group-hover:bg-gray-600'}`}></div>
       <span className={`text-xs font-bold ${active ? 'text-gray-200' : 'text-gray-600 group-hover:text-gray-400'}`}>{label}</span>
    </div>
  );
}

function AlertCard({ alert, onResolve }: { alert: Alert; onResolve: () => void }) {
  const isHigh = alert.severity === 'HIGH';
  const isMedium = alert.severity === 'MEDIUM';

  return (
    <div className={`glass-card rounded-[2.5rem] p-10 border-l-[10px] group hover-glow transition-all animate-in slide-in-from-right-4 duration-500 ${
      isHigh ? "border-l-red-500" : isMedium ? "border-l-orange-500" : "border-l-sky-500"
    }`}>
       <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-5">
             <div className={`p-4 rounded-[1.5rem] ${isHigh ? "bg-red-500/10 text-red-500" : "bg-white/5 text-gray-500 group-hover:text-gray-300"}`}>
                {isHigh ? <AlertTriangle size={24} /> : <Info size={24} />}
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{alert.id}</p>
                <h4 className="text-xl font-bold text-white tracking-tight mt-1">{alert.location}</h4>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
                {alert.source}
             </div>
             <button className="p-3 hover:bg-white/5 rounded-2xl text-gray-700 hover:text-white transition-all">
                <Share2 size={20} />
             </button>
          </div>
       </div>

       <p className="text-base text-gray-400 leading-relaxed max-w-2xl mb-10 font-medium">
          {alert.description}
       </p>

       <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <div className="flex items-center space-x-8">
             <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">{alert.timestamp}</span>
             </div>
             <div className="flex items-center space-x-2 text-gray-600 group-hover:text-primary transition-colors cursor-pointer">
                <MapPin size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">Ver Mapa</span>
             </div>
          </div>
          <button 
            onClick={onResolve}
            className="flex items-center space-x-3 px-8 py-3.5 bg-white/5 hover:bg-emerald-500 text-gray-400 hover:text-white border border-white/10 hover:border-emerald-500 rounded-[1.5rem] text-xs font-black transition-all uppercase tracking-widest group/btn shadow-xl"
          >
             <Check size={18} className="group-hover/btn:scale-110 transition-transform" />
             <span>Resolver Incidencia</span>
          </button>
       </div>
    </div>
  );
}
