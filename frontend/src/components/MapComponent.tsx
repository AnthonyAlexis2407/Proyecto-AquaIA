"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, Circle, Marker } from "react-leaflet";
import { Droplet, Cpu, AlertCircle, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons issue in React (Next.js bundler bug)
import L from "leaflet";

const JUNIN_COORDS: [number, number] = [-12.06, -75.21]; // Huancayo/Junín area centered

const ZONES = [
  { name: "El Tambo", coords: [-12.043, -75.216], val: "450 m³/h", status: "ok", color: "#10b981" },
  { name: "Huancayo Centro", coords: [-12.067, -75.210], val: "380 m³/h", status: "ok", color: "#0ea5e9" },
  { name: "Chilca", coords: [-12.083, -75.205], val: "520 m³/h", status: "danger", color: "#ef4444" },
  { name: "Pilcomayo", coords: [-12.060, -75.235], val: "290 m³/h", status: "warning", color: "#f59e0b" },
  { name: "Huancán", coords: [-12.115, -75.195], val: "210 m³/h", status: "ok", color: "#6366f1" },
];

export default function MapComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={JUNIN_COORDS} 
        zoom={13} 
        style={{ height: "100%", width: "100%", zIndex: 1, background: '#060b16' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        
        {ZONES.map((zone) => (
          <Circle 
            key={zone.name}
            center={zone.coords as [number, number]}
            radius={600}
            pathOptions={{ 
              color: zone.color, 
              fillColor: zone.color, 
              fillOpacity: 0.15, 
              weight: 2,
              dashArray: zone.status === 'danger' ? '5, 5' : '1'
            }}
          >
            <Popup className="water-popup">
              <div className="p-3 min-w-[160px] bg-[#0d1425] text-white rounded-xl border border-white/10 shadow-2xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{zone.name}</span>
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: zone.color }}></div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-black">{zone.val.split(' ')[0]}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">m³/h</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                   <span className="text-[9px] font-bold text-gray-500 uppercase">Estado</span>
                   <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-current opacity-80`} style={{ color: zone.color }}>
                      {zone.status === 'danger' ? 'Crítico' : zone.status === 'warning' ? 'Alerta' : 'Estable'}
                   </span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Custom Point Markers for Sensors */}
        <SensorMarker coords={[-12.05, -75.22]} id="IOT-SN-01" val="45 PSI" />
        <SensorMarker coords={[-12.075, -75.215]} id="IOT-SN-02" val="42 PSI" />
        <SensorMarker coords={[-12.09, -75.20]} id="IOT-SN-03" val="12 PSI" status="alert" />

      </MapContainer>

      {/* Professional Overlay Styling */}
      <style jsx global>{`
        .leaflet-container {
          background-color: #060b16 !important;
        }
        .water-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .water-popup .leaflet-popup-tip {
          background: #0d1425 !important;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .water-popup .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
}

function SensorMarker({ coords, id, val, status = 'ok' }: any) {
  const color = status === 'alert' ? '#ef4444' : '#10b981';
  
  const icon = L.divIcon({
    className: 'custom-sensor-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-6 h-6 rounded-full bg-${status === 'alert' ? 'red' : 'emerald'}-500/20 animate-ping opacity-60"></div>
        <div class="relative w-3 h-3 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <Marker position={coords} icon={icon}>
      <Popup className="water-popup">
        <div className="p-3 bg-[#0d1425] text-white rounded-xl border border-white/10 shadow-2xl space-y-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">{id}</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
             <span className="text-[10px] font-bold text-gray-500">Presión actual</span>
             <span className={`text-xs font-black ${status === 'alert' ? 'text-red-400' : 'text-emerald-400'}`}>{val}</span>
          </div>
          {status === 'alert' && (
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
               <AlertCircle className="w-3 h-3 text-red-500" />
               <span className="text-[9px] font-bold text-red-500 uppercase">Fuga Detectada</span>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
