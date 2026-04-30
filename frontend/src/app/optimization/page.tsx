"use client";

import { useState } from "react";
import { 
    Zap, Route, MapPin, ArrowRight, 
    RefreshCw, ChevronRight, CheckCircle2,
    Truck, Clock, Ruler, Loader2
} from "lucide-react";
import { api } from "@/lib/api";

export default function OptimizationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runVRP = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      // Usamos locaciones reales de Palián para el test
      const res = await api.post("/api/v1/logistics/optimize", {
        locations: [
          { id: 1, lat: -12.0735, lon: -75.2280 }, // Palián Centro
          { id: 2, lat: -12.0680, lon: -75.2300 }, // Palián Norte
          { id: 3, lat: -12.0790, lon: -75.2260 }, // Palián Sur
          { id: 4, lat: -12.0740, lon: -75.2210 }  // Palián Este
        ]
      });
      
      if (!res.ok) throw new Error("Error en el servidor");
      
      const data = await res.json();
      setResult({
        distancia: `${data.distance_km} km`,
        tiempo: `${Math.floor(data.estimated_time_mins / 60)}h ${data.estimated_time_mins % 60}m`,
        nodos: data.route_points.length - 2, // Descontamos salida y regreso a base
        ahorro: `${(data.optimization_score * 100).toFixed(1)}%`,
        rutas: [
          { id: "RUTA-01", zona: "Circuito Palián Principal", paradas: data.route_points.length - 2, estado: "Optimizado" },
        ]
      });
    } catch (error) {
      console.error(error);
      alert("Hubo un error al conectar con el motor de optimización.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">Optimización Logística</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">Motor de Rutas VRP — Google OR-Tools (HU-07)</p>
        </div>
        <button 
          onClick={runVRP}
          disabled={isRunning}
          className="flex items-center space-x-3 px-8 py-3.5 bg-primary text-white text-xs font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>{isRunning ? 'CALCULANDO RUTA ÓPTIMA...' : 'EJECUTAR ALGORITMO VRP'}</span>
        </button>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-12 min-h-0">
         {/* Left: Configuration */}
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-8">
               <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Parámetros</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Ajustes del Solucionador</p>
               </div>

               <div className="space-y-6">
                  <OptParam label="Vehículos Disp." val="1" />
                  <OptParam label="Capacidad" val="500 m³" />
                  <OptParam label="Prioridad" val="Mantenimiento" color="text-amber-400" />
               </div>

               <div className="pt-6 border-t border-white/5">
                  <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-start space-x-4">
                     <Route className="w-5 h-5 text-primary mt-1" />
                     <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Algoritmo VRP</p>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Se utiliza optimización por búsqueda local para minimizar la distancia recorrida entre los sensores reportados.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Results */}
         <div className="lg:col-span-8 flex flex-col space-y-6">
            {isRunning ? (
                <div className="flex-1 glass-card rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 border-white/5 bg-white/[0.01]">
                   <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-primary animate-spin"></div>
                      <Route className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                   </div>
                   <div className="text-center">
                      <p className="text-lg font-bold text-white animate-pulse">Optimizando trayectoria...</p>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-2">Iterando en el espacio de soluciones</p>
                   </div>
                </div>
            ) : result ? (
               <div className="flex-1 space-y-6 animate-in slide-in-from-bottom-5 duration-700">
                  {/* Results Summary */}
                  <div className="grid grid-cols-4 gap-4">
                     <ResultCard label="Distancia" val={result.distancia} icon={<Ruler size={14} />} />
                     <ResultCard label="Tiempo Est." val={result.tiempo} icon={<Clock size={14} />} />
                     <ResultCard label="Paradas" val={result.nodos} icon={<MapPin size={14} />} />
                     <ResultCard label="Eficiencia" val={result.ahorro} icon={<CheckCircle2 size={14} />} color="text-emerald-400" />
                  </div>

                  {/* Route Table */}
                  <div className="glass-card rounded-[2.5rem] p-10 border-white/5 flex flex-col flex-1">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-white tracking-tight">Hoja de Ruta Generada</h3>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/10">Basado en OR-Tools</span>
                     </div>

                     <div className="space-y-4">
                        {result.rutas.map((r: any) => (
                           <div key={r.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                              <div className="flex items-center space-x-6">
                                 <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary transition-colors">
                                    <Truck size={24} className="text-primary group-hover:text-white transition-colors" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">{r.id}</p>
                                    <h4 className="text-lg font-bold text-white tracking-tight">{r.zona}</h4>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-12">
                                 <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estatus</p>
                                    <p className="text-sm font-black text-emerald-400">{r.estado}</p>
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
               <div className="flex-1 glass-card rounded-[2.5rem] p-10 border-white/5 bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                  <div className="text-center max-w-sm space-y-6">
                     <Route size={80} className="text-primary/20 mx-auto" />
                     <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">Planificación de Despacho</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                           Haga click en ejecutar para calcular las rutas de mantenimiento más eficientes para el distrito de Palián.
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

function ResultCard({ label, val, icon, color = "text-primary" }: any) {
  return (
    <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.01]">
       <div className="p-2.5 bg-white/5 rounded-xl text-gray-500">
          {icon}
       </div>
       <div>
          <p className={`text-xl font-black ${color} tracking-tight`}>{val}</p>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{label}</p>
       </div>
    </div>
  );
}
