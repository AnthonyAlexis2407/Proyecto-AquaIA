"use client";

import { useState } from "react";
import { 
  BrainCircuit, Zap, BarChart3, 
  ShieldCheck, RefreshCw, Layers, 
  Settings, Play, Terminal, Loader2
} from "lucide-react";

export default function AIPage() {
  const [activeModel, setActiveModel] = useState("Random Forest");
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState([
    `[${new Date().toLocaleTimeString()}] SISTEMA: Motor de IA AquaIA listo.`,
    `[${new Date().toLocaleTimeString()}] INFO: Modelos cargados en caché persistente.`
  ]);

  const handleTest = () => {
    setIsTesting(true);
    const newLog = `[${new Date().toLocaleTimeString()}] TEST: Iniciando inferencia en ${activeModel}...`;
    setLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      const resultLog = `[${new Date().toLocaleTimeString()}] SUCCESS: Precisión calculada: ${(92 + Math.random() * 5).toFixed(2)}%`;
      setLogs(prev => [resultLog, ...prev]);
      setIsTesting(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Laboratorio de IA <span className="text-gray-600">—</span> Motores</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
             Entrenamiento y validación de modelos predictivos
           </p>
        </div>
        <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10">
           <button className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
              <RefreshCw size={14} />
              <span>Sincronizar Modelos</span>
           </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
         {/* Sidebar: Model Selection */}
         <div className="space-y-4">
            <ModelTab 
              icon={<Zap size={18} />} 
              name="Random Forest" 
              desc="Predicción de Caudal" 
              active={activeModel === "Random Forest"} 
              onClick={() => setActiveModel("Random Forest")}
            />
            <ModelTab 
              icon={<Layers size={18} />} 
              name="Isolation Forest" 
              desc="Detección de Anomalías" 
              active={activeModel === "Isolation Forest"} 
              onClick={() => setActiveModel("Isolation Forest")}
            />
            <ModelTab 
              icon={<BarChart3 size={18} />} 
              name="Prophet IA" 
              desc="Proyección 7 días" 
              active={activeModel === "Prophet IA"} 
              onClick={() => setActiveModel("Prophet IA")}
            />
            <ModelTab 
              icon={<ShieldCheck size={18} />} 
              name="XGBoost" 
              desc="Clasificación de Riesgo" 
              active={activeModel === "XGBoost"} 
              onClick={() => setActiveModel("XGBoost")}
            />
         </div>

         {/* Main Panel: Model Details */}
         <div className="lg:col-span-3 space-y-8">
            <div className="glass-card rounded-[2.5rem] p-10 overflow-hidden relative border-white/5">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32"></div>
               
               <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center space-x-4">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <BrainCircuit className="w-8 h-8 text-indigo-400" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">{activeModel}</h3>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Estatus: Operativo · Versión 2.4.0</p>
                     </div>
                  </div>
                  <div className="flex space-x-3">
                     <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all"><Settings size={18} /></button>
                     <button 
                        onClick={handleTest}
                        disabled={isTesting}
                        className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                     >
                        {isTesting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        <span>{isTesting ? "PROCESANDO..." : "EJECUTAR TEST"}</span>
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-8 mt-12 relative z-10">
                  <AIStat label="Precisión Global" val={isTesting ? "..." : "94.2%"} color="text-indigo-400" />
                  <AIStat label="F1 Score" val={isTesting ? "..." : "0.892"} color="text-emerald-400" />
                  <AIStat label="Latencia Req." val="< 5ms" color="text-sky-400" />
               </div>

               <div className="mt-12 bg-black/40 rounded-3xl p-8 border border-white/5 relative z-10">
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                     <div className="flex items-center space-x-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        <Terminal size={14} />
                        <span>Logs de Inferencia en Tiempo Real</span>
                     </div>
                     <button onClick={() => setLogs([])} className="text-[9px] font-bold text-gray-700 hover:text-gray-400 transition-colors uppercase">Limpiar</button>
                  </div>
                  <div className="font-mono text-[11px] space-y-2 text-indigo-300/60 h-40 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                     <p className="animate-pulse text-indigo-400">_</p>
                     {logs.map((log, i) => (
                        <p key={i} className="animate-in fade-in slide-in-from-left-2">{log}</p>
                     ))}
                  </div>
               </div>
            </div>

            {/* Additional Modules */}
            <div className="grid grid-cols-2 gap-8">
               <div className="glass-card rounded-[2.5rem] p-10 border-white/5 group hover-glow transition-all">
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Dataset de Entrenamiento</h4>
                  <div className="flex justify-between items-center">
                     <span className="text-3xl font-black text-white tracking-tighter">42.8k <span className="text-xs text-gray-600 uppercase tracking-widest ml-2">Registros</span></span>
                     <div className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <span className="text-[10px] font-black text-indigo-400">Ver Origen</span>
                     </div>
                  </div>
               </div>
               <div className="glass-card rounded-[2.5rem] p-10 border-white/5 group hover-glow transition-all">
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Salud de Servidor</h4>
                  <div className="flex justify-between items-center">
                     <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-black text-emerald-400 tracking-tighter">99.9%</span>
                        <span className="text-[10px] font-black text-gray-600 uppercase">Libre de errores</span>
                     </div>
                     <div className="flex -space-x-3 group-hover:space-x-1 transition-all">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0d1425] bg-indigo-500/20"></div>)}
                     </div>
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
          ? "glass border-indigo-500/30 shadow-2xl shadow-indigo-500/20 bg-indigo-500/5 scale-[1.02]" 
          : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"}
      `}
    >
      <div className="flex items-center space-x-5">
         <div className={`p-3.5 rounded-2xl transition-all ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-white/5 text-gray-500 group-hover:text-gray-300"}`}>
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
