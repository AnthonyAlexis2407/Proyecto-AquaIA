"use client";

import { Brain, Cpu, Database, Server, TerminalSquare, RefreshCw, Activity, ShieldAlert, Zap, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function AIPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [hour, setHour] = useState(12);
  const [temp, setTemp] = useState(15.0);
  const [rain, setRain] = useState(0.0);
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isAnomaly, setIsAnomaly] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Anomaly checker state
  const [anomalyFlow, setAnomalyFlow] = useState(40.0);
  const [anomalyResult, setAnomalyResult] = useState<{is_anomaly: boolean; latency_ms: number; message: string} | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  // Phase 2 state
  const [riskZones, setRiskZones] = useState<{zone: string; risk_score: string; metrics: any}[]>([]);
  const [riskLoading, setRiskLoading] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulating terminal logs for startup
    const initialLogs = [
      "[BOOT] Iniciando Motor AquaIA v2.0...",
      "[MODEL] Cargando Scikit-Learn RandomForestRegressor...",
      "[MODEL] Cargando Scikit-Learn IsolationForest (Detección de Anomalías)...",
      "[DATA] Sintetizando histórico de clima Junín (2000 registros)...",
      "[TRAIN] Random Forest — Entrenamiento completado: 50 árboles, MAE: 0.12",
      "[TRAIN] Isolation Forest — Entrenamiento completado: contamination=5%",
      "[STATUS] Precisión actual del modelo: 94.2%",
      "[STATUS] Tasa de falsos positivos: < 5%",
      "[WS] Recepción de WebSockets OK. Listo para predicciones interactivas.",
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < initialLogs.length) {
        setLogs(prev => [...prev, initialLogs[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), msg]);
  };

  const handlePrediction = async () => {
    setLoading(true);
    addLog(`[POST] /api/v1/ai/predict — {hour: ${hour}, temp: ${temp}, rain: ${rain}}`);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hour: hour,
          temperature: temp,
          rain_prob: rain
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPrediction(data.predicted_flow_m3s);
        setConfidence(data.confidence_level);
        setIsAnomaly(data.is_anomaly);
        addLog(`[OK] ${data.message}`);
        if (data.is_anomaly) {
          addLog(`[⚠ ANOMALY] Isolation Forest clasificó esta predicción como ANÓMALA`);
        }
      } else {
        addLog(`[ERROR] ${JSON.stringify(data)}`);
      }
    } catch (err) {
      addLog(`[ERROR] Red o CORS: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnomalyCheck = async () => {
    setAnomalyLoading(true);
    addLog(`[POST] /api/v1/ai/anomaly-check — {flow_value: ${anomalyFlow}}`);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/ai/anomaly-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_value: anomalyFlow })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAnomalyResult(data);
        addLog(`[OK] ${data.message} — Latencia: ${data.latency_ms}ms`);
      } else {
        addLog(`[ERROR] ${JSON.stringify(data)}`);
      }
    } catch (err) {
      addLog(`[ERROR] Red o CORS: ${err}`);
    } finally {
      setAnomalyLoading(false);
    }
  };

  const handleRiskScan = async () => {
    setRiskLoading(true);
    addLog(`[GET] /api/v1/ai/risk-zones — Ejecutando escaneo XGBoost...`);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/ai/risk-zones");
      if (!response.ok) throw new Error("Failed to scan zones");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRiskZones(data);
        addLog(`[OK] Escaneo de riesgo completado selectivamente para ${data.length} zonas.`);
      } else {
        const errorMsg = !Array.isArray(data) ? "API no retornó un arreglo" : "Fallo en API";
        addLog(`[ERROR] ${errorMsg}`);
        console.warn("Risk scan response was not an array:", data);
      }
    } catch (err) {
      addLog(`[ERROR] Red o CORS: ${err}`);
    } finally {
      setRiskLoading(false);
    }
  };

  const getLogColor = (log: string) => {
    if (log.includes("ERROR")) return "text-red-400";
    if (log.includes("ANOMALY") || log.includes("ANÓMALA") || log.includes("⚠")) return "text-orange-400";
    if (log.includes("OK") || log.includes("STATUS") || log.includes("TRAIN")) return "text-green-400";
    if (log.includes("BOOT") || log.includes("MODEL")) return "text-indigo-400";
    if (log.includes("POST")) return "text-sky-400";
    return "text-gray-400";
  };

  return (
    <div className="h-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
           <Brain className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Centro de Inteligencia Interactiva</h2>
          <p className="text-gray-400 mt-1">Prueba los modelos Random Forest e Isolation Forest en tiempo real.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prediction Section */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-5">
              <Activity className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-semibold text-gray-200">Predicción de Caudal (Random Forest)</h3>
            </div>
            
            {/* Form Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                <label className="block text-sm font-medium text-gray-400 mb-3">Hora del día</label>
                <input type="range" min="0" max="23" value={hour} onChange={(e) => setHour(Number(e.target.value))} className="w-full accent-sky-500" />
                <div className="text-center mt-2 font-mono text-sky-300 text-lg">{hour}:00 h</div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                <label className="block text-sm font-medium text-gray-400 mb-3">Temperatura (°C)</label>
                <input type="range" min="-10" max="35" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-orange-500" />
                <div className="text-center mt-2 font-mono text-orange-300 text-lg">{temp} °C</div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                <label className="block text-sm font-medium text-gray-400 mb-3">Prob. Lluvia (%)</label>
                <input type="range" min="0" max="100" value={rain} onChange={(e) => setRain(Number(e.target.value))} className="w-full accent-blue-500" />
                <div className="text-center mt-2 font-mono text-blue-300 text-lg">{rain}%</div>
              </div>
            </div>

            <button 
              onClick={handlePrediction}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 active:scale-[0.99]">
              {loading ? <RefreshCw className="animate-spin w-5 h-5 mr-2" /> : <Activity className="w-5 h-5 mr-2" />}
              Ejecutar Predicción
            </button>

            {/* Result Card */}
            {prediction !== null && (
              <div className={`mt-5 p-5 rounded-xl border transition-all duration-500 ${
                isAnomaly 
                  ? 'bg-red-500/5 border-red-500/30' 
                  : 'bg-green-500/5 border-green-500/30'
              }`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Predicción</p>
                    <p className="text-2xl font-bold text-primary">{prediction} <span className="text-sm text-gray-400">m³/s</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Confianza</p>
                    <p className="text-2xl font-bold text-green-400">{confidence}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estado</p>
                    <p className={`text-lg font-bold ${isAnomaly ? 'text-red-400' : 'text-green-400'}`}>
                      {isAnomaly ? '⚠ ANOMALÍA' : '✅ NORMAL'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Anomaly Detection Section */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-5">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-gray-200">Detección de Anomalías (Isolation Forest)</h3>
              <span className="text-xs px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">PMV1</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Ingresa un valor de caudal para verificar si es anómalo. El modelo Isolation Forest fue entrenado con datos normales (35-45 m³/s).
              Valores fuera de este rango serán clasificados como <span className="text-red-400 font-medium">anomalías</span>.
            </p>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Valor de caudal (m³/s)</label>
                <input
                  type="number"
                  value={anomalyFlow}
                  onChange={(e) => setAnomalyFlow(Number(e.target.value))}
                  step="0.5"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-lg font-mono text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="ej: 40.0"
                />
              </div>
              <button 
                onClick={handleAnomalyCheck}
                disabled={anomalyLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 active:scale-[0.99]">
                {anomalyLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
                <span>Verificar</span>
              </button>
            </div>

            {/* Quick Test Values */}
            <div className="flex gap-2 mt-3">
              <span className="text-xs text-gray-500">Pruebas rápidas:</span>
              {[15, 25, 40, 55, 70].map(v => (
                <button
                  key={v}
                  onClick={() => setAnomalyFlow(v)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                    v < 30 || v > 50 
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                      : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {v} m³/s
                </button>
              ))}
            </div>

            {/* Anomaly Result */}
            {anomalyResult && (
              <div className={`mt-5 p-5 rounded-xl border transition-all duration-500 ${
                anomalyResult.is_anomaly 
                  ? 'bg-red-500/5 border-red-500/30' 
                  : 'bg-green-500/5 border-green-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {anomalyResult.is_anomaly ? (
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-red-400" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-green-400" />
                      </div>
                    )}
                    <div>
                      <p className={`font-bold text-lg ${anomalyResult.is_anomaly ? 'text-red-400' : 'text-green-400'}`}>
                        {anomalyResult.is_anomaly ? 'ANOMALÍA DETECTADA' : 'VALOR NORMAL'}
                      </p>
                      <p className="text-sm text-gray-400">{anomalyResult.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Latencia</p>
                    <p className={`text-lg font-mono font-bold ${anomalyResult.latency_ms < 5 ? 'text-green-400' : 'text-orange-400'}`}>
                      {anomalyResult.latency_ms}ms
                    </p>
                    <p className="text-xs text-gray-500">{anomalyResult.latency_ms < 5 ? '✅ < 5ms' : '⚠ Revisar'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Assessment Section (Phase 2) */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-gray-200">Clasificación de Riesgo (XGBoost)</h3>
                <span className="text-xs px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400">PMV2</span>
              </div>
              <button 
                onClick={handleRiskScan}
                disabled={riskLoading}
                className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                {riskLoading ? <RefreshCw className="animate-spin w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                Actualizar Riesgos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(riskZones) && riskZones.length > 0 ? riskZones.map((z, idx) => (
                <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-200">{z.zone}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      z.risk_score === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      z.risk_score === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                      'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {z.risk_score}
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Volatilidad:</span>
                      <span className="text-gray-300 font-mono">{z.metrics?.volatility}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Anomalías (24h):</span>
                      <span className="text-gray-300 font-mono">{z.metrics?.anomalies_24h}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-8 text-center bg-black/10 rounded-xl border border-dashed border-white/5">
                  <p className="text-gray-500 text-sm">Ejecuta el escáner para ver el análisis de riesgo por zona.</p>
                </div>
              )}
            </div>
          </div>

          {/* Topology Diagram */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Topología de Modelos — Pipeline IA</h3>
            <div className="bg-black/20 rounded-lg border border-white/5 p-8 overflow-hidden relative">
              <div className="flex items-center justify-between max-w-3xl mx-auto relative">
                {/* Input */}
                <div className="flex flex-col items-center space-y-2 z-10">
                  <div className="w-16 h-16 rounded-xl border-2 border-sky-500/50 bg-sky-500/10 flex items-center justify-center">
                    <Database className="w-7 h-7 text-sky-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Input Data</span>
                  <span className="text-[10px] text-gray-600">Hora, Temp, Lluvia</span>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-600 z-10" />

                {/* Random Forest */}
                <div className="flex flex-col items-center space-y-2 z-10">
                  <div className={`w-16 h-16 rounded-xl border-2 border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center transition-all duration-500 ${loading ? 'shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-pulse' : ''}`}>
                    <Cpu className="w-7 h-7 text-indigo-400" />
                  </div>
                  <span className="text-xs text-indigo-300 font-medium">Random Forest</span>
                  <span className="text-[10px] text-gray-600">Predicción</span>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-600 z-10" />

                {/* Isolation Forest */}
                <div className="flex flex-col items-center space-y-2 z-10">
                  <div className={`w-16 h-16 rounded-xl border-2 border-red-500/50 bg-red-500/10 flex items-center justify-center transition-all duration-500 ${anomalyLoading ? 'shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' : ''}`}>
                    <ShieldAlert className="w-7 h-7 text-red-400" />
                  </div>
                  <span className="text-xs text-red-300 font-medium">Isolation Forest</span>
                  <span className="text-[10px] text-gray-600">Anomalías</span>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-600 z-10" />

                {/* Output */}
                <div className="flex flex-col items-center space-y-2 z-10">
                  <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
                    isAnomaly
                      ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      : 'border-green-500/50 bg-green-500/10'
                  }`}>
                    <Server className="w-7 h-7" style={{ color: isAnomaly ? '#f87171' : '#34d399' }} />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">Resultado</span>
                  <span className={`text-[10px] font-bold ${isAnomaly ? 'text-red-400' : 'text-green-400'}`}>
                    {prediction !== null ? (isAnomaly ? 'ANOMALÍA' : 'NORMAL') : 'Esperando...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Console */}
        <div className="bg-[#0a0a0a] border border-[var(--color-border)] rounded-xl p-0 shadow-sm flex flex-col font-mono lg:min-h-[600px]">
          <div className="h-12 bg-white/5 border-b border-white/5 flex items-center justify-between px-4">
            <div className="flex items-center">
              <TerminalSquare className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400 font-medium">HTTP Log Console</span>
            </div>
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto w-full break-words text-[12px] leading-relaxed">
            {logs.map((log, i) => {
              if (!log) return null;
              return (
                <div key={i} className="mb-1.5 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-forwards">
                  <span className={`${getLogColor(log)} mr-1`}>{'>'}</span>
                  <span className={getLogColor(log)} style={{opacity: 0.85}}>{log}</span>
                </div>
              );
            })}
            <div className="mt-2 animate-pulse">
                <span className="text-green-500 mr-1">{'>'}</span>
                <span className="text-gray-500">_</span>
            </div>
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
