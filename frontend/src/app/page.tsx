"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  TrendingUp, Activity, ShieldAlert, Cpu, 
  ArrowUpRight, ArrowDownRight, Droplet, 
  Clock, MoreVertical, Search
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

interface Metric {
  label: string;
  value: string | number;
  trend: string;
  isUp: boolean;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [flowData, setFlowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const metricsRes = await fetch("http://127.0.0.1:8000/api/v1/dashboard/metrics");
      const flowRes = await fetch("http://127.0.0.1:8000/api/v1/dashboard/flow-chart");
      
      if (!metricsRes.ok || !flowRes.ok) throw new Error("API Error");

      const metricsData = await metricsRes.json();
      const chartData = await flowRes.json();

      setMetrics([
        { 
          label: "Caudal Actual", 
          value: `${metricsData.current_flow} m³/s`, 
          trend: "+2.4%", 
          isUp: true, 
          icon: <Activity size={20} />, 
          color: "text-primary" 
        },
        { 
          label: "Eficiencia Ener.", 
          value: "94.2%", 
          trend: "+1.2%", 
          isUp: true, 
          icon: <Droplet size={20} />, 
          color: "text-emerald-400" 
        },
        { 
          label: "Anomalías (24h)", 
          value: metricsData.anomalies_detected, 
          trend: "-12%", 
          isUp: false, 
          icon: <ShieldAlert size={20} />, 
          color: "text-red-400" 
        },
        { 
          label: "Nodos Activos", 
          value: metricsData.active_sensors, 
          trend: "Stable", 
          isUp: true, 
          icon: <Cpu size={20} />, 
          color: "text-sky-400" 
        },
      ]);
      setFlowData(chartData);
      setError(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError(true);
      // Fallback a datos mock si falla el fetch
      setMetrics([
        { label: "Caudal Actual", value: "38.5 m³/s", trend: "+2.4%", isUp: true, icon: <Activity size={20} />, color: "text-primary" },
        { label: "Eficiencia Ener.", value: "94.2%", trend: "+1.2%", isUp: true, icon: <Droplet size={20} />, color: "text-emerald-400" },
        { label: "Anomalías (24h)", value: "3", trend: "-12%", isUp: false, icon: <ShieldAlert size={20} />, color: "text-red-400" },
        { label: "Nodos Activos", value: "128", trend: "Estable", isUp: true, icon: <Cpu size={20} />, color: "text-sky-400" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="space-y-8 animate-in">
      {/* Dashboard Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Panel de Operaciones <span className="text-gray-600">—</span> General</h2>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Monitoreo en Vivo · Junín, Perú</p>
          </div>
        </div>
        
        <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/10">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Buscar reporte..." 
                className="bg-transparent border-none text-[10px] font-bold text-gray-400 placeholder:text-gray-700 focus:ring-0 pl-9 pr-6 uppercase tracking-widest"
              />
           </div>
           <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Exportar</button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <MetricCard key={i} {...metric} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Chart Container */}
        <div className="lg:col-span-8 glass-card rounded-[2.5rem] p-8 flex flex-col min-h-[450px] border-white/5 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
               <h3 className="text-xl font-bold text-white tracking-tight">Consumo Hidro-Logístico</h3>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Estimación IA vs Caudal Real</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl">
               <button className="px-3 py-1.5 text-[10px] font-black uppercase text-white bg-white/5 rounded-lg border border-white/10 shadow-lg">24h</button>
               <button className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-500 hover:text-gray-300">7d</button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center bg-white/[0.02] rounded-3xl animate-pulse">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Cargando dataset dinámico...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={flowData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#4b5563', fontSize: 10, fontWeight: 700}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#4b5563', fontSize: 10, fontWeight: 700}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', background: '#0d1425', padding: '12px'}}
                    itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Side Info Cards */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-card rounded-[2.5rem] p-8 border-white/5 flex flex-col group hover-glow transition-all">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-lg font-bold text-white tracking-tight">Zonas de Control</h3>
                 <MoreVertical size={16} className="text-gray-600" />
              </div>
              
              <div className="space-y-6">
                 <ZoneItem name="El Tambo" status="Optimizado" val={88} color="bg-emerald-500" />
                 <ZoneItem name="Huancayo Centro" status="Carga Alta" val={92} color="bg-primary" />
                 <ZoneItem name="Chilca" status="Puntos Críticos" val={42} color="bg-red-500" />
                 <ZoneItem name="Pilcomayo" status="Estable" val={74} color="bg-sky-500" />
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <Clock size={14} className="text-gray-600" />
                       <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Update 0.2s</span>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors">Ver Mapa Completo</button>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-tr from-primary/20 to-transparent p-8 rounded-[2.5rem] border border-primary/20 space-y-4">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <h4 className="text-white font-bold text-lg leading-tight">Optimización Automática</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">El motor de IA ha reducido las pérdidas por fuga en un <span className="text-white font-bold">12.4%</span> en este sector durante el último periodo mensual.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, isUp, icon, color }: Metric) {
  return (
    <div className="glass-card rounded-[2.5rem] p-8 border-white/5 hover-glow transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-[4rem] group-hover:bg-primary/5 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[10px] font-black ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trend}</span>
        </div>
      </div>
      
      <div>
        <h4 className="text-4xl font-black text-white tracking-tighter mb-1">{value}</h4>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.25em]">{label}</p>
      </div>
    </div>
  );
}

function ZoneItem({ name, status, val, color }: any) {
  return (
    <div className="space-y-3 cursor-pointer group/item">
       <div className="flex justify-between items-end">
          <div>
             <p className="text-sm font-bold text-white group-hover/item:text-primary transition-colors">{name}</p>
             <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-0.5">{status}</p>
          </div>
          <span className="text-[10px] font-black text-gray-500 tracking-widest">{val}%</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
          <div className={`h-full ${color} rounded-full transition-all duration-1000 group-hover/item:opacity-80`} style={{ width: `${val}%` }}></div>
       </div>
    </div>
  );
}
