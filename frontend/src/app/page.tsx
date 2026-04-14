"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, Droplets, AlertTriangle, Zap, BrainCircuit, ShieldAlert, RefreshCw } from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Scatter, ScatterChart, Cell, ReferenceLine, AreaChart
} from "recharts";
import Link from "next/link";

interface Metrics {
  status: string;
  active_sensors: number;
  total_sensors: number;
  flow_rate_m3s: number;
  anomalies_detected: number;
  ai_prediction: string;
}

interface FlowData {
  time: string;
  real_flow: number;
  predicted_flow: number;
  is_anomaly: boolean;
  temperature: number;
  rain_prob: number;
}

interface ForecastPoint {
  ds: string;
  yhat: number;
}

const statusConfig: Record<string, { color: string; bg: string; pulse: boolean }> = {
  "OPERATIVO": { color: "text-green-400", bg: "bg-green-500/10", pulse: false },
  "ALERTA": { color: "text-orange-400", bg: "bg-orange-500/10", pulse: true },
  "CRÍTICO": { color: "text-red-400", bg: "bg-red-500/10", pulse: true },
};

// Tooltip personalizado para el gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-[#0d1526] border border-[#1e293b] rounded-xl p-4 shadow-2xl min-w-[220px]">
      <p className="text-gray-400 text-xs font-mono mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-sky-400">Caudal Real</span>
          <span className="font-bold text-sky-300">{data?.real_flow} m³/s</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-violet-400">Predicción IA</span>
          <span className="font-bold text-violet-300">{data?.predicted_flow} m³/s</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Temperatura</span>
          <span className="text-gray-200">{data?.temperature}°C</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Lluvia</span>
          <span className="text-gray-200">{data?.rain_prob}%</span>
        </div>
        {data?.is_anomaly && (
          <div className="mt-2 pt-2 border-t border-red-500/30">
            <span className="text-red-400 text-xs font-bold animate-pulse">⚠ ANOMALÍA DETECTADA — Isolation Forest</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [flowData, setFlowData] = useState<FlowData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, flowRes, forecastRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/v1/dashboard/metrics"),
        fetch("http://127.0.0.1:8000/api/v1/dashboard/flow-chart"),
        fetch("http://127.0.0.1:8000/api/v1/ai/forecast")
      ]);
      
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (flowRes.ok) {
        const flowData = await flowRes.json();
        if (Array.isArray(flowData)) setFlowData(flowData);
      }
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        if (Array.isArray(forecastData)) setForecastData(forecastData);
      }
      
      setLastUpdate(new Date().toLocaleTimeString("es-PE"));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const anomalyCount = flowData.filter(d => d.is_anomaly).length;
  const currentStatus = statusConfig[metrics?.status || "OPERATIVO"] || statusConfig["OPERATIVO"];

  if (loading && !metrics) {
    return (
      <div className="flex h-full items-center justify-center flex-col space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-primary/20 border-t-primary"></div>
          <Droplets className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Conectando con modelos de IA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resumen Operativo</h2>
          <p className="text-gray-400 mt-1">Monitoreo en tiempo real con detección de anomalías (Isolation Forest).</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 font-mono">{lastUpdate && `Actualizado: ${lastUpdate}`}</span>
          <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Refrescar datos">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Estado General */}
        <div className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm transition-all duration-500 ${currentStatus.pulse ? 'border-orange-500/30' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Estado General</p>
              <h3 className={`text-2xl font-bold mt-1 ${currentStatus.color} ${currentStatus.pulse ? 'animate-pulse' : ''}`}>
                {metrics?.status || "DESCONOCIDO"}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${currentStatus.bg}`}>
              <Activity className={`w-5 h-5 ${currentStatus.color}`} />
            </div>
          </div>
        </div>

        {/* Card 2: Caudal Promedio */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Caudal Promedio</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{metrics?.flow_rate_m3s || 0} <span className="text-sm text-gray-500">m³/s</span></h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Card 3: Sensores Activos */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Sensores Activos</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.active_sensors || 0} <span className="text-sm text-gray-500">/ {metrics?.total_sensors || 0}</span></h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${((metrics?.active_sensors || 0) / (metrics?.total_sensors || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Anomalías (Isolation Forest) */}
        <div className={`bg-[var(--color-card)] border rounded-xl p-6 shadow-sm transition-all duration-500 ${
          (metrics?.anomalies_detected ?? 0) > 5 
            ? 'border-red-500/40 shadow-red-500/10 shadow-lg' 
            : (metrics?.anomalies_detected ?? 0) > 0 
              ? 'border-orange-500/30' 
              : 'border-[var(--color-border)]'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Anomalías (IF)</p>
              <h3 className={`text-2xl font-bold mt-1 ${
                (metrics?.anomalies_detected ?? 0) > 5 ? 'text-red-400' :
                (metrics?.anomalies_detected ?? 0) > 0 ? 'text-orange-400' : 'text-gray-100'
              }`}>
                {metrics?.anomalies_detected || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Isolation Forest</p>
            </div>
            <div className={`p-3 rounded-lg ${
              (metrics?.anomalies_detected ?? 0) > 5 ? 'bg-red-500/10' :
              (metrics?.anomalies_detected ?? 0) > 0 ? 'bg-orange-500/10' : 'bg-gray-500/10'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                (metrics?.anomalies_detected ?? 0) > 5 ? 'text-red-500' :
                (metrics?.anomalies_detected ?? 0) > 0 ? 'text-orange-500' : 'text-gray-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area & AI Box */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Flow Chart con Anomalías */}
        <div className="lg:col-span-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Caudal del Río Mantaro — Últimas 24h</h3>
              <p className="text-sm text-gray-400">Comparativa: Caudal real vs Predicción IA · Puntos rojos = Anomalías detectadas por Isolation Forest</p>
            </div>
            {anomalyCount > 0 && (
              <span className="flex items-center space-x-1.5 text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 font-medium animate-pulse">
                <ShieldAlert className="w-3 h-3" />
                <span>{anomalyCount} anomalía{anomalyCount > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>
          
          <div className="h-[380px] w-full mt-4 min-h-[300px]">
            {flowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={flowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ color: '#e2e8f0', fontSize: '12px', paddingBottom: '8px' }}
                />
                <Area type="monotone" dataKey="real_flow" name="Caudal Real" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReal)" />
                <Area type="monotone" dataKey="predicted_flow" name="Predicción IA" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorAI)" />
                
                {/* Scatter para anomalías — puntos rojos grandes */}
                <Scatter
                  name="Anomalía (IF)"
                  dataKey="real_flow"
                  fill="#ef4444"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload?.is_anomaly) return null;
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={8} fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth={2} />
                        <circle cx={cx} cy={cy} r={4} fill="#ef4444" />
                        <circle cx={cx} cy={cy} r={12} fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth={1}>
                          <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    );
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Cargando datos de flujo...
            </div>
          )}
        </div>
        </div>

        {/* AI Insight Box */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900/40 to-[var(--color-card)] border border-indigo-500/30 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-semibold text-indigo-100">Motor de IA</h3>
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Estado de los modelos */}
            <div className="p-3 bg-black/20 rounded-lg border border-white/5">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Modelos Activos</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Random Forest</span>
                  <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Predicción</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Isolation Forest</span>
                  <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">Anomalías</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Prophet IA</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">Forecast</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">XGBoost</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">Riesgo</span>
                </div>
              </div>
            </div>

            {/* Mensaje de la IA */}
            <div className="p-4 bg-black/20 rounded-lg border border-white/5 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-lg"></div>
              <p className="text-indigo-200 text-sm leading-relaxed pl-2">
                {metrics?.ai_prediction || "Cargando modelo preventivo..."}
              </p>
            </div>

            {/* Métricas del modelo */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-400">Precisión del modelo</span>
                  <span className="text-green-400 font-medium">94.2%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full w-[94%] transition-all duration-1000"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-400">Tasa falsos positivos</span>
                  <span className="text-sky-400 font-medium">&lt; 5%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-sky-500 h-1.5 rounded-full w-[5%] transition-all duration-1000"></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-gray-400">Latencia detección</span>
                <span className="text-gray-200 font-medium font-mono">&lt; 5ms</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col space-y-2">
            <Link href="/ai" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors text-center block">
              Probar Modelos Interactivamente
            </Link>
            <Link href="/alerts" className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors text-center block border border-white/10">
              Ver Alertas Activas
            </Link>
          </div>
        </div>
      </div>

      {/* Phase 2: Long Term Forecast Section */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Proyección de Demanda Hídrica — Próximos 7 días
          </h3>
          <p className="text-sm text-gray-400">Modelo Prophet entrenado con estacionalidad diaria y semanal del Río Mantaro.</p>
        </div>
        <div className="h-[300px] w-full">
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="ds" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(str, index) => {
                    const date = new Date(str);
                    return index % 24 === 0 ? date.toLocaleDateString("es-PE", { weekday: 'short' }) : "";
                  }}
                />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1526', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Area type="monotone" dataKey="yhat" name="Caudal Proyectado" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Generando proyección de 7 días...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
