"use client";

import { useState, useEffect } from "react";
import { 
  Zap, Play, Activity, 
  MapPin, CheckCircle2, 
  BarChart, TrendingDown,
  Truck, Settings, Loader2
} from "lucide-react";
import { api, Zone } from "@/lib/api";

export default function SimulationPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [params, setParams] = useState({ vehicles: 2, capacity: 500 });

  useEffect(() => {
    api.get("/api/v1/zones").then(res => res.json()).then(setZones).catch(() => {});
  }, []);

  const toggleZone = (id: number) => {
    setSelectedZones(prev => 
      prev.includes(id) ? prev.filter(zid => zid !== id) : [...prev, id]
    );
  };

  const runSimulation = async () => {
    if (selectedZones.length === 0) return alert("Seleccione al menos una zona.");
    setIsSimulating(true);
    try {
      const res = await api.post("/api/v1/logistics/simulate", {
        zones: selectedZones,
        vehicles: params.vehicles,
        max_capacity_m3: params.capacity
      });
      if (res.ok) setResults(await res.json());
    } catch {
      alert("Error en la simulación.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Simulación de Escenarios</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">Análisis "What-If" para optimización hídrica (HU-08)</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Configuration Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-8">
            <h3 className="text-lg font-bold text-white mb-6">Parámetros del Escenario</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Vehículos Disponibles</p>
                <input 
                  type="range" min="1" max="10" step="1" 
                  value={params.vehicles} 
                  onChange={e => setParams({...params, vehicles: Number(e.target.value)})}
                  className="w-full accent-primary h-1.5 bg-white/5 rounded-full outline-none"
                />
                <div className="flex justify-between text-xs font-bold text-primary">
                  <span>1</span><span>{params.vehicles}</span><span>10</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Capacidad de Carga (m³)</p>
                <select 
                  value={params.capacity}
                  onChange={e => setParams({...params, capacity: Number(e.target.value)})}
                  className="w-full bg-[#0d1425] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all"
                >
                  <option value={250}>250 m³ (Liviano)</option>
                  <option value={500}>500 m³ (Estándar)</option>
                  <option value={1000}>1000 m³ (Pesado)</option>
                </select>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Zonas a Incluir</p>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {zones.map(z => (
                    <div 
                      key={z.id} 
                      onClick={() => toggleZone(z.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedZones.includes(z.id) ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                    >
                      <span className={`text-xs font-bold ${selectedZones.includes(z.id) ? 'text-primary' : 'text-gray-400'}`}>{z.name}</span>
                      {selectedZones.includes(z.id) && <CheckCircle2 size={14} className="text-primary" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={runSimulation}
              disabled={isSimulating || selectedZones.length === 0}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSimulating ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              <span>{isSimulating ? "PROCESANDO..." : "CORRER SIMULACIÓN"}</span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {isSimulating ? (
            <div className="h-full glass-card rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 border-white/5">
               <Activity size={48} className="text-primary animate-pulse" />
               <p className="text-white font-bold animate-pulse">Monte Carlo Simulation in progress...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-6">
               {results.map((res, i) => (
                 <div key={i} className="glass-card rounded-[2.5rem] p-8 border-white/5 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-start mb-8">
                       <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{res.scenario_id}</p>
                          <h3 className="text-xl font-bold text-white mt-1">Escenario Proyectado {i+1}</h3>
                       </div>
                       <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          Ahorro Estimado: {res.cost_reduction_pct}%
                       </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6 mb-8">
                       <SimStat label="Distancia" val={`${res.total_distance_km} km`} icon={<Truck size={14} />} />
                       <SimStat label="Tiempo" val={`${res.total_time_mins} min`} icon={<Clock size={14} />} />
                       <SimStat label="Cobertura" val={`${res.coverage_pct}%`} icon={<MapPin size={14} />} />
                       <SimStat label="CO2 Evitado" val={`${res.co2_reduction_kg} kg`} icon={<TrendingDown size={14} />} color="text-emerald-400" />
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                       <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Detalle de Distribución</p>
                       <div className="flex flex-wrap gap-4">
                          {res.routes.map((r: any, j: number) => (
                             <div key={j} className="px-4 py-2 bg-[#0d1425] rounded-xl border border-white/5 text-[11px] font-bold text-gray-400">
                                Zona {r.zone_id}: <span className="text-primary">{r.volume_m3} m³</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="h-full glass-card rounded-[2.5rem] flex flex-col items-center justify-center border-white/5 bg-gradient-to-br from-primary/10 to-transparent p-12 text-center">
               <Settings size={64} className="text-primary/20 mb-6" />
               <h3 className="text-xl font-bold text-white mb-2">Configure su Escenario</h3>
               <p className="text-gray-500 max-w-sm">
                  Seleccione las zonas de Palián que desea incluir y ajuste los recursos disponibles para comparar diferentes estrategias de distribución.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SimStat({ label, val, icon, color = "text-primary" }: any) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
       <div className="p-2 bg-white/5 rounded-lg text-gray-500 mb-2">{icon}</div>
       <p className={`text-lg font-black ${color}`}>{val}</p>
       <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function Clock({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} height={size || 24} viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
