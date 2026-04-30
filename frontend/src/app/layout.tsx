"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { 
  Droplet, LayoutDashboard, Map as MapIcon, BrainCircuit, 
  ShieldAlert, Settings, Activity, Cpu, FileText, 
  Zap, Bell, LogOut, MapPin
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, getUser, removeToken } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [alertCount, setAlertCount] = useState(0);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (token && userData) {
      setIsAuth(true);
      setUser(userData);
      // Fetch alert count
      fetch("http://127.0.0.1:8000/api/v1/alerts/count")
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setAlertCount(data.total); })
        .catch(() => {});
    } else if (!isLoginPage) {
      router.push("/login");
    }
    setLoading(false);
  }, [isLoginPage, router]);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("aquaia_session");
    setIsAuth(false);
    router.push("/login");
  };

  if (loading) {
    return (
      <html lang="es" className="dark h-full">
        <body className={`${inter.className} h-full bg-[#060b16] flex items-center justify-center`}>
           <div className="flex flex-col items-center space-y-4">
              <Droplet className="w-12 h-12 text-primary animate-bounce" />
              <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
           </div>
        </body>
      </html>
    );
  }

  if (isLoginPage) {
    return (
      <html lang="es" className="dark h-full antialiased">
        <body className={`${inter.className} min-h-screen bg-[#060b16] text-[#f8fafc]`}>
          {children}
        </body>
      </html>
    );
  }

  const userInitials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <html lang="es" className="dark h-full antialiased">
      <body className={`${inter.className} h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-72 bg-[#0d1425] border-r border-white/5 flex flex-col z-20 shadow-2xl flex-shrink-0">
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <div className="bg-primary/20 p-2 rounded-xl mr-3">
              <Droplet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AquaIA</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium leading-none mt-1">Gestión Hídrica v3.0</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
            <div>
              <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Principal</p>
              <div className="space-y-1">
                <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === "/"} />
                <NavItem href="/monitoreo" icon={<Activity size={18} />} label="Monitoreo" active={pathname === "/monitoreo"} />
                <NavItem href="/alerts" icon={<Bell size={18} />} label="Alertas" active={pathname === "/alerts"} badge={alertCount > 0 ? String(alertCount) : undefined} />
              </div>
            </div>

            <div>
              <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Análisis</p>
              <div className="space-y-1">
                <NavItem href="/ai" icon={<BrainCircuit size={18} />} label="Predicción IA" active={pathname === "/ai"} />
                <NavItem href="/optimization" icon={<Zap size={18} />} label="Optimización" active={pathname === "/optimization"} />
                <NavItem href="/simulation" icon={<Activity size={18} />} label="Simulación" active={pathname === "/simulation"} />
                <NavItem href="/map" icon={<MapIcon size={18} />} label="Mapa Hídrico" active={pathname === "/map"} />
              </div>
            </div>

            <div>
              <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Sistema</p>
              <div className="space-y-1">
                <NavItem href="/sensors" icon={<Cpu size={18} />} label="Sensores IoT" active={pathname === "/sensors"} />
                <NavItem href="/zones" icon={<MapPin size={18} />} label="Zonas" active={pathname === "/zones"} />
                <NavItem href="/reports" icon={<FileText size={18} />} label="Reportes" active={pathname === "/reports"} />
                <NavItem href="/settings" icon={<Settings size={18} />} label="Configuración" active={pathname === "/settings"} />
              </div>
            </div>
          </nav>
          
          <div className="p-4 border-t border-white/5">
            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.full_name || "Usuario"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role || "Sin rol"}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 group transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4 group-hover:text-red-500" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-20 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 z-10 flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Palián, Huancayo / Central</span>
              <h2 className="text-sm font-semibold text-white mt-1">Panel de Control — AquaIA v3.0</h2>
            </div>
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Sistema Conectado</span>
                </div>
                <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{user?.role}</span>
                </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-10 bg-[#060b16] custom-scrollbar">
            {children}
          </main>
        </div>

        <style jsx global>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, active, badge }: { href: string; icon: React.ReactNode; label: string; active?: boolean; badge?: string }) {
  return (
    <Link 
      href={href}
      prefetch={true} 
      className={`
        flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
        ${active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-gray-400 hover:bg-white/5 hover:text-white"}
      `}
    >
      <div className="flex items-center space-x-3">
        <span className={`${active ? "text-white" : "group-hover:text-primary transition-colors"}`}>
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`
          text-[10px] font-bold px-1.5 py-0.5 rounded-md
          ${active ? "bg-white/20 text-white" : "bg-red-500 text-white"}
        `}>
          {badge}
        </span>
      )}
    </Link>
  );
}
