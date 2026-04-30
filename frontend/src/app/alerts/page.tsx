"use client";

import { useEffect, useState } from "react";
import { 
  Bell, Search, ShieldAlert, 
  MapPin, Clock, Share2,
  AlertTriangle, Info, CheckCircle2,
  MoreVertical, Check, X, MessageSquare
} from "lucide-react";
import { api, Alert } from "@/lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/api/v1/alerts");
      if (res.ok) setAlerts(await res.json());
    } catch (err) {
      console.error("Error fetching alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleResolve = async () => {
    if (!resolveId || resolveNote.trim().length < 5) return;
    setResolving(true);
    try {
      const res = await api.post(`/api/v1/alerts/${resolveId}/resolve`, { note: resolveNote });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== resolveId));
        setResolveId(null);
        setResolveNote("");
      }
    } catch (err) {
      console.error("Error resolving", err);
    } finally {
      setResolving(false);
    }
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
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Alertas Activas</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">
             Gestión de incidencias — Distrito de Palián
           </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
           <button onClick={() => setActiveFilter("Todas")} className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${activeFilter === "Todas" ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Todas</button>
           <button onClick={() => fetchAlerts()} className="px-5 py-2.5 text-xs font-black rounded-xl text-gray-500 hover:text-gray-300 transition-all">Actualizar</button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 min-h-0">
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
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Zonas con Alertas</h3>
                  <div className="space-y-3">
                     {[...new Set(alerts.map(a => a.zone_name || a.location))].map(z => (
                       <div key={z} className="flex items-center space-x-3 px-5 py-2.5 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
                         <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20"></div>
                         <span className="text-xs font-bold text-gray-400 group-hover:text-gray-200">{z}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-9 flex flex-col space-y-6">
           <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 min-h-0">
              {loading ? (
                <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onResolve={() => { setResolveId(alert.id); setResolveNote(""); }} />
                ))
              ) : (
                <div className="h-64 glass-card rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 border-white/5 text-center">
                   <CheckCircle2 size={48} className="text-emerald-500 opacity-20" />
                   <div>
                      <h4 className="text-white font-bold">Sin alertas pendientes</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Todas las incidencias resueltas</p>
                   </div>
                </div>
              )}
           </div>
         </div>
      </div>

      {/* Modal de Resolución con Nota Obligatoria (HU-10) */}
      {resolveId !== null && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass-card rounded-[2.5rem] p-10 shadow-2xl border-white/10 relative">
            <button onClick={() => setResolveId(null)} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-4 bg-emerald-500/10 rounded-2xl"><MessageSquare className="w-6 h-6 text-emerald-400" /></div>
              <div>
                <h3 className="text-xl font-black text-white">Resolver Alerta</h3>
                <p className="text-xs text-gray-500">Se registrará tu usuario, la nota y el timestamp</p>
              </div>
            </div>
            <div className="space-y-4">
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Describe la intervención realizada (mínimo 5 caracteres)..."
                rows={4}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:border-emerald-500 transition-all outline-none resize-none"
              />
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">{resolveNote.length}/5 caracteres mínimo</p>
            </div>
            <div className="flex space-x-4 mt-8">
              <button onClick={() => setResolveId(null)} className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 font-bold rounded-2xl hover:text-white transition-all">Cancelar</button>
              <button
                onClick={handleResolve}
                disabled={resolveNote.trim().length < 5 || resolving}
                className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                <Check size={18} />
                <span>{resolving ? "Resolviendo..." : "Confirmar Resolución"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterItem({ label, count, active, onClick, color }: any) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all cursor-pointer group ${active ? 'bg-white/5 border-white/10 shadow-xl' : 'border-transparent hover:bg-white/[0.02]'}`}>
       <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <span className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>{label}</span>
       </div>
       <span className="text-[10px] font-black text-gray-600">{count}</span>
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
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{alert.alert_code}</p>
                <h4 className="text-xl font-bold text-white tracking-tight mt-1">{alert.location}</h4>
                {alert.zone_name && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{alert.zone_name}</p>}
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">{alert.source}</div>
          </div>
       </div>
       <p className="text-base text-gray-400 leading-relaxed max-w-2xl mb-4 font-medium">{alert.description}</p>
       {alert.detected_value != null && (
         <div className="flex items-center space-x-4 mb-8">
           <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Valor: <span className="text-white">{alert.detected_value}</span></span>
           {alert.threshold_value != null && <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Umbral: <span className="text-amber-400">{alert.threshold_value}</span></span>}
         </div>
       )}
       <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <div className="flex items-center space-x-8">
             <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">{alert.created_at ? new Date(alert.created_at).toLocaleString("es-PE") : "Reciente"}</span>
             </div>
          </div>
          <button 
            onClick={onResolve}
            className="flex items-center space-x-3 px-8 py-3.5 bg-white/5 hover:bg-emerald-500 text-gray-400 hover:text-white border border-white/10 hover:border-emerald-500 rounded-[1.5rem] text-xs font-black transition-all uppercase tracking-widest group/btn shadow-xl"
          >
             <Check size={18} className="group-hover/btn:scale-110 transition-transform" />
             <span>Resolver</span>
          </button>
       </div>
    </div>
  );
}
