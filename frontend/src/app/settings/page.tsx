"use client";

import { useState } from "react";
import { 
  Settings as SettingsIcon, Bell, Shield, User, Database, 
  ChevronRight, Check, Moon, Sun, Monitor, Radio,
  Mail, MessageSquare, Gauge
} from "lucide-react";

export default function SettingsPage() {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Configuración del Sistema</h2>
        <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest leading-none">Ajustes de plataforma y parámetros de red AquaIA v2.0</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-12 min-h-0">
         {/* Navigation Tabs (Vertical) */}
         <div className="lg:col-span-3 space-y-3">
            <SettingsTabs icon={<User size={18} />} label="Perfil" active />
            <SettingsTabs icon={<Bell size={18} />} label="Notificaciones" />
            <SettingsTabs icon={<Shield size={18} />} label="Privacidad" />
            <SettingsTabs icon={<Database size={18} />} label="Endpoints API" />
            <SettingsTabs icon={<Gauge size={18} />} label="Pref. de Datos" />
         </div>

         {/* Content Area */}
         <div className="lg:col-span-9 space-y-8">
            {/* General Preferences Card */}
            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 space-y-10">
               <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Preferencias Generales</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Ajustes básicos de comunicación y visualización</p>
               </div>

               <div className="space-y-6">
                  {/* Toggle: Dark Mode */}
                  <SettingsToggle 
                    icon={<Moon size={18} />} 
                    title="Modo Oscuro Permanente" 
                    desc="Forzar la interfaz Deep Ocean Dark en todo el sistema." 
                    enabled={darkMode} 
                    onToggle={() => setDarkMode(!darkMode)}
                  />

                  {/* Toggle: Email Notif */}
                  <SettingsToggle 
                    icon={<Mail size={18} />} 
                    title="Alertas vía Email" 
                    desc="Envío automático de reportes de anomalías al correo institucional." 
                    enabled={notifEmail} 
                    onToggle={() => setNotifEmail(!notifEmail)}
                  />

                  {/* Toggle: SMS Notif */}
                  <SettingsToggle 
                    icon={<MessageSquare size={18} />} 
                    title="Alertas Críticas vía SMS" 
                    desc="Notificación inmediata al personal de guardia para alertas nivel HIGH." 
                    enabled={notifSMS} 
                    onToggle={() => setNotifSMS(!notifSMS)}
                  />

                  {/* Toggle: Debug */}
                  <SettingsToggle 
                    icon={<Radio size={18} />} 
                    title="Modo Desarrollador / Debug" 
                    desc="Mostrar logs técnicos de inferencia de IA en todas las pantallas." 
                    enabled={debugMode} 
                    onToggle={() => setDebugMode(!debugMode)}
                  />
               </div>

               <div className="pt-10 flex justify-end space-x-4">
                  <button className="px-8 py-3.5 bg-white/5 border border-white/10 text-gray-500 font-black rounded-2xl hover:text-white transition-all text-[10px] uppercase tracking-widest">Restaurar</button>
                  <button className="px-8 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center space-x-2">
                     <Check size={16} />
                     <span>Guardar Cambios</span>
                  </button>
               </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card rounded-[2.5rem] p-10 border-red-500/20 bg-red-500/[0.02] flex items-center justify-between">
               <div className="space-y-1">
                  <h4 className="text-lg font-bold text-red-400 tracking-tight">Reiniciar Sensores</h4>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Borra la caché de todos los nodos mesh activos.</p>
               </div>
               <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">Ejecutar Hard Reset</button>
            </div>
         </div>
      </div>
    </div>
  );
}

function SettingsTabs({ icon, label, active }: any) {
  return (
    <div className={`
      flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer group
      ${active ? 'bg-primary/10 border-primary/30 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}
    `}>
       <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl transition-colors ${active ? 'bg-primary text-white' : 'bg-white/5 text-gray-500 group-hover:text-primary'}`}>
             {icon}
          </div>
          <span className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{label}</span>
       </div>
       {active && <ChevronRight size={16} className="text-primary" />}
    </div>
  );
}

function SettingsToggle({ icon, title, desc, enabled, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
       <div className="flex items-center space-x-6">
          <div className="p-4 bg-white/5 rounded-2xl text-gray-500 group-hover:text-primary transition-colors">
             {icon}
          </div>
          <div>
             <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
             <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">{desc}</p>
          </div>
       </div>
       <button 
         onClick={onToggle}
         className={`
           w-14 h-8 rounded-full relative transition-all duration-500 overflow-hidden
           ${enabled ? 'bg-primary' : 'bg-gray-800'}
         `}
       >
          <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-lg ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
       </button>
    </div>
  );
}
