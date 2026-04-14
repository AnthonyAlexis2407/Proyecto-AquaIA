import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Droplet, LayoutDashboard, Map as MapIcon, BrainCircuit, ShieldAlert, Settings } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AquaIA | Plataforma Inteligente",
  description: "Plataforma Inteligente para la Optimización Logística y Monitoreo del Sistema Hídrico en la Región Junín.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex`}>
        {/* Sidebar */}
        <aside className="w-64 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col z-20">
          <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
            <Droplet className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-xl font-bold tracking-wider">AquaIA</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span>Resumen Global</span>
            </Link>
            <Link href="/map" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors">
              <MapIcon className="w-5 h-5" />
              <span>Red Hídrica (Junín)</span>
            </Link>
            <Link href="/ai" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors">
              <BrainCircuit className="w-5 h-5" />
              <span>Predicciones IA</span>
            </Link>
            <Link href="/alerts" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors">
              <ShieldAlert className="w-5 h-5" />
              <span>Alertas Activas</span>
            </Link>
          </nav>
          
          <div className="px-4 py-4 border-t border-[var(--color-border)]">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <header className="h-16 bg-[var(--color-card)]/50 backdrop-blur-sm border-b border-[var(--color-border)] flex items-center justify-between px-8 z-10 sticky top-0">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-400">Región Junín / Status</span>
            </div>
            <div className="flex items-center space-x-4">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm font-medium text-green-400">Sistema Conectado</span>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--color-background)] p-8 animate-in fade-in duration-500">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

