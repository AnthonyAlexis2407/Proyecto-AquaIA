"use client";

import { useEffect, useState } from "react";
import { Activity, Droplets, TrendingUp, Search, Zap, Wind, Waves } from "lucide-react";

export default function MonitoreoPage() {
  const [data, setData] = useState({
    turbidez: 2.4,
    ph: 7.2,
    cloro: 0.8,
    presion: 45.2,
    caudal: 380,
    temperatura: 14.5
  });

  // Simulación de telemetría en tiempo real
  // Conexión real + Simulación de telemetría secundaria
  useEffect(() => {
    const fetchRealCaudal = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/dashboard/metrics");
        if (res.ok) {
          const metrics = await res.json();
          setData(prev => ({ ...prev, caudal: metrics.flow_rate_m3s }));
        }
      } catch (err) {
        console.warn("Usando fallback de caudal");
      }
    };

    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        turbidez: Number((prev.turbidez + (Math.random() - 0.5) * 0.1).toFixed(2)),
        ph: Number((prev.ph + (Math.random() - 0.5) * 0.05).toFixed(2)),
        cloro: Number((prev.cloro + (Math.random() - 0.5) * 0.02).toFixed(2)),
        presion: Number((prev.presion + (Math.random() - 0.5) * 1.5).toFixed(1)),
        // Caudal real de la API o simulación de ruido suave si falla
        caudal: prev.caudal === 380 ? Math.floor(prev.caudal + (Math.random() - 0.5) * 10) : prev.caudal,
        temperatura: Number((prev.temperatura + (Math.random() - 0.5) * 0.2).toFixed(1))
      }));
      // Fetch caudal real cada 10 iteraciones (20s)
      if (Math.random() > 0.8) fetchRealCaudal();
    }, 2000);
    
    fetchRealCaudal(); // Fetch inicial

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Monitoreo de Telemetría</h2>
        <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">Datos granulares en tiempo real - Sensor Mesh v4.0</p>
      </div>
      
      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MonitorCard label="Caudal de Entrada" val={`${data.caudal} m³/s`} icon={<Waves className="text-blue-400" />} trend="+2.4%" />
         <MonitorCard label="Presión de Red" val={`${data.presion} PSI`} icon={<Zap className="text-amber-400" />} trend="-0.8%" />
         <MonitorCard label="Calidad (pH)" val={data.ph.toString()} icon={<Droplets className="text-emerald-400" />} trend="Stable" />
         <MonitorCard label="Temp. Agua" val={`${data.temperatura}°C`} icon={<Wind className="text-sky-400" />} trend="+0.1%" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Live Graph Section (Placeholder visual robusto) */}
         <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 flex flex-col border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10 relative z-10">
               <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="text-lg font-bold text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Flujo de Telemetría en Vivo</h3>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Feed de Datos Activo</span>
               </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
               {/* Simulación visual de gráfico */}
               <div className="absolute inset-0 flex items-end justify-between px-10">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-4 bg-primary/20 rounded-t-lg transition-all duration-1000" 
                      style={{ height: `${20 + Math.random() * 60}%` }}
                    ></div>
                  ))}
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#0d1425] to-transparent pointer-events-none"></div>
               <div className="z-10 text-center space-y-2">
                  <p className="text-primary text-4xl font-black">{data.caudal}</p>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">m³/s en tiempo real</p>
               </div>
            </div>
         </div>

         {/* Parámetros de Calidad */}
         <div className="space-y-6">
            <div className="glass-card rounded-[2rem] p-8 border-white/5 flex flex-col h-full group hover-glow transition-all">
               <h3 className="text-white font-bold mb-8 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Calidad de Potabilización</span>
               </h3>
               <div className="space-y-6 flex-1">
                  <ParamProgress label="Turbidez" val={`${data.turbidez} NTU`} progress={data.turbidez * 10} limit="Max 5.0" />
                  <ParamProgress label="pH" val={data.ph.toString()} progress={(data.ph/14)*100} limit="6.5 - 8.5" color="bg-emerald-500" />
                  <ParamProgress label="Cloro Resid." val={`${data.cloro} mg/L`} progress={data.cloro * 50} limit="0.5 - 1.2" color="bg-amber-500" />
                  <ParamProgress label="Presión Media" val={`${data.presion} PSI`} progress={(data.presion/100)*100} limit="30 - 60" color="bg-sky-500" />
               </div>
               <div className="mt-8 pt-8 border-t border-white/5">
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white rounded-xl transition-all uppercase tracking-widest">
                     Ver Historial de 24h
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function MonitorCard({ label, val, icon, trend }: any) {
  return (
    <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4 hover:scale-[1.03] transition-all group">
       <div className="flex justify-between items-center">
          <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
             {icon}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${trend.startsWith('+') ? 'text-emerald-500' : 'text-amber-500'}`}>
             {trend}
          </span>
       </div>
       <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-2xl font-black text-white">{val}</p>
       </div>
    </div>
  );
}

function ParamProgress({ label, val, progress, limit, color = "bg-primary" }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">{label}</span>
          <span className="text-sm font-bold text-white">{val}</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, progress)}%` }}></div>
       </div>
       <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest text-right">{limit}</p>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
