"use client";

import dynamic from "next/dynamic";
import { ZoomIn } from "lucide-react";

// Importación dinámica obligatoria para Leaflet en Next.js (SSR no soportado por Window)
const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Red Hídrica de Junín</h2>
          <p className="text-gray-400 mt-1">Visor geográfico interactivo de sensores y embalses (OpenStreetMap).</p>
        </div>
        <div className="flex space-x-2">
           <button className="bg-[var(--color-card)] border border-[var(--color-border)] p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ZoomIn className="w-5 h-5 text-gray-400" />
           </button>
           <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              Centrar Vista
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-[var(--color-border)] rounded-xl relative overflow-hidden flex items-center justify-center">
          <DynamicMap />
      </div>
    </div>
  );
}
