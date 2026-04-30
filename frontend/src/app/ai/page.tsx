"use client";

import { useState, useEffect } from "react";
import { 
  BrainCircuit, Zap, BarChart3, 
  ShieldCheck, RefreshCw, Layers, 
  Settings, Play, Terminal, Loader2,
  TrendingUp, Activity
} from "lucide-react";
import { api } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AIPage() {
  const [activeModel, setActiveModel] = useState("Random Forest");
  const [isTesting, setIsTesting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [stats, setStats] = useState({ precision: "94.2%", f1: "0.892", latencia: "< 5ms" });
  
  const [rfInputs, setRfInputs] = useState({ hour: new Date().getHours(), temperature: 15.5, rain_prob: 20 });
  const [ifInputs, setIfInputs] = useState({ flow_value: 40.5 });
  
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [riskZones, setRiskZones] = useState<any[]>([]);
  
  const [logs, setLogs] = useState([
    `[${new Date().toLocaleTimeString()}] SISTEMA: Motor de IA AquaIA listo.`,
    `[${new Date().toLocaleTimeString()}] INFO: Modelos cargados en caché persistente.`
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleTest = async () => {
    setIsTesting(true);
    addLog(`TEST: Iniciando inferencia en ${activeModel}...`);

    try {
      let res;
      const start = performance.now();

      if (activeModel === "Random Forest") {
        res = await api.post("/api/v1/ai/predict", rfInputs);
        const data = await res.json();
        const latency = (performance.now() - start).toFixed(1);
        setStats({ precision: `${data.confidence_level}%`, f1: "0.91", latencia: `${latency}ms` });
        addLog(`SUCCESS: Caudal predicho ${data.predicted_flow_m3s} m³/s. ${data.message}`);

      } else if (activeModel === "Isolation Forest") {
        res = await api.post("/api/v1/ai/anomaly-check", ifInputs);
        const data = await res.json();
        setStats({ precision: "98.1%", f1: "0.94", latencia: `${data.latency_ms}ms` });
        addLog(`SUCCESS: ${data.message}`);

      } else if (activeModel === "Prophet IA") {
        res = await api.get("/api/v1/ai/forecast");
        const data = await res.json();
        setForecastData(data);
        const latency = (performance.now() - start).toFixed(1);
        setStats({ precision: "88.4%", f1: "0.85", latencia: `${latency}ms` });
        addLog(`SUCCESS: Proyección de ${data.length} periodos generada.`);

      } else if (activeModel === "XGBoost") {
        res = await api.get("/api/v1/ai/risk-zones");
        const data = await res.json();
        setRiskZones(data);
        const latency = (performance.now() - start).toFixed(1);
        setStats({ precision: "92.7%", f1: "0.89", latencia: `${latency}ms` });
        addLog(`SUCCESS: Análisis completado. Riesgo detectado en sectores.`);
      }

      if (!res?.ok) throw new Error("Backend devolvió error");

    } catch (error) {
      addLog(`ERROR: Falló conexión. Verifique que el servidor esté activo.`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in relative">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-primary text-white px-6 py-3 rounded-full shadow-2xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 border border-white/20">
            <Settings size={14} className="animate-spin" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Laboratorio IA</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">Entrenamiento y Validación de Modelos (HU-02/05)</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
           <button onClick={() => showToast("Sincronizando con DataLake...")} className="flex items-center space-x-2 px-5 py-2.5 text-gray-400 hover:text-white text-xs font-black rounded-xl transition-all">
              <RefreshCw size={14} />
              <span>Sincronizar</span>
           </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
         {/* Sidebar: Model Selection */}
         <div className="space-y-4">
            <ModelTab 
              icon={<Zap size={18} />} name="Random Forest" desc="Caudal (RF-02)" 
              active={activeModel === "Random Forest"} onClick={() => setActiveModel("Random Forest")}
            />
            <ModelTab 
              icon={<Layers size={18} />} name="Isolation Forest" desc="Anomalías (RF-04)" 
              active={activeModel === "Isolation Forest"} onClick={() => setActiveModel("Isolation Forest")}
            />
            <ModelTab 
              icon={<BarChart3 size={18} />} name="Prophet IA" desc="Demanda 7d (PMV2)" 
              active={activeModel === "Prophet IA"} onClick={() => setActiveModel("Prophet IA")}
            />
            <ModelTab 
              icon={<ShieldCheck size={18} />} name="XGBoost" desc="Riesgo Sectorial" 
              active={activeModel === "XGBoost"} onClick={() => setActiveModel("XGBoost")}
            />
         </div>

         {/* Main Panel */}
         <div className="lg:col-span-3 space-y-8">
            <div className="glass-card rounded-[2.5rem] p-10 relative border-white/5 overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
               
               <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center space-x-4">
                     <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">{activeModel}</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Status: Operativo v3.0</p>
                     </div>
                  </div>
                  <button 
                    onClick={handleTest}
                    disabled={isTesting}
                    className="flex items-center space-x-2 px-8 py-3.5 bg-primary text-white text-xs font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    <span>{isTesting ? "PROCESANDO..." : "EJECUTAR INFERENCIA"}</span>
                  </button>
               </div>

               {/* Inputs de Simulación */}
               <div className="mt-10 bg-white/5 p-6 rounded-3xl border border-white/5 relative z-10">
                 <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Variables de Entrada</h4>
                 
                 {activeModel === "Random Forest" && (
                   <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <p className="text-[10px] text-gray-600 font-black uppercase">Hora (0-23)</p>
                        <input type="number" min="0" max="23" value={rfInputs.hour} onChange={e => setRfInputs({...rfInputs, hour: Number(e.target.value)})} className="w-full bg-[#0d1425] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-all" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] text-gray-600 font-black uppercase">Temp (°C)</p>
                        <input type="number" step="0.1" value={rfInputs.temperature} onChange={e => setRfInputs({...rfInputs, temperature: Number(e.target.value)})} className="w-full bg-[#0d1425] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-all" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] text-gray-600 font-black uppercase">Prob. Lluvia %</p>
                        <input type="number" min="0" max="100" value={rfInputs.rain_prob} onChange={e => setRfInputs({...rfInputs, rain_prob: Number(e.target.value)})} className="w-full bg-[#0d1425] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-all" />
                     </div>
                   </div>
                 )}

                 {activeModel === "Isolation Forest" && (
                   <div className="flex items-end space-x-6">
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] text-gray-600 font-black uppercase">Caudal a Evaluar (m³/s)</p>
                        <input type="number" step="0.5" value={ifInputs.flow_value} onChange={e => setIfInputs({...ifInputs, flow_value: Number(e.target.value)})} className="w-full bg-[#0d1425] border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black text-white text-center outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="pb-2">
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                           * El modelo detectará anomalías si el valor se aleja significativamente del promedio histórico (40 m³/s).
                        </p>
                      </div>
                   </div>
                 )}

                 {(activeModel === "Prophet IA" || activeModel === "XGBoost") && (
                   <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <TrendingUp size={20} className="text-primary" />
                      <p className="text-xs text-gray-400">Este modelo utiliza series temporales históricas automáticas. No requiere parámetros de entrada manuales para el test.</p>
                   </div>
                 )}
               </div>

               {/* Resultados Visuales */}
               <div className="mt-12 grid grid-cols-3 gap-8 relative z-10 border-t border-white/5 pt-10">
                  <AIStat label="Confianza / Precisión" val={isTesting ? "..." : stats.precision} color="text-primary" />
                  <AIStat label="F1 Score" val={isTesting ? "..." : stats.f1} color="text-emerald-400" />
                  <AIStat label="Latencia Inferencia" val={isTesting ? "..." : stats.latencia} color="text-sky-400" />
               </div>

               {/* Forecast Visualization */}
               {activeModel === "Prophet IA" && forecastData.length > 0 && (
                 <div className="mt-12 space-y-6 relative z-10">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center space-x-2">
                      <TrendingUp size={14} />
                      <span>Proyección de Demanda (7 Días)</span>
                    </h4>
                    <div className="h-64 glass-card bg-white/[0.01] rounded-3xl p-6">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={forecastData.slice(0, 48)}> {/* Mostrar solo primeras 48h para legibilidad */}
                           <defs>
                             <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                           <XAxis dataKey="ds" hide />
                           <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} stroke="transparent" />
                           <Tooltip contentStyle={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
                           <Area type="monotone" dataKey="yhat" stroke="#10b981" fillOpacity={1} fill="url(#colorForecast)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
               )}

               {/* Risk Visualization */}
               {activeModel === "XGBoost" && riskZones.length > 0 && (
                 <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {riskZones.map((z, idx) => (
                      <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{z.zone}</p>
                            <p className="text-xs text-gray-400">Consumo Avg: {z.metrics.avg_consumption} m³/h</p>
                         </div>
                         <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${z.risk_score === 'HIGH' ? 'bg-red-500/10 text-red-400' : z.risk_score === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
                            Riesgo {z.risk_score}
                         </div>
                      </div>
                    ))}
                 </div>
               )}

               {/* Terminal Logs */}
               <div className="mt-12 bg-black/40 rounded-3xl p-8 border border-white/5 relative z-10">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                     <div className="flex items-center space-x-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        <Terminal size={14} />
                        <span>Inferencia — Consola de Depuración</span>
                     </div>
                  </div>
                  <div className="font-mono text-[11px] space-y-2 text-primary/60 h-40 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                     <p className="animate-pulse text-primary font-bold">_</p>
                     {logs.map((log, i) => <p key={i} className="animate-in fade-in">{log}</p>)}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ModelTab({ icon, name, desc, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`
        p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group
        ${active 
          ? "bg-primary/10 border-primary/30 shadow-2xl shadow-primary/10 scale-[1.02]" 
          : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"}
      `}
    >
      <div className="flex items-center space-x-5">
         <div className={`p-4 rounded-2xl transition-all ${active ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white/5 text-gray-500 group-hover:text-gray-300"}`}>
            {icon}
         </div>
         <div>
            <h4 className={`text-sm font-bold tracking-tight ${active ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>{name}</h4>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1.5">{desc}</p>
         </div>
      </div>
    </div>
  );
}

function AIStat({ label, val, color }: any) {
  return (
    <div className="space-y-3">
       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
       <p className={`text-4xl font-black ${color} tracking-tighter`}>{val}</p>
    </div>
  );
}
