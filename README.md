# 🌊 AquaIA — Plataforma Inteligente de Monitoreo Hídrico (v2.5)

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Hexagonal-blueviolet?style=for-the-badge&logo=architecture" alt="Hexagonal Architecture">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/AI-Machine%20Learning-FF6F00?style=for-the-badge&logo=scikit-learn" alt="Machine Learning">
</p>

---

## 📋 Descripción General

**AquaIA** es una solución integral de inteligencia artificial diseñada para la **Región Junín (Perú)**, específicamente enfocada en la gestión y optimización del recurso hídrico (Río Mantaro). La plataforma combina monitoreo en tiempo real, detección predictiva de fallos y optimización logística para garantizar un suministro eficiente y resiliente.

### 🌟 Capacidades Actuales
- 🔮 **Predicción de Caudal**: Estimación precisa de flujo basada en variables climáticas.
- 🚨 **Detección de Anomalías**: Identificación instantánea de fugas o consumos irregulares.
- 📅 **Pronóstico de Demanda**: Anticipación de necesidades hídricas a 7 días.
- 🗺️ **Mapeo de Riesgo**: Clasificación de sectores vulnerables mediante IA.
- 🚚 **Logística Inteligente**: Optimización de rutas para mantenimiento y atención de alertas.

---

## 🏗️ Arquitectura Hexagonal (Ports & Adapters)

El proyecto implementa una **Arquitectura Hexagonal**, desacoplando la lógica de negocio (IA y Reglas de Dominio) de los agentes externos (Frameworks, APIs, Bases de Datos).

### 🔷 Estructura de Capas
1.  **Capa de Dominio (Corazón)**: Ubicada principalmente en `ml_model.py`. Contiene la esencia de AquaIA: los modelos entrenados, las heurísticas de predicción y la lógica de optimización. No depende de FastAPI ni de React.
2.  **Puertos (Ports)**: Definidos mediante interfaces lógicas y modelos de datos (Pydantic) que especifican cómo el dominio se comunica con el exterior.
3.  **Adaptadores (Adapters)**:
    *   **Inbound (Entrada)**: Endpoints de **FastAPI** que traducen peticiones HTTP en instrucciones para el dominio.
    *   **Outbound (Salida)**: Integraciones con librerías especializadas (**OR-Tools**, **Prophet**, **XGBoost**) que actúan como servicios de soporte para el dominio.

---

## 🔄 Evolución del Proyecto: Iteraciones (PMVs)

AquaIA ha evolucionado a través de dos fases críticas de desarrollo:

### ✅ PMV1: Cimiento y Monitoreo Real (Finalizado)
*Enfoque en la estabilidad y detección inmediata.*
- **Modelos**: Random Forest (Regresión) e Isolation Forest (Anomalías).
- **Logros**:
    - Dashboard interactivo con métricas en tiempo real.
    - Detección de fugas con latencia < 5ms.
    - Sistema de alertas visuales clasificadas por severidad.
    - Integración de mapas base con Leaflet.

### 🚀 PMV2: Inteligencia Avanzada y Optimización (Actual)
*Enfoque en la proacción y eficiencia operativa.*
- **Modelos**:
    - **Prophet (Meta)**: Predicciones estacionales de demanda a 7 días.
    - **XGBoost**: Clasificación multivariable de zonas de riesgo crítico.
    - **Google OR-Tools**: Resolución del problema de rutas (VRP) para despachar técnicos a múltiples alertas.
- **Logros**:
    - Inferencia on-demand de modelos pesados.
    - Clasificación inteligente de sectores (Huancayo, El Tambo, Chilca, etc.).
    - Generación de rutas optimizadas para reducir costos operativos.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Rol |
| :--- | :--- | :--- |
| **Backend** | Python 3.11 + FastAPI | Adaptador principal de API y lógica de servidor. |
| **Frontend** | Next.js 15 + React 19 | Interfaz de usuario premium y visualización de datos. |
| **Machine Learning** | Scikit-Learn | Entrenamiento de modelos base (RF, IF). |
| **Predicción** | Prophet | Análisis de series temporales (Estacionalidad). |
| **Clasificación** | XGBoost | Análisis de riesgo por sectores. |
| **Optimización** | OR-Tools | Cálculo de rutas logísticas eficientes. |
| **Visualización** | Recharts + Leaflet | Gráficos dinámicos y mapas interactivos. |

---

## 📁 Estructura del Workspace

```bash
AQUAIA/
├── backend/                # Núcleo de Procesamiento e IA
│   ├── main.py             # Adaptador API (FastAPI)
│   ├── ml_model.py         # Lógica de Dominio y Modelos de ML
│   └── requirements.txt    # Dependencias del ecosistema Python
│
├── frontend/               # Interfaz del Usuario (UX/UI)
│   ├── src/app/            # App Router (Dashboard, IA, Alertas, Mapas)
│   ├── components/         # Componentes UI reutilizables
│   └── public/             # Recursos estáticos
│
└── README.md               # Documentación General (v2.5)
```

---

## 🚀 Guía de Inicio Rápido

1.  **Backend**:
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
    *Documentación Swagger: `http://localhost:8000/docs`*

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Acceso Dashboard: `http://localhost:3000`*

---

<p align="center">
  <strong>AquaIA v2.5 — Universidad Continental</strong><br>
  <em>Innovación en la gestión hídrica mediante computación avanzada.</em>
</p>
