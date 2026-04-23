"use client";

import { useState } from "react";
import { 
    Zap, Route, MapPin, ArrowRight, 
    RefreshCw, ChevronRight, CheckCircle2,
    Truck, Clock, Ruler
} from "lucide-react";

export default function OptimizationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runVRP = () => {
    setIsRunning(true);
    setResult(null);
    // Simulación del algoritmo OR-Tools
    setTimeout(() => {
      setResult({
        distancia: "36.4 km",
        tiempo: "1h 42min",
        nodos: 5,
        ahorro: "14%",
        rutas: [
          { id: "R-01", zona: "El Tambo - Chilca", paradas: 3, estado: "Óptimo" },
          { id: "R-02", zona: "Huancayo Centro", paradas: 2, estado: "Óptimo" }
        ]
      });
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">Optimización de Rutas VRP</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-primary">Motor de Despacho Inteligente AquaIA Logistics v2.0</p>
        </div>
        <button 
          onClick={runVRP}
          disabled={isRunning}
          className={`
            flex items-center space-x-3 px-8 py-3.5 bg-indigo-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95
            ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>{isRunning ? 'CALCULANDO RUTA ÓPTIMA...' : 'EJECUTAR ALGORITMO VRP'}</span>
        </button>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-12 min-h-0">
         {/* Left: Configuration & Controls */}
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-8">
               <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Parámetros de Entrada</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Ajustes para el solucionador de Google OR-Tools</p>
               </div>

               <div className="space-y-6">
                  <OptParam label="Número de Vehículos" val="2" />
                  <OptParam label="Capacidad Max." val="500 m³" />
                  <OptParam label="Ventana de Tiempo" val="08:00 - 18:00" />
                  <OptParam label="Prioridad" val="Emergencias" color="text-red-400" />
               </div>

               <div className="pt-6 border-t border-white/5">
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start space-x-3">
                     <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Route className="w-4 h-4 text-indigo-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Info Algoritmo</p>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">El sistema utiliza búsqueda heurística para minimizar la distancia Euclidiana en la red hídrica de Junín.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Results Dashboard */}
         <div className="lg:col-span-8 flex flex-col space-y-6">
            {isRunning ? (
                <div className="flex-1 glass-card rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 border-white/5 bg-white/[0.02]">
                   <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin"></div>
                      <Route className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
                   </div>
                   <div className="text-center">
                      <p className="text-lg font-bold text-white animate-pulse">Optimizando trayectorias...</p>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mt-2">Iteración 4,281 · Convergencia al 84%</p>
                   </div>
                </div>
            ) : result ? (
               <div className="flex-1 space-y-6 animate-in slide-in-from-bottom-5 duration-700">
                  {/* Results Summary Cards */}
                  <div className="grid grid-cols-4 gap-4">
                     <ResultCard label="Distancia" val={result.distancia} icon={<Ruler size={14} />} />
                     <ResultCard label="Tiempo Est." val={result.tiempo} icon={<Clock size={14} />} />
                     <ResultCard label="Paradas" val={result.nodos} icon={<MapPin size={14} />} />
                     <ResultCard label="Ahorro CO2" val={result.ahorro} icon={<CheckCircle2 size={14} />} color="text-emerald-400" />
                  </div>

                  {/* Route Table */}
                  <div className="glass-card rounded-[2.5rem] p-8 border-white/5 flex flex-col flex-1">
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-white tracking-tight">Rutas Generadas</h3>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none border border-white/10 px-3 py-1.5 rounded-full">Resultado de Inferencia</span>
                     </div>

                     <div className="space-y-4">
                        {result.rutas.map((r: any) => (
                           <div key={r.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group cursor-pointer">
                              <div className="flex items-center space-x-6">
                                 <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500 transition-colors">
                                    <Truck size={24} className="text-indigo-400 group-hover:text-white transition-colors" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{r.id}</p>
                                    <h4 className="text-lg font-bold text-white tracking-tight">{r.zona}</h4>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-12">
                                 <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ocupación</p>
                                    <p className="text-sm font-black text-white">84%</p>
                                 </div>
                                 <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-full text-gray-500 group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 glass-card rounded-[2.5rem] p-10 border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent flex items-center justify-center">
                  <div className="text-center max-w-sm space-y-6">
                     <div className="relative inline-block">
                        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20"></div>
                        <Route size={80} className="text-indigo-400/30 relative" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">Sistema Maestro de Transporte</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium capitalize">
                           Configura los parámetros y haz click en ejecutar para generar las rutas más eficientes.
                        </p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function OptParam({ label, val, color = "text-white" }: any) {
  return (
    <div className="flex justify-between items-center group cursor-pointer">
       <span className="text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-400 transition-colors">{label}</span>
       <span className={`text-xs font-black p-2 bg-white/5 rounded-lg border border-white/5 min-w-[100px] text-center ${color}`}>{val}</span>
    </div>
  );
}

function ResultCard({ label, val, icon, color = "text-indigo-400" }: any) {
  return (
    <div className="glass-card rounded-2xl p-5 border-white/5 flex flex-col items-center justify-center text-center space-y-2">
       <div className="p-2 bg-white/5 rounded-lg text-gray-500">
          {icon}
       </div>
       <div>
          <p className={`text-lg font-black ${color} tracking-tight`}>{val}</p>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</p>
       </div>
    </div>
  );
}
