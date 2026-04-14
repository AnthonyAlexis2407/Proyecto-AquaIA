# 🌊 AquaIA — Plataforma Inteligente de Monitoreo Hídrico

<p align="center">
  <strong>Plataforma de Inteligencia Artificial para la Optimización Logística y Monitoreo del Sistema Hídrico en la Región Junín</strong>
</p>

---

## 📋 Descripción General

**AquaIA** es una plataforma web completa que integra modelos de Machine Learning para el monitoreo, predicción y optimización del sistema hídrico en la Región Junín (Perú). El sistema utiliza sensores simulados y algoritmos de IA para:

- **Predecir la demanda hídrica** por zona geográfica
- **Detectar anomalías** (fugas, consumos irregulares) en tiempo real
- **Optimizar rutas de distribución** de agua
- **Generar alertas automáticas** clasificadas por severidad

## 🎯 Objetivos del Proyecto

| Problema | Objetivo | Indicador de Éxito |
|----------|----------|---------------------|
| Falta de planificación en distribución | Predecir demanda hídrica con LSTM y Prophet | MAPE < 10% a 7 días (PMV2) |
| Ausencia de detección de fugas | Detección de anomalías en tiempo real | Latencia < 5s, falsos positivos < 5% (PMV1) |
| Ineficiencia logística | Optimizar rutas con VRP (OR-Tools) | Reducir costos operativos ≥ 20% (PMV2) |

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 16)                   │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐│
│  │  Dashboard   │ │ Predicciones │ │  Alertas y Logística  ││
│  │  (Recharts)  │ │   IA /ai     │ │     /alerts           ││
│  └──────┬───────┘ └──────┬───────┘ └───────────┬───────────┘│
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │ HTTP (fetch)                      │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                    API REST v1                          │  │
│  │  /api/v1/dashboard/metrics    → Métricas generales     │  │
│  │  /api/v1/dashboard/flow-chart → Gráfico de caudal      │  │
│  │  /api/v1/ai/predict           → Predicción RF          │  │
│  │  /api/v1/ai/anomaly-check     → Detección IF           │  │
│  │  /api/v1/alerts               → Alertas activas        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌─────────────────────┐ ┌─────────────────────────────┐   │
│  │   Random Forest     │ │    Isolation Forest          │   │
│  │   (Predicción de    │ │    (Detección de anomalías   │   │
│  │    caudal m³/s)     │ │     en tiempo real)          │   │
│  └─────────────────────┘ └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🧠 Modelos de IA Implementados

### ✅ Fase 1 — PMV1: Detección de Anomalías (Actual)

| Modelo | Biblioteca | Función | Estado |
|--------|-----------|---------|--------|
| **Random Forest Regressor** | scikit-learn | Predicción de caudal (m³/s) basada en hora, temperatura y lluvia | ✅ Implementado |
| **Isolation Forest** | scikit-learn | Detección de anomalías en tiempo real (fugas, picos irregulares) | ✅ Implementado |

#### ¿Cómo funciona Isolation Forest?
- Se entrena con **2000 registros de datos normales** (caudal entre 35-45 m³/s)
- El parámetro `contamination=0.05` indica que se espera un 5% de datos anómalos
- Retorna `-1` para anomalías y `1` para valores normales
- **Latencia de detección: < 5 milisegundos** ✅

### 🔜 Fase 2 — PMV2: Predicción Avanzada (Próximo)

| Modelo | Biblioteca | Función | Estado |
|--------|-----------|---------|--------|
| **Prophet** | Meta Prophet | Predicción de demanda a largo plazo con estacionalidad | 🔜 Pendiente |
| **LSTM Autoencoder** | TensorFlow/Keras | Detección avanzada de anomalías y predicción de series temporales | 🔜 Pendiente |
| **XGBoost** | XGBoost | Clasificación de zonas de alto riesgo | 🔜 Pendiente |

### 🔜 Fase 3 — PMV2: Optimización Logística (Próximo)

| Herramienta | Biblioteca | Función | Estado |
|-------------|-----------|---------|--------|
| **VRP Solver** | Google OR-Tools | Optimización de rutas de distribución de agua | 🔜 Pendiente |

## 📁 Estructura del Proyecto

