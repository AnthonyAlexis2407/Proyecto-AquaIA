"use client";

import { useState, useEffect } from "react";
import { 
  Cpu, Plus, Search, Filter, MoreVertical, 
  MapPin, Battery, Wifi, Activity, 
  PlusCircle, Trash2, Edit3, X, Check,
  RefreshCw, Radio
} from "lucide-react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/5 w-full h-full rounded-2xl" />,
});

interface Sensor {
  id: string;
  model: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  battery: number;
  lastUpdate: string;
  lat?: number;
  lng?: number;
}

const INITIAL_SENSORS: Sensor[] = [
  { id: "IOT-SN-01", model: "AquaSense v4", location: "El Tambo Sect 2", status: "online", battery: 92, lastUpdate: "hace 2 min", lat: -12.043, lng: -75.216 },
  { id: "IOT-SN-02", model: "AquaSense v4", location: "Centro Histórico", status: "online", battery: 85, lastUpdate: "hace 5 min", lat: -12.067, lng: -75.210 },
  { id: "IOT-SN-03", model: "AquaSense Pro", location: "Chilca Nodo B", status: "warning", battery: 12, lastUpdate: "hace 1 hora", lat: -12.083, lng: -75.205 },
];

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newSensor, setNewSensor] = useState({ id: "", model: "AquaSense v4", zone: "Pilcomayo" });

  // Simulación de sincronización periódica
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleAddSensor = (e: React.FormEvent) => {
    e.preventDefault();
    const sensor: Sensor = {
      id: newSensor.id || `IOT-SN-${Math.floor(Math.random() * 900) + 100}`,
      model: newSensor.model,
      location: `${newSensor.zone} (Sector Nuevo)`,
      status: "online",
      battery: 100,
      lastUpdate: "Ahora mismo"
    };
    setSensors([sensor, ...sensors]);
    setIsAdding(false);
    setNewSensor({ id: "", model: "AquaSense v4", zone: "Pilcomayo" });
  };

  const handleDelete = (id: string) => {
    setSensors(sensors.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Gestión de Nodos IoT</h2>
           <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">
             {sensors.length} dispositivos operativos sincronizados con el backend
           </p>
        </div>
        
        <div className="flex items-center space-x-3">
           <button 
             onClick={handleSync}
             className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-primary hover:border-primary/30 transition-all group"
             title="Sincronizar Sensores"
           >
              <RefreshCw size={20} className={isSyncing ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'} />
           </button>
           <button 
             onClick={() => setIsAdding(true)} 
             className="flex items-center space-x-2 px-6 py-3 bg-primary text-white text-xs font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
           >
              <Plus size={18} />
              <span>DESPLEGAR SENSOR</span>
           </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 min-h-0">
        {/* Sensor List */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
           <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                <input 
                  type="text" 
                  placeholder="Filtrar por MAC, ID o Sector..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-gray-700"
                />
              </div>
           </div>

           <div className="flex-1 glass-card rounded-[2.5rem] overflow-hidden flex flex-col border-white/5 shadow-2xl">
              <div className="overflow-y-auto custom-scrollbar flex-1 min-h-[400px]">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0d1425] z-10">
                       <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600 border-b border-white/5">
                          <th className="px-10 py-6">Hardware / ID</th>
                          <th className="px-10 py-6">Estado</th>
                          <th className="px-10 py-6">Ubicación</th>
                          <th className="px-10 py-6 text-center">Batería</th>
                          <th className="px-10 py-6 text-right pr-14">Acción</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {sensors.length > 0 ? sensors.map((sensor) => (
                         <tr key={sensor.id} className="group hover:bg-white/[0.02] transition-all">
                            <td className="px-10 py-8">
                               <div className="flex items-center space-x-5">
                                  <div className={`p-4 rounded-2xl border transition-all ${sensor.status === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-white/5 border-white/10 text-primary opacity-60'}`}>
                                     <Cpu size={24} />
                                  </div>
                                  <div>
                                     <p className="text-base font-bold text-white tracking-tight">{sensor.id}</p>
                                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{sensor.model}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <StatusBadge status={sensor.status} />
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center space-x-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                                  <MapPin size={16} className="text-primary/40" />
                                  <span className="text-sm font-semibold">{sensor.location}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex flex-col items-center space-y-2">
                                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${sensor.battery < 20 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} 
                                        style={{ width: `${sensor.battery}%` }}
                                      />
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-gray-600">{sensor.battery}%</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right pr-14">
                               <div className="flex items-center justify-end space-x-3">
                                  <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-700 hover:text-white transition-all"><Edit3 size={18} /></button>
                                  <button 
                                    onClick={() => handleDelete(sensor.id)}
                                    className="p-2.5 hover:bg-red-500/10 rounded-xl text-gray-700 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       )) : (
                         <tr>
                           <td colSpan={5} className="py-20 text-center">
                              <p className="text-gray-600 font-bold uppercase tracking-widest">No hay sensores desplegados</p>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Side Visualization */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card rounded-[2.5rem] p-8 h-full min-h-[500px] flex flex-col border-white/5 shadow-2xl overflow-hidden relative">
              <div className="flex justify-between items-center mb-10 z-10">
                 <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Capa de Sensores</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Coordenadas en vivo</p>
                 </div>
                 <div className="p-3 bg-emerald-500/10 rounded-2xl animate-pulse">
                    <Radio className="w-6 h-6 text-emerald-500" />
                 </div>
              </div>
              
              <div className="flex-1 bg-[#060b16] rounded-3xl relative overflow-hidden ring-1 ring-white/5 shadow-inner">
                 <DynamicMap />
                 {/* Floating Legend */}
                 <div className="absolute top-6 right-6 z-[400] bg-background/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl space-y-3">
                    <LegendItem color="bg-emerald-500" label="Sincronizado" />
                    <LegendItem color="bg-orange-500" label="Mantenimiento" />
                    <LegendItem color="bg-red-500" label="Desconectado" />
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-2xl font-black text-white">{sensors.filter(s => s.status === 'online').length}</p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Nodos Online</p>
                 </div>
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-2xl font-black text-primary">0</p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Baja Señal</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modal Profesional de Despliegue */}
      {isAdding && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-3xl glass-card rounded-[3rem] p-12 shadow-2xl border-white/10 relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32"></div>
              
              <button onClick={() => setIsAdding(false)} className="absolute top-10 right-10 p-3 text-gray-600 hover:text-white transition-colors"><X size={28} /></button>

              <div className="flex items-center space-x-5 mb-12">
                 <div className="p-5 bg-primary/20 rounded-3xl border border-primary/30 shadow-lg shadow-primary/20">
                    <PlusCircle size={36} className="text-primary" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Nuevo Nodo de Monitoreo</h3>
                    <p className="text-sm text-gray-500 font-medium">Asignar punto de control a la red hídrica</p>
                 </div>
              </div>

              <form onSubmit={handleAddSensor} className="grid grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pl-2">Identificador (MAC/ID)</label>
                       <input 
                         type="text" 
                         required
                         value={newSensor.id}
                         onChange={(e) => setNewSensor({...newSensor, id: e.target.value})}
                         placeholder="SN-XXXX-XXXX"
                         className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-800 focus:border-primary transition-all outline-none font-medium text-base shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pl-2">Tipo de Hardware</label>
                       <select 
                         className="w-full px-6 py-4.5 bg-[#0d1425] border border-white/10 rounded-2xl text-white focus:border-primary transition-all outline-none font-medium appearance-none shadow-inner"
                         value={newSensor.model}
                         onChange={(e) => setNewSensor({...newSensor, model: e.target.value})}
                       >
                          <option value="AquaSense v4">AquaSense v4 (Caudal)</option>
                          <option value="AquaSense Pro">AquaSense Pro (Presión/pH)</option>
                          <option value="FlowMaster 200">FlowMaster 200 (Turbidez)</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pl-2">Zona Operativa</label>
                       <select 
                         className="w-full px-6 py-4.5 bg-[#0d1425] border border-white/10 rounded-2xl text-white focus:border-primary transition-all outline-none font-medium appearance-none shadow-inner"
                         value={newSensor.zone}
                         onChange={(e) => setNewSensor({...newSensor, zone: e.target.value})}
                       >
                          <option value="Pilcomayo">Pilcomayo</option>
                          <option value="El Tambo">El Tambo</option>
                          <option value="Centro">Centro Histórico</option>
                          <option value="Chilca">Chilca (Nodo Crítico)</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pl-2">Geoposicionamiento Profesional</label>
                    <div className="aspect-square bg-white/5 border border-white/5 rounded-3xl overflow-hidden relative group cursor-crosshair">
                       <div className="absolute inset-0 flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <MapPin className="text-primary opacity-30 absolute animate-pulse" size={60} />
                          <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] z-10 px-6 py-3 bg-background/90 backdrop-blur-md rounded-2xl border border-primary/20 shadow-2xl">
                             Seleccionar en Mapa
                          </span>
                       </div>
                       <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-3">
                          <CoordBox label="LAT" val="-12.0673" />
                          <CoordBox label="LON" val="-75.2100" />
                       </div>
                    </div>
                 </div>

                 <div className="col-span-2 pt-10 flex space-x-6">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-5 bg-white/5 border border-white/10 text-gray-600 font-black rounded-2xl hover:text-white transition-all uppercase tracking-[0.2em] text-[10px]"
                    >
                      Cancelar Operación
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3"
                    >
                      <Check size={20} strokeWidth={3} />
                      <span>Confirmar Despliegue</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    online: { label: "Sincronizado", color: "text-emerald-500", bg: "bg-emerald-500/10", dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]" },
    offline: { label: "Fuera de Línea", color: "text-gray-600", bg: "bg-white/5", dot: "bg-gray-700" },
    warning: { label: "Mantenimiento", color: "text-orange-500", bg: "bg-orange-500/10", dot: "bg-orange-500 shadow-[0_0_8px_#f59e0b]" },
  };
  const config = configs[status as keyof typeof configs];
  
  return (
    <div className={`inline-flex items-center space-x-2.5 px-4 py-1.5 ${config.bg} border border-current opacity-80 rounded-full ${config.color} transition-all`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
      <span className="text-[10px] font-black uppercase tracking-[0.15em]">{config.label}</span>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center space-x-3">
       <div className={`w-2 h-2 rounded-full ${color}`}></div>
       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function CoordBox({ label, val }: any) {
  return (
    <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center shadow-xl">
       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-xs font-mono font-bold text-gray-300">{val}</p>
    </div>
  );
}
