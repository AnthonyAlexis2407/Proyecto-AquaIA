/**
 * AquaIA — Centralized API Client
 * Cliente API con interceptor JWT automático, base URL configurable,
 * y manejo de errores 401 con redirect a login.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- Token Management ---
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aquaia_token");
}

export function setToken(token: string): void {
  localStorage.setItem("aquaia_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("aquaia_token");
  localStorage.removeItem("aquaia_user");
}

export function getUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("aquaia_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: any): void {
  localStorage.setItem("aquaia_user", JSON.stringify(user));
}

// --- API Fetch Wrapper ---
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — redirect to login
  if (res.status === 401) {
    removeToken();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  return res;
}

// --- Convenience Methods ---
export const api = {
  get: (endpoint: string) => apiFetch(endpoint),
  
  post: (endpoint: string, body: any) => apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  }),

  put: (endpoint: string, body: any) => apiFetch(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  }),

  delete: (endpoint: string) => apiFetch(endpoint, {
    method: "DELETE",
  }),
};

// --- Auth API ---
export async function login(email: string, password: string) {
  const res = await api.post("/api/v1/auth/login", { email, password });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error de autenticación");
  }
  const data = await res.json();
  setToken(data.access_token);
  setUser(data.user);
  return data;
}

export function logout() {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// --- Typed API Helpers ---
export interface Zone {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  is_active: boolean;
  priority: number;
  created_at?: string;
}

export interface Sensor {
  id: number;
  sensor_code: string;
  model: string;
  sensor_type: string;
  zone_id: number | null;
  zone_name?: string;
  latitude: number;
  longitude: number;
  status: string;
  battery_level: number;
  threshold_min: number;
  threshold_max: number;
  reading_interval_sec: number;
  last_reading_at?: string;
}

export interface Alert {
  id: number;
  alert_code: string;
  zone_id: number | null;
  zone_name?: string;
  sensor_id: number | null;
  location: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "RESOLVED" | "ACKNOWLEDGED";
  source: string;
  description: string;
  detected_value?: number;
  threshold_value?: number;
  resolved_by?: number;
  resolution_note?: string;
  resolved_at?: string;
  created_at?: string;
}

export interface DashboardMetrics {
  status: string;
  active_sensors: number;
  total_sensors: number;
  flow_rate_m3s: number;
  anomalies_detected: number;
  ai_prediction: string;
  zones_count: number;
  alerts_active: number;
}

export interface ZoneConsumption {
  zone_id: number;
  zone_name: string;
  consumption_m3h: number;
  sensor_count: number;
  anomaly_count: number;
  status: string;
  priority: number;
}