```
AQUAIA/
├── backend/                    # Servidor FastAPI (Python 3.11)
│   ├── main.py                 # Endpoints de la API REST
│   ├── ml_model.py             # Modelos de IA (RandomForest + IsolationForest)
│   ├── requirements.txt        # Dependencias Python
│   └── venv/                   # Entorno virtual
│
├── frontend/                   # Aplicación web (Next.js 16 + React 19)
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx        # Dashboard principal con gráfico de anomalías
│   │       ├── ai/page.tsx     # Centro de IA interactivo
│   │       ├── alerts/page.tsx # Centro de alertas y logística
│   │       ├── map/page.tsx    # Mapa geoespacial (Leaflet)
│   │       ├── layout.tsx      # Layout con sidebar de navegación
│   │       └── globals.css     # Sistema de diseño y variables CSS
│   └── package.json
│
└── README.md                   # Este archivo
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- **Python** 3.11+
- **Node.js** 18+
- **npm** 9+

### 1. Configurar el Backend

```bash
# Navegar al directorio del backend
cd backend

# Crear entorno virtual (si no existe)
python -m venv venv

# Activar entorno virtual (Windows)
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor FastAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`
La documentación Swagger (interactiva): `http://localhost:8000/docs`

### 2. Configurar el Frontend

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

## 🖥️ Requerimientos Funcionales

| Código | Nombre | Descripción | Estado |
|--------|--------|-------------|--------|
| RF-01 | Gestión de Consumo | Registrar consumo de agua por zona geográfica | 🔜 |
| RF-02 | Predicción IA | Predecir demanda con LSTM, Prophet, XGBoost | 🔧 Parcial (RF) |
| RF-03 | Optimización Logística | Optimizar rutas de distribución (VRP) | 🔜 |
| RF-04 | Detección de Anomalías | Detectar fugas con Isolation Forest y LSTM Autoencoder | ✅ IF activo |
| RF-05 | Integración IoT | Integrar datos de sensores IoT simulados | 🔧 Parcial |
| RF-06 | Mapa Geoespacial | Visualizar zonas en mapa interactivo (Leaflet) | ✅ |
| RF-07 | Alertas Automáticas | Generar alertas clasificadas por severidad | ✅ |
| RF-08 | Dashboards KPI | Proporcionar dashboards analíticos con KPIs | ✅ |
| RF-09 | Gestión de Usuarios | Gestionar usuarios con roles y JWT | 🔜 |
| RF-10 | Reportes Exportables | Generar reportes en PDF/Excel | 🔜 |
| RF-11 | Simulación de Escenarios | Simular escenarios de distribución | 🔜 |
| RF-12 | Series Temporales | Almacenar datos en InfluxDB/TimescaleDB | 🔜 |

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Lenguaje Backend | Python | 3.11 |
| Framework Backend | FastAPI | 0.110.x |
| Machine Learning | Scikit-learn | 1.4.x |
| Frontend | Next.js + React | 16.x / 19.x |
| Gráficos | Recharts | 3.8.x |
| Mapas | Leaflet + React-Leaflet | 1.9.x / 5.x |
| Estilos | TailwindCSS | 4.x |
| Íconos | Lucide React | 1.8.x |

## 📊 API Endpoints

### Estado Base
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Verificar estado del servidor |
| GET | `/health` | Estado de salud detallado (incluye modelos cargados) |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/dashboard/metrics` | Métricas generales calculadas con Isolation Forest |
| GET | `/api/v1/dashboard/flow-chart` | Datos de caudal (24h) con flags de anomalía |

### Inteligencia Artificial
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/ai/predict` | Predicción interactiva de caudal (Random Forest) |
| POST | `/api/v1/ai/anomaly-check` | Verificar si un valor es anómalo (Isolation Forest) |

### Logística y Alertas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/alerts` | Lista de alertas activas (infraestructura + generadas por IA) |

## 👥 Equipo de Desarrollo

Universidad Continental — Taller de Proyectos en Ingeniería de Sistemas e Informática

## 📄 Licencia

Este proyecto es de carácter académico, desarrollado como parte del Plan Maestro de Vinculación 2025-2027 de SEDAM Huancayo.

---

<p align="center">
  <em>AquaIA v2.0 — Inteligencia Artificial al servicio del recurso hídrico 💧</em>
</p>
