"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit3, Trash2, Globe, X, Check, ShieldAlert } from "lucide-react";
import { api, Zone } from "@/lib/api";

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchZones = async () => {
    try {
      const res = await api.get("/api/v1/zones?active_only=false");
      if (res.ok) setZones(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchZones(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    try {
      const payload = { name: editing.name, description: editing.description, latitude: editing.latitude, longitude: editing.longitude, radius_m: editing.radius_m, is_active: editing.is_active, priority: editing.priority };
      const res = isNew
        ? await api.post("/api/v1/zones", payload)
        : await api.put(`/api/v1/zones/${editing.id}`, payload);
      if (res.ok) { await fetchZones(); setEditing(null); setIsNew(false); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar zona?")) return;
    try { await api.delete(`/api/v1/zones/${id}`); await fetchZones(); } catch {}
  };

  const priorityLabels: Record<number, string> = { 1: "Alta", 2: "Media", 3: "Baja" };
  const priorityColors: Record<number, string> = { 1: "text-red-400", 2: "text-amber-400", 3: "text-sky-400" };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Gestión de Zonas</h2>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">Zonas geográficas — Palián, Huancayo (HU-14)</p>
        </div>
        <button
          onClick={() => { setIsNew(true); setEditing({ id: 0, name: "", description: "", latitude: -12.0735, longitude: -75.228, radius_m: 500, is_active: true, priority: 2 }); }}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={18} /><span>Nueva Zona</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {zones.map(zone => (
            <div key={zone.id} className="glass-card rounded-[2rem] p-8 hover-glow transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{zone.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      <span className={priorityColors[zone.priority]}>Prioridad {priorityLabels[zone.priority]}</span>
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${zone.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {zone.is_active ? "Activa" : "Inactiva"}
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{zone.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl"><p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Latitud</p><p className="text-sm font-bold text-white mt-1">{zone.latitude.toFixed(4)}</p></div>
                <div className="p-4 bg-white/5 rounded-xl"><p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Longitud</p><p className="text-sm font-bold text-white mt-1">{zone.longitude.toFixed(4)}</p></div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl mb-6">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Radio de cobertura</p>
                <p className="text-sm font-bold text-primary mt-1">{zone.radius_m} metros</p>
              </div>
              <div className="flex space-x-3 pt-6 border-t border-white/5">
                <button onClick={() => { setEditing(zone); setIsNew(false); }} className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"><Edit3 size={14} /><span>Editar</span></button>
                <button onClick={() => handleDelete(zone.id)} className="flex items-center justify-center px-4 py-3 bg-red-500/5 border border-red-500/10 text-red-400/50 hover:text-red-400 rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/85 backdrop-blur-md animate-in">
          <div className="w-full max-w-lg glass-card rounded-[2.5rem] p-10 shadow-2xl border-white/10 relative">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
            <h3 className="text-xl font-black text-white mb-8">{isNew ? "Nueva Zona" : "Editar Zona"}</h3>
            <div className="space-y-5">
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Nombre</label><input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" /></div>
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Descripción</label><textarea value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} rows={2} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Latitud</label><input type="number" step="0.0001" value={editing.latitude} onChange={e => setEditing({...editing, latitude: parseFloat(e.target.value)})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" /></div>
                <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Longitud</label><input type="number" step="0.0001" value={editing.longitude} onChange={e => setEditing({...editing, longitude: parseFloat(e.target.value)})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Radio (m)</label><input type="number" value={editing.radius_m} onChange={e => setEditing({...editing, radius_m: parseInt(e.target.value)})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none" /></div>
                <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Prioridad</label><select value={editing.priority} onChange={e => setEditing({...editing, priority: parseInt(e.target.value)})} className="w-full mt-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary outline-none"><option value={1}>Alta</option><option value={2}>Media</option><option value={3}>Baja</option></select></div>
              </div>
            </div>
            <div className="flex space-x-4 mt-10">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 font-bold rounded-2xl hover:text-white transition-all">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center space-x-2"><Check size={18} /><span>Guardar</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
