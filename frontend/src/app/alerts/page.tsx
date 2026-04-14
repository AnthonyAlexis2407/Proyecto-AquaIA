"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, AlertCircle, TriangleAlert, Info, BrainCircuit, RefreshCw, Clock, Cpu } from "lucide-react";

interface AlertData {
  id: string;
  location: string;
  severity: string;
  description: string;
  timestamp: string;
  is_active: boolean;
  source: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "ISOLATION_FOREST" | "SENSOR">("ALL");

  const fetchAlerts = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/v1/alerts")
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("No se pudieron cargar las alertas", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
    // Re-fetch cada 15 segundos
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-500/10 border-red-500/30 text-red-500";
      case "MEDIUM": return "bg-orange-500/10 border-orange-500/30 text-orange-500";
      default: return "bg-blue-500/10 border-blue-500/30 text-blue-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "HIGH": return <ShieldAlert className="w-5 h-5" />;
      case "MEDIUM": return <TriangleAlert className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "HIGH": return "Alta";
      case "MEDIUM": return "Media";
      default: return "Baja";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "ISOLATION_FOREST": return <BrainCircuit className="w-3.5 h-3.5" />;
      case "SENSOR": return <Cpu className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "ISOLATION_FOREST": return "Isolation Forest";
      case "SENSOR": return "Sensor/Infraestructura";
      default: return "Manual";
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter !== "ALL" && a.severity !== filter) return false;
    if (sourceFilter !== "ALL" && a.source !== sourceFilter) return false;
    return true;
  });

  const alertStats = {
    total: alerts.length,
    high: alerts.filter(a => a.severity === "HIGH").length,
    medium: alerts.filter(a => a.severity === "MEDIUM").length,
    low: alerts.filter(a => a.severity === "LOW").length,
    ai: alerts.filter(a => a.source === "ISOLATION_FOREST").length,
    sensor: alerts.filter(a => a.source === "SENSOR").length,
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Centro de Alertas y Logística</h2>
            <p className="text-gray-400 mt-1">Gestión de crisis hídricas y despliegue de mantenimiento — Región Junín</p>
          </div>
        </div>
        <button onClick={fetchAlerts} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Refrescar alertas">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Alertas</p>
          <p className="text-2xl font-bold mt-1">{alertStats.total}</p>
        </div>
        <div className="bg-[var(--color-card)] border border-red-500/20 rounded-lg p-4">
          <p className="text-xs text-red-400 uppercase tracking-wider">Alta Severidad</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{alertStats.high}</p>
        </div>
        <div className="bg-[var(--color-card)] border border-orange-500/20 rounded-lg p-4">
          <p className="text-xs text-orange-400 uppercase tracking-wider">Media Severidad</p>
          <p className="text-2xl font-bold mt-1 text-orange-400">{alertStats.medium}</p>
        </div>
        <div className="bg-[var(--color-card)] border border-indigo-500/20 rounded-lg p-4">
          <p className="text-xs text-indigo-400 uppercase tracking-wider">Generadas por IA</p>
          <div className="flex items-center space-x-2 mt-1">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <p className="text-2xl font-bold text-indigo-400">{alertStats.ai}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500 flex items-center mr-2">Filtrar:</span>
        {/* Severity filters */}
        {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === f
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            {f === "ALL" ? "Todas" : f === "HIGH" ? "🔴 Alta" : f === "MEDIUM" ? "🟠 Media" : "🔵 Baja"}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1"></div>
        {/* Source filters */}
        {(["ALL", "ISOLATION_FOREST", "SENSOR"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setSourceFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center space-x-1 ${
              sourceFilter === f
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            {f === "ALL" ? <span>Todas fuentes</span> : f === "ISOLATION_FOREST" ? <><BrainCircuit className="w-3 h-3" /><span>Solo IA</span></> : <><Cpu className="w-3 h-3" /><span>Solo Sensores</span></>}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl relative overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-black/20">
          <h3 className="font-semibold text-base">Alertas Activas en Región Junín</h3>
          <span className="text-sm px-3 py-1 bg-white/5 rounded-full text-gray-300">Mostrando: {filteredAlerts.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:bg-white/[0.03] ${getSeverityStyle(alert.severity)} ${
                  alert.source === "ISOLATION_FOREST" ? "ring-1 ring-indigo-500/20" : ""
                }`}
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="font-bold">{alert.location}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-black/30 border border-white/10 uppercase tracking-wider font-mono">
                        {alert.id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        alert.source === "ISOLATION_FOREST"
                          ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                          : "bg-gray-500/10 border border-gray-500/30 text-gray-400"
                      }`}>
                        {getSourceIcon(alert.source)}
                        <span>{getSourceLabel(alert.source)}</span>
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-gray-300 opacity-90">{alert.description}</p>
                    <div className="flex items-center space-x-1 mt-2 opacity-50">
                      <Clock className="w-3 h-3" />
                      <p className="text-xs font-mono">{alert.timestamp}</p>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 shrink-0">
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
                    Despachar Técnico
                  </button>
                  <button className="px-4 py-2 bg-black/20 hover:bg-black/40 rounded-lg text-sm transition-colors border border-transparent">
                    Ignorar / Falso Pos.
                  </button>
                </div>
              </div>
            ))
          )}

          {!loading && filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg text-gray-400">Todo despejado</h3>
              <p className="text-sm text-gray-500">No hay alertas que coincidan con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
