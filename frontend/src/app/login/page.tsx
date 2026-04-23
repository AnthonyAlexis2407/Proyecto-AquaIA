"use client";

import { useState } from "react";
import { Droplet, Mail, Lock, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [role, setRole] = useState("Operador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simular login y persistir sesión
    setTimeout(() => {
      localStorage.setItem("aquaia_session", "true");
      router.push("/");
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-[#060b16] overflow-hidden">
      {/* Left Side: Hero Section (Elegant Water) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-[#0d1425]">
        {/* Animated Water Background (CSS Only) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_50%)] animate-pulse"></div>
          <div className="absolute top-[30%] right-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.03)_0%,transparent_50%)] animate-pulse delay-700"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <Droplet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">AquaIA</h1>
              <p className="text-xs text-primary font-bold tracking-[0.3em] uppercase opacity-80">Sistema Hídrico Inteligente</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <h2 className="text-5xl font-extrabold text-white leading-tight">
            Gestión hídrica <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              inteligente
            </span> para la región Junín
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed font-light">
            Monitoreo en tiempo real, predicción de demanda y optimización logística mediante modelos avanzados de Machine Learning.
          </p>

          <div className="grid grid-cols-3 gap-6 pt-10">
            <StatCard label="8.7%" sub="MAPE predicción" />
            <StatCard label="94.2%" sub="Recall anomalías" />
            <StatCard label="23%" sub="Reducción logística" />
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-2">
          <div className="w-8 h-1 bg-primary rounded-full"></div>
          <div className="w-2 h-1 bg-white/10 rounded-full"></div>
          <div className="w-2 h-1 bg-white/10 rounded-full"></div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-4">Universidad Continental © 2026</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#060b16] relative">
        {/* Decorative elements for mobile */}
        <div className="lg:hidden absolute top-10 left-10">
            <div className="flex items-center space-x-2">
                <Droplet className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl tracking-tight text-white">AquaIA</span>
            </div>
        </div>

        <div className="w-full max-w-md space-y-10 animate-in">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Sistema operativo — 5 zonas activas</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-white tracking-tight">Iniciar sesión</h3>
            <p className="text-gray-500 font-medium">Accede a tu panel de gestión hídrica</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Rol de Acceso</p>
              <div className="grid grid-cols-3 gap-3">
                {["Operador", "Analista", "Admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold transition-all duration-300 border
                      ${role === r 
                        ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10" 
                        : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"}
                    `}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Correo Electrónico</p>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@sedam.gob.pe"
                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contraseña</p>
                  <Link href="#" className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                     <CheckCircle2 className={`w-5 h-5 transition-all ${password.length >= 8 ? 'text-primary scale-100' : 'text-gray-800 scale-90'}`} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-3
                ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Ingresar al sistema</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            ¿Problemas de acceso? <Link href="#" className="text-gray-400 hover:text-white font-semibold transition-colors">Contacta al administrador</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="space-y-1 group">
      <p className="text-3xl font-bold text-white group-hover:text-primary transition-colors">{label}</p>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">{sub}</p>
    </div>
  );
}
