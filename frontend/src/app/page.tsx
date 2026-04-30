"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Droplet, ShieldAlert, BrainCircuit, Gauge, AlertTriangle, Cpu, MapPin, ArrowRight, TrendingUp, LineChart, Zap } from "lucide-react";
import { api, DashboardMetrics, ZoneConsumption } from "@/lib/api";
import dynamic from "next/dynamic";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => <div className="w-full h-full bg-white/5 rounded-[2rem] animate-pulse flex items-center justify-center"><span className="text-gray-600 text-xs">Cargando mapa...</span></div> });

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [zones, setZones] = useState<ZoneConsumption[]>([]);
  const [flowChart, setFlowChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [mRes, zRes, fRes] = await Promise.all([
        api.get("/api/v1/dashboard/metrics"),
        api.get("/api/v1/monitoring/zones"),
        api.get("/api/v1/dashboard/flow-chart"),
      ]);
      if (mRes.ok) setMetrics(await mRes.json());
      if (zRes.ok) setZones(await zRes.json());
      if (fRes.ok) setFlowChart(await fRes.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every 60s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
    );
  }

  const statusColor = metrics?.status === "OPERATIVO" ? "text-green-400" : metrics?.status === "ALERTA" ? "text-amber-400" : "text-red-400";
  const statusBg = metrics?.status === "OPERATIVO" ? "bg-green-500/10 border-green-500/20" : metrics?.status === "ALERTA" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Dashboard Central</h2>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">Distrito de Palián — Monitoreo en Tiempo Real</p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${statusBg}`}>
          <div className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')} animate-pulse`}></div>
          <span className={`text-xs font-black uppercase tracking-widest ${statusColor}`}>{metrics?.status || "..."}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard icon={<Cpu />} label="Sensores" value={`${metrics?.active_sensors || 0}/${metrics?.total_sensors || 0}`} sub="En línea" color="text-primary" />
        <KPICard icon={<Gauge />} label="Caudal" value={`${metrics?.flow_rate_m3s || 0}`} sub="m³/s promedio" color="text-sky-400" />
        <KPICard icon={<ShieldAlert />} label="Alertas" value={`${metrics?.alerts_active || 0}`} sub="Activas" color={metrics?.alerts_active && metrics.alerts_active > 0 ? "text-red-400" : "text-green-400"} />
        <KPICard icon={<MapPin />} label="Zonas" value={`${metrics?.zones_count || 0}`} sub="Monitoreadas" color="text-violet-400" />
      </div>

      {/* AI Insight */}
      <div className="glass-card rounded-[2rem] p-8">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-violet-500/10 rounded-2xl flex-shrink-0"><BrainCircuit className="w-6 h-6 text-violet-400" /></div>
          <div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Análisis IA en Tiempo Real</p>
            <p className="text-base text-gray-300 font-medium leading-relaxed">{metrics?.ai_prediction}</p>
          </div>
        </div>
      </div>

      {/* Chart + Map Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Flow Chart */}
        <div className="glass-card rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <LineChart className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Caudal 24h</h3>
            </div>
            <div className="flex space-x-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-primary">● Real</span>
              <span className="text-sky-400">● Predicho</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowChart}>
                <defs>
                  <linearGradient id="realFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} stroke="transparent" />
                <Tooltip contentStyle={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="real_flow" stroke="#10b981" strokeWidth={2} fill="url(#realFlow)" name="Caudal Real" />
                <Area type="monotone" dataKey="predicted_flow" stroke="#0ea5e9" strokeWidth={2} fill="url(#predFlow)" name="Predicción" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Map */}
        <div className="glass-card rounded-[2rem] overflow-hidden" style={{ height: 420 }}>
          <MapComponent />
        </div>
      </div>

      {/* Zone Consumption */}
      <div className="glass-card rounded-[2rem] p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Droplet className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Consumo por Zona (HU-01)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {zones.map(zone => {
            const isOk = zone.status === "OPERATIVO";
            const isAlert = zone.status === "ALERTA";
            return (
              <div key={zone.zone_id} className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isOk ? 'bg-white/5 border-white/5' : isAlert ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{zone.zone_name}</p>
                <p className="text-2xl font-bold text-white mt-2">{zone.consumption_m3h} <span className="text-xs text-gray-500">m³/h</span></p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-gray-600">{zone.sensor_count} sensores</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isOk ? 'text-green-400' : isAlert ? 'text-amber-400' : 'text-red-400'}`}>{zone.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, sub, color }: any) {
  return (
    <div className="glass-card rounded-[2rem] p-8 hover-glow transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{label} — {sub}</p>
    </div>
  );
}
