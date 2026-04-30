"use client";

import { useEffect, useState } from "react";
import { Cpu, Signal, Battery, Edit3, Check, X, MapPin, Thermometer, Droplets, Activity } from "lucide-react";
import { api, Sensor } from "@/lib/api";

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Sensor | null>(null);

  const fetchSensors = async () => {
    try {
      const res = await api.get("/api/v1/sensors");
      if (res.ok) setSensors(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchSensors(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    try {
      const res = await api.put(`/api/v1/sensors/${editing.id}`, {
        threshold_min: editing.threshold_min,
        threshold_max: editing.threshold_max,
        reading_interval_sec: editing.reading_interval_sec,
        status: editing.status,
      });
      if (res.ok) { await fetchSensors(); setEditing(null); }
    } catch (err) { console.error(err); }
  };

  const typeIcons: Record<string, any> = { flow: <Droplets size={18} />, pressure: <Thermometer size={18} />, quality: <Activity size={18} />, level: <Signal size={18} /> };
  const typeLabels: Record<string, string> = { flow: "Caudal", pressure: "Presión", quality: "Calidad", level: "Nivel" };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Sensores IoT</h2>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">Gestión con umbrales configurables (HU-03)</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{sensors.filter(s => s.status === "online").length}/{sensors.length} en línea</span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sensors.map(sensor => {
            const isOnline = sensor.status === "online";
            const isWarning = sensor.status === "warning";
            return (
              <div key={sensor.id} className="glass-card rounded-[2rem] p-8 hover-glow transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${isOnline ? 'bg-primary/10 text-primary' : isWarning ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      {typeIcons[sensor.sensor_type] || <Cpu size={18} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{sensor.sensor_code}</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sensor.model}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isOnline ? 'bg-green-500/10 text-green-400 border border-green-500/20' : isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {sensor.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <InfoCell label="Tipo" value={typeLabels[sensor.sensor_type] || sensor.sensor_type} />
                  <InfoCell label="Zona" value={sensor.zone_name || `Zona ${sensor.zone_id}`} />
                  <InfoCell label="Batería" value={`${sensor.battery_level}%`} highlight={sensor.battery_level < 30} />
                  <InfoCell label="Intervalo" value={`${sensor.reading_interval_sec}s`} />
                </div>

                {/* Thresholds Display */}
                <div className="p-4 bg-white/5 rounded-xl mb-6 border border-white/5">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Umbrales Configurados</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500">Mín: </span>
                      <span className="text-sm font-bold text-sky-400">{sensor.threshold_min}</span>
                    </div>
                    <div className="flex-1 mx-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 via-primary to-amber-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500">Máx: </span>
                      <span className="text-sm font-bold text-amber-400">{sensor.threshold_max}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(sensor)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-primary/10 hover:border-primary/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <Edit3 size={14} /><span>Editar Umbrales</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/85 backdrop-blur-md animate-in">
          <div className="w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border-white/10 relative">
            <button onClick={() => setEditing(null)} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl"><Cpu className="w-6 h-6 text-primary" /></div>
              <div>
                <h3 className="text-xl font-black text-white">{editing.sensor_code}</h3>
                <p className="text-xs text-gray-500">{editing.model} — {typeLabels[editing.sensor_type]}</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Umbral Mínimo</label><input type="number" step="0.1" value={editing.threshold_min} onChange={e => setEditing({...editing, threshold_min: parseFloat(e.target.value)})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-sky-500 outline-none" /></div>
                <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Umbral Máximo</label><input type="number" step="0.1" value={editing.threshold_max} onChange={e => setEditing({...editing, threshold_max: parseFloat(e.target.value)})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none" /></div>
              </div>
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Intervalo de Lectura (seg)</label><input type="number" value={editing.reading_interval_sec} onChange={e => setEditing({...editing, reading_interval_sec: parseInt(e.target.value)})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" /></div>
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Estado</label>
                <select value={editing.status} onChange={e => setEditing({...editing, status: e.target.value})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none">
                  <option value="online">Online</option><option value="warning">Warning</option><option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-10">
              <button onClick={() => setEditing(null)} className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 font-bold rounded-2xl hover:text-white transition-all">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center space-x-2"><Check size={18} /><span>Guardar</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 bg-white/5 rounded-xl">
      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-bold mt-1 ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
