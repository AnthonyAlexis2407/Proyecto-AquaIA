"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import { BrainCircuit, Route, ShieldCheck } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons issue in React (Next.js bundler bug)
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;


const JUNIN_COORDS: [number, number] = [-11.1586, -75.9926];

const ZONE_COORDS: Record<string, [number, number]> = {
  "Sector Norte": [-11.0, -75.9],
  "Sector Sur": [-11.4, -76.1],
  "Centro Histórico": [-11.15, -75.99],
  "Jauja Centro": [-11.77, -75.5],
  "El Tambo": [-12.06, -75.21]
};

export default function MapComponent() {
  const [riskZones, setRiskZones] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [logisticsInfo, setLogisticsInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar datos iniciales
    const loadData = async () => {
      try {
        const [alertsRes, riskRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/alerts"),
          fetch("http://127.0.0.1:8000/api/v1/ai/risk-zones")
        ]);
        
        if (!alertsRes.ok || !riskRes.ok) throw new Error("Failed to fetch data");

        const alertData = await alertsRes.json();
        const zones = await riskRes.json();
        
        if (Array.isArray(zones)) {
          setRiskZones(zones);
        } else {
          console.warn("risk-zones API did not return an array", zones);
          setRiskZones([]);
        }

        if (Array.isArray(alertData)) {
          setAlerts(alertData.filter((a: any) => a.severity === 'HIGH'));
        }
      } catch (err) {
        console.error("Failed to load map data", err);
      }
    };

    loadData();
  }, []);

  const handleOptimizeRoute = async () => {
    setLoading(true);
    // Filtrar solo alertas activas con coordenadas simuladas (para el demo)
    const locations = alerts.map((a, i) => ({
      id: a.id,
      lat: JUNIN_COORDS[0] + (Math.random() - 0.5) * 0.5,
      lon: JUNIN_COORDS[1] + (Math.random() - 0.5) * 0.5
    }));

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/logistics/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations })
      });
      if (!response.ok) throw new Error("Optimization failed");
      const data = await response.json();
      if (data.route_points) {
        setRoute(data.route_points as [number, number][]);
        setLogisticsInfo(data);
      }
    } catch (err) {
      console.error("Error optimizando ruta", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={JUNIN_COORDS} 
        zoom={10} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Represa Principal (Punto Operativo) */}
        <Marker position={[-11.15, -75.99]}>
          <Popup>
            <div className="font-sans">
              <strong className="text-blue-600 block mb-1">Represa Central Junín</strong>
              <span className="text-xs text-gray-500">Caudal estable.</span>
            </div>
          </Popup>
        </Marker>

        {/* Zona de Alerta (Círculo Rojo) */}
        <Circle 
          center={[-11.45, -75.5]} 
          pathOptions={{ color: 'red', fillColor: '#ef4444' }} 
          radius={5000}
        >
          <Popup>
            <div className="font-sans">
              <strong className="text-red-500 block mb-1">ALERTA ALRT-901-X</strong>
              <span className="text-xs text-gray-500">Fuga detectada / Válvula Jauja</span>
            </div>
          </Popup>
        </Circle>

        {/* Sensor secundario */}
        <Marker position={[-11.0, -76.2]}>
          <Popup>
            <div className="font-sans">
              <strong className="text-green-600 block mb-1">Sensor TR-001</strong>
              <span className="text-xs text-gray-500">Operativo</span>
            </div>
          </Popup>
        </Marker>

        {/* Phase 2: Risk Zones (XGBoost) */}
        {Array.isArray(riskZones) && riskZones.map((z, idx) => {
          const coords = ZONE_COORDS[z.zone] || [-11.2, -76.0];
          const color = z.risk_score === 'HIGH' ? '#ef4444' : z.risk_score === 'MEDIUM' ? '#f97316' : '#22c55e';
          return (
            <Circle 
              key={`risk-${idx}`}
              center={coords}
              radius={8000}
              pathOptions={{ color: color, fillColor: color, fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
            >
              <Popup>
                <div className="font-sans">
                  <strong style={{ color }}>Riesgo {z.risk_score}: {z.zone}</strong>
                  <p className="text-xs text-gray-500 mt-1">Análisis por XGBoost</p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Phase 2: Optimized Route (OR-Tools) */}
        {route.length > 0 && (
          <Polyline 
            positions={route} 
            pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
          />
        )}
      </MapContainer>

      {/* Control Panel Over Map */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px]">
          <h4 className="text-sm font-bold text-gray-200 border-b border-white/5 pb-2 mb-3 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            Logística IA (Phase 2)
          </h4>
          
          <div className="space-y-3">
            <button 
              onClick={handleOptimizeRoute}
              disabled={loading || alerts.length === 0}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Route className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
              {loading ? 'Optimizando...' : 'Optimizar Ruta Crítica'}
            </button>
            <p className="text-[10px] text-gray-500 italic text-center">
              {alerts.length} alertas críticas activas.
            </p>
          </div>

          {logisticsInfo && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 animate-in fade-in duration-500">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Distancia Total:</span>
                <span className="text-indigo-400 font-mono font-bold">{logisticsInfo.distance_km} km</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Tiempo Est.:</span>
                <span className="text-indigo-400 font-mono font-bold">{logisticsInfo.estimated_time_mins} min</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                <ShieldCheck className="w-3 h-3 text-green-400" />
                <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Ruta Verificada</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
