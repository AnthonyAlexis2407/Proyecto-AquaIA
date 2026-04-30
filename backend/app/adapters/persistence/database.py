"""
AquaIA — Database Setup (SQLite + SQLAlchemy ORM)
Adaptador de persistencia con modelos ORM y funciones de inicialización.
Preparado para migración a PostgreSQL/TimescaleDB cambiando solo DATABASE_URL.
"""
import sqlite3
from datetime import datetime
from typing import Optional
from app.config import DATABASE_URL

# ---------------------------------------------------------------------------
# Raw SQLite connection helper (lightweight, no heavy ORM dependencies)
# ---------------------------------------------------------------------------

DB_PATH = DATABASE_URL.replace("sqlite:///", "")


def get_connection() -> sqlite3.Connection:
    """Obtiene una conexión a la base de datos SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Permite acceso por nombre de columna
    conn.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging para mejor concurrencia
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_database():
    """Crea todas las tablas si no existen. Llamar al arranque del servidor."""
    conn = get_connection()
    cursor = conn.cursor()

    # --- Tabla de Zonas ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS zones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT DEFAULT '',
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            radius_m INTEGER DEFAULT 500,
            is_active INTEGER DEFAULT 1,
            priority INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # --- Tabla de Sensores ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_code TEXT NOT NULL UNIQUE,
            model TEXT DEFAULT '',
            sensor_type TEXT DEFAULT 'flow',
            zone_id INTEGER,
            latitude REAL DEFAULT 0.0,
            longitude REAL DEFAULT 0.0,
            status TEXT DEFAULT 'online',
            battery_level REAL DEFAULT 100.0,
            threshold_min REAL DEFAULT 0.0,
            threshold_max REAL DEFAULT 100.0,
            reading_interval_sec INTEGER DEFAULT 60,
            last_reading_at TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
        )
    """)

    # --- Tabla de Lecturas de Sensores ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id INTEGER NOT NULL,
            zone_id INTEGER,
            value REAL NOT NULL,
            unit TEXT DEFAULT 'm3/h',
            is_anomaly INTEGER DEFAULT 0,
            anomaly_score REAL DEFAULT 0.0,
            timestamp TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
            FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
        )
    """)

    # --- Tabla de Alertas ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_code TEXT NOT NULL UNIQUE,
            zone_id INTEGER,
            sensor_id INTEGER,
            location TEXT DEFAULT '',
            severity TEXT DEFAULT 'LOW',
            status TEXT DEFAULT 'ACTIVE',
            source TEXT DEFAULT 'SENSOR',
            description TEXT DEFAULT '',
            detected_value REAL,
            threshold_value REAL,
            resolved_by INTEGER,
            resolution_note TEXT,
            resolved_at TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
            FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE SET NULL,
            FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
        )
    """)

    # --- Tabla de Usuarios ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT DEFAULT 'Operador',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            last_login TEXT
        )
    """)

    # --- Tabla de Auditoría ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_email TEXT DEFAULT '',
            action TEXT NOT NULL,
            resource TEXT DEFAULT '',
            resource_id TEXT,
            details TEXT DEFAULT '',
            ip_address TEXT DEFAULT '',
            timestamp TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    """)

    # --- Tabla de Predicciones (histórico) ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            zone_id INTEGER,
            model_used TEXT DEFAULT '',
            horizon_hours INTEGER DEFAULT 24,
            demand_min REAL,
            demand_expected REAL,
            demand_max REAL,
            confidence REAL,
            mape REAL,
            generated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
        )
    """)

    # --- Índices para rendimiento ---
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_readings_sensor ON sensor_readings(sensor_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_readings_zone ON sensor_readings(zone_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_readings_ts ON sensor_readings(timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_zone ON alerts(zone_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_logs(timestamp)")

    conn.commit()
    conn.close()
    print("[AquaIA DB] Base de datos SQLite inicializada correctamente.")


def seed_initial_data():
    """Inserta datos semilla si las tablas están vacías."""
    from app.adapters.api.auth import hash_password

    conn = get_connection()
    cursor = conn.cursor()

    # --- Seed: Usuarios ---
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        users = [
            ("admin@aquaia.pe", "Alexis Administrador", hash_password("admin123"), "Administrador"),
            ("operador@aquaia.pe", "Juan Delgado", hash_password("operador123"), "Operador"),
            ("analista@aquaia.pe", "María Huamán", hash_password("analista123"), "Analista"),
        ]
        cursor.executemany(
            "INSERT INTO users (email, full_name, hashed_password, role) VALUES (?, ?, ?, ?)",
            users
        )
        print("[AquaIA DB] Usuarios semilla creados (3).")

    # --- Seed: Zonas (Palián, Huancayo) ---
    cursor.execute("SELECT COUNT(*) FROM zones")
    if cursor.fetchone()[0] == 0:
        zones = [
            ("Palián Centro", "Zona central del distrito de Palián con mayor densidad poblacional", -12.0735, -75.2280, 600, 1, 1),
            ("Palián Norte", "Sector norte, zona residencial con consumo moderado", -12.0680, -75.2300, 500, 1, 2),
            ("Palián Sur", "Sector sur, incluye áreas agrícolas con riego", -12.0790, -75.2260, 550, 1, 1),
            ("Palián Este", "Sector este, zona de expansión urbana reciente", -12.0740, -75.2210, 450, 1, 2),
            ("Palián Oeste", "Sector oeste, proximidad al río Mantaro", -12.0730, -75.2350, 500, 1, 3),
        ]
        cursor.executemany(
            "INSERT INTO zones (name, description, latitude, longitude, radius_m, is_active, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
            zones
        )
        print("[AquaIA DB] Zonas semilla creadas (5 zonas de Palián).")

    # --- Seed: Sensores ---
    cursor.execute("SELECT COUNT(*) FROM sensors")
    if cursor.fetchone()[0] == 0:
        sensors = [
            ("IOT-SN-01", "AquaSense v4", "flow", 1, -12.0735, -75.2280, "online", 92.0, 10.0, 80.0, 60),
            ("IOT-SN-02", "AquaSense v4", "flow", 2, -12.0680, -75.2300, "online", 85.0, 10.0, 80.0, 60),
            ("IOT-SN-03", "AquaSense Pro", "pressure", 3, -12.0790, -75.2260, "warning", 12.0, 20.0, 60.0, 60),
            ("IOT-PR-01", "FlowMaster 200", "pressure", 1, -12.0738, -75.2275, "online", 95.0, 25.0, 65.0, 120),
            ("IOT-PH-01", "AquaSense Pro", "quality", 4, -12.0740, -75.2210, "online", 78.0, 6.5, 8.5, 300),
            ("IOT-SN-04", "AquaSense v4", "flow", 5, -12.0730, -75.2350, "online", 88.0, 10.0, 80.0, 60),
            ("IOT-LV-01", "LevelGuard 100", "level", 2, -12.0685, -75.2310, "online", 90.0, 0.5, 5.0, 120),
        ]
        cursor.executemany(
            "INSERT INTO sensors (sensor_code, model, sensor_type, zone_id, latitude, longitude, status, battery_level, threshold_min, threshold_max, reading_interval_sec) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            sensors
        )
        print("[AquaIA DB] Sensores semilla creados (7).")

    # --- Seed: Alertas iniciales ---
    cursor.execute("SELECT COUNT(*) FROM alerts")
    if cursor.fetchone()[0] == 0:
        import random
        alerts = [
            (f"ALRT-{random.randint(100,999)}", 3, 3, "Palián Sur — Sensor IOT-SN-03", "HIGH", "ACTIVE", "SENSOR",
             "Pérdida de presión del 14%. Posible fuga estructural detectada por caída en sensor IOT-SN-03.",
             18.5, 20.0),
            (f"ALRT-{random.randint(100,999)}", 1, 1, "Palián Centro — Red principal", "MEDIUM", "ACTIVE", "ISOLATION_FOREST",
             "Isolation Forest detectó caudal anómalo de 85.2 m³/h. Desviación significativa del patrón normal.",
             85.2, 80.0),
            (f"ALRT-{random.randint(100,999)}", 4, 5, "Palián Este — Sensor IOT-PH-01", "LOW", "ACTIVE", "SENSOR",
             "pH reportando niveles intermitentes (7.8 → 8.1). Requiere recalibración programada.",
             8.1, 8.5),
        ]
        cursor.executemany(
            "INSERT INTO alerts (alert_code, zone_id, sensor_id, location, severity, status, source, description, detected_value, threshold_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            alerts
        )
        print("[AquaIA DB] Alertas semilla creadas (3).")

    conn.commit()
    conn.close()
    print("[AquaIA DB] Datos semilla cargados correctamente.")
