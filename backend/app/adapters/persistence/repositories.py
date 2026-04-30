"""
AquaIA — Repository Implementations (SQLite)
Implementaciones concretas de los puertos de persistencia definidos en domain/ports.py.
"""
from datetime import datetime
from typing import List, Optional
from app.domain.models import Zone, Sensor, SensorReading, Alert, User, AuditLog, Severity, AlertStatus, SensorStatus, UserRole, AlertSource
from app.domain.ports import ZoneRepository, SensorRepository, SensorReadingRepository, AlertRepository, UserRepository, AuditLogRepository
from app.adapters.persistence.database import get_connection


def _parse_datetime(val: Optional[str]) -> Optional[datetime]:
    if val is None:
        return None
    try:
        return datetime.fromisoformat(val)
    except (ValueError, TypeError):
        return None


# =============================================
# Zone Repository
# =============================================
class SQLiteZoneRepository(ZoneRepository):

    def create(self, zone: Zone) -> Zone:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO zones (name, description, latitude, longitude, radius_m, is_active, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (zone.name, zone.description, zone.latitude, zone.longitude, zone.radius_m, int(zone.is_active), zone.priority)
        )
        conn.commit()
        zone.id = cursor.lastrowid
        zone.created_at = datetime.now()
        conn.close()
        return zone

    def get_by_id(self, zone_id: int) -> Optional[Zone]:
        conn = get_connection()
        row = conn.execute("SELECT * FROM zones WHERE id = ?", (zone_id,)).fetchone()
        conn.close()
        if row is None:
            return None
        return self._row_to_zone(row)

    def get_all(self, active_only: bool = True) -> List[Zone]:
        conn = get_connection()
        query = "SELECT * FROM zones"
        if active_only:
            query += " WHERE is_active = 1"
        query += " ORDER BY priority ASC, name ASC"
        rows = conn.execute(query).fetchall()
        conn.close()
        return [self._row_to_zone(r) for r in rows]

    def update(self, zone: Zone) -> Zone:
        conn = get_connection()
        conn.execute(
            "UPDATE zones SET name=?, description=?, latitude=?, longitude=?, radius_m=?, is_active=?, priority=?, updated_at=datetime('now') WHERE id=?",
            (zone.name, zone.description, zone.latitude, zone.longitude, zone.radius_m, int(zone.is_active), zone.priority, zone.id)
        )
        conn.commit()
        conn.close()
        return zone

    def delete(self, zone_id: int) -> bool:
        conn = get_connection()
        cursor = conn.execute("DELETE FROM zones WHERE id = ?", (zone_id,))
        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    def _row_to_zone(self, row) -> Zone:
        return Zone(
            id=row["id"], name=row["name"], description=row["description"],
            latitude=row["latitude"], longitude=row["longitude"], radius_m=row["radius_m"],
            is_active=bool(row["is_active"]), priority=row["priority"],
            created_at=_parse_datetime(row["created_at"]), updated_at=_parse_datetime(row["updated_at"])
        )


# =============================================
# Sensor Repository
# =============================================
class SQLiteSensorRepository(SensorRepository):

    def create(self, sensor: Sensor) -> Sensor:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO sensors (sensor_code, model, sensor_type, zone_id, latitude, longitude, status,
               battery_level, threshold_min, threshold_max, reading_interval_sec) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (sensor.sensor_code, sensor.model, sensor.sensor_type, sensor.zone_id, sensor.latitude, sensor.longitude,
             sensor.status.value if isinstance(sensor.status, SensorStatus) else sensor.status,
             sensor.battery_level, sensor.threshold_min, sensor.threshold_max, sensor.reading_interval_sec)
        )
        conn.commit()
        sensor.id = cursor.lastrowid
        conn.close()
        return sensor

    def get_by_id(self, sensor_id: int) -> Optional[Sensor]:
        conn = get_connection()
        row = conn.execute("SELECT * FROM sensors WHERE id = ?", (sensor_id,)).fetchone()
        conn.close()
        return self._row_to_sensor(row) if row else None

    def get_by_code(self, sensor_code: str) -> Optional[Sensor]:
        conn = get_connection()
        row = conn.execute("SELECT * FROM sensors WHERE sensor_code = ?", (sensor_code,)).fetchone()
        conn.close()
        return self._row_to_sensor(row) if row else None

    def get_all(self, zone_id: Optional[int] = None) -> List[Sensor]:
        conn = get_connection()
        if zone_id:
            rows = conn.execute("SELECT * FROM sensors WHERE zone_id = ? ORDER BY sensor_code", (zone_id,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM sensors ORDER BY sensor_code").fetchall()
        conn.close()
        return [self._row_to_sensor(r) for r in rows]

    def update(self, sensor: Sensor) -> Sensor:
        conn = get_connection()
        conn.execute(
            """UPDATE sensors SET sensor_code=?, model=?, sensor_type=?, zone_id=?, latitude=?, longitude=?,
               status=?, battery_level=?, threshold_min=?, threshold_max=?, reading_interval_sec=?, updated_at=datetime('now') WHERE id=?""",
            (sensor.sensor_code, sensor.model, sensor.sensor_type, sensor.zone_id, sensor.latitude, sensor.longitude,
             sensor.status.value if isinstance(sensor.status, SensorStatus) else sensor.status,
             sensor.battery_level, sensor.threshold_min, sensor.threshold_max, sensor.reading_interval_sec, sensor.id)
        )
        conn.commit()
        conn.close()
        return sensor

    def delete(self, sensor_id: int) -> bool:
        conn = get_connection()
        cursor = conn.execute("DELETE FROM sensors WHERE id = ?", (sensor_id,))
        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    def _row_to_sensor(self, row) -> Sensor:
        return Sensor(
            id=row["id"], sensor_code=row["sensor_code"], model=row["model"], sensor_type=row["sensor_type"],
            zone_id=row["zone_id"], latitude=row["latitude"], longitude=row["longitude"],
            status=SensorStatus(row["status"]) if row["status"] in [s.value for s in SensorStatus] else SensorStatus.ONLINE,
            battery_level=row["battery_level"], threshold_min=row["threshold_min"], threshold_max=row["threshold_max"],
            reading_interval_sec=row["reading_interval_sec"], last_reading_at=_parse_datetime(row["last_reading_at"]),
            created_at=_parse_datetime(row["created_at"]), updated_at=_parse_datetime(row["updated_at"])
        )


# =============================================
# Sensor Reading Repository
# =============================================
class SQLiteSensorReadingRepository(SensorReadingRepository):

    def create(self, reading: SensorReading) -> SensorReading:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sensor_readings (sensor_id, zone_id, value, unit, is_anomaly, anomaly_score) VALUES (?, ?, ?, ?, ?, ?)",
            (reading.sensor_id, reading.zone_id, reading.value, reading.unit, int(reading.is_anomaly), reading.anomaly_score)
        )
        conn.commit()
        reading.id = cursor.lastrowid
        reading.timestamp = datetime.now()
        # Actualizar last_reading_at del sensor
        conn.execute("UPDATE sensors SET last_reading_at = datetime('now') WHERE id = ?", (reading.sensor_id,))
        conn.commit()
        conn.close()
        return reading

    def get_latest_by_sensor(self, sensor_id: int) -> Optional[SensorReading]:
        conn = get_connection()
        row = conn.execute(
            "SELECT * FROM sensor_readings WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT 1", (sensor_id,)
        ).fetchone()
        conn.close()
        return self._row_to_reading(row) if row else None

    def get_by_zone(self, zone_id: int, since: Optional[datetime] = None) -> List[SensorReading]:
        conn = get_connection()
        if since:
            rows = conn.execute(
                "SELECT * FROM sensor_readings WHERE zone_id = ? AND timestamp >= ? ORDER BY timestamp DESC LIMIT 500",
                (zone_id, since.isoformat())
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM sensor_readings WHERE zone_id = ? ORDER BY timestamp DESC LIMIT 200", (zone_id,)
            ).fetchall()
        conn.close()
        return [self._row_to_reading(r) for r in rows]

    def get_by_sensor(self, sensor_id: int, since: Optional[datetime] = None, limit: int = 100) -> List[SensorReading]:
        conn = get_connection()
        if since:
            rows = conn.execute(
                "SELECT * FROM sensor_readings WHERE sensor_id = ? AND timestamp >= ? ORDER BY timestamp DESC LIMIT ?",
                (sensor_id, since.isoformat(), limit)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM sensor_readings WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT ?", (sensor_id, limit)
            ).fetchall()
        conn.close()
        return [self._row_to_reading(r) for r in rows]

    def get_anomalies(self, zone_id: Optional[int] = None, sensor_id: Optional[int] = None, since: Optional[datetime] = None) -> List[SensorReading]:
        conn = get_connection()
        query = "SELECT * FROM sensor_readings WHERE is_anomaly = 1"
        params = []
        if zone_id:
            query += " AND zone_id = ?"
            params.append(zone_id)
        if sensor_id:
            query += " AND sensor_id = ?"
            params.append(sensor_id)
        if since:
            query += " AND timestamp >= ?"
            params.append(since.isoformat())
        query += " ORDER BY timestamp DESC LIMIT 200"
        rows = conn.execute(query, params).fetchall()
        conn.close()
        return [self._row_to_reading(r) for r in rows]

    def _row_to_reading(self, row) -> SensorReading:
        return SensorReading(
            id=row["id"], sensor_id=row["sensor_id"], zone_id=row["zone_id"],
            value=row["value"], unit=row["unit"], is_anomaly=bool(row["is_anomaly"]),
            anomaly_score=row["anomaly_score"], timestamp=_parse_datetime(row["timestamp"])
        )


# =============================================
# Alert Repository
# =============================================
class SQLiteAlertRepository(AlertRepository):

    def create(self, alert: Alert) -> Alert:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO alerts (alert_code, zone_id, sensor_id, location, severity, status, source,
               description, detected_value, threshold_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (alert.alert_code, alert.zone_id, alert.sensor_id, alert.location,
             alert.severity.value if isinstance(alert.severity, Severity) else alert.severity,
             alert.status.value if isinstance(alert.status, AlertStatus) else alert.status,
             alert.source.value if isinstance(alert.source, AlertSource) else alert.source,
             alert.description, alert.detected_value, alert.threshold_value)
        )
        conn.commit()
        alert.id = cursor.lastrowid
        alert.created_at = datetime.now()
        conn.close()
        return alert

    def get_by_id(self, alert_id: int) -> Optional[Alert]:
        conn = get_connection()
        row = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
        conn.close()
        return self._row_to_alert(row) if row else None

    def get_active(self, zone_id: Optional[int] = None, severity: Optional[str] = None) -> List[Alert]:
        conn = get_connection()
        query = "SELECT * FROM alerts WHERE status = 'ACTIVE'"
        params = []
        if zone_id:
            query += " AND zone_id = ?"
            params.append(zone_id)
        if severity:
            query += " AND severity = ?"
            params.append(severity)
        query += " ORDER BY CASE severity WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 WHEN 'LOW' THEN 2 END, created_at DESC"
        rows = conn.execute(query, params).fetchall()
        conn.close()
        return [self._row_to_alert(r) for r in rows]

    def get_history(self, zone_id: Optional[int] = None, limit: int = 50) -> List[Alert]:
        conn = get_connection()
        query = "SELECT * FROM alerts"
        params = []
        if zone_id:
            query += " WHERE zone_id = ?"
            params.append(zone_id)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(query, params).fetchall()
        conn.close()
        return [self._row_to_alert(r) for r in rows]

    def resolve(self, alert_id: int, user_id: int, note: str) -> Optional[Alert]:
        conn = get_connection()
        conn.execute(
            "UPDATE alerts SET status='RESOLVED', resolved_by=?, resolution_note=?, resolved_at=datetime('now'), updated_at=datetime('now') WHERE id=?",
            (user_id, note, alert_id)
        )
        conn.commit()
        row = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
        conn.close()
        return self._row_to_alert(row) if row else None

    def count_by_severity(self) -> dict:
        conn = get_connection()
        rows = conn.execute(
            "SELECT severity, COUNT(*) as cnt FROM alerts WHERE status = 'ACTIVE' GROUP BY severity"
        ).fetchall()
        conn.close()
        result = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for row in rows:
            result[row["severity"]] = row["cnt"]
        return result

    def _row_to_alert(self, row) -> Alert:
        return Alert(
            id=row["id"], alert_code=row["alert_code"], zone_id=row["zone_id"], sensor_id=row["sensor_id"],
            location=row["location"],
            severity=Severity(row["severity"]) if row["severity"] in [s.value for s in Severity] else Severity.LOW,
            status=AlertStatus(row["status"]) if row["status"] in [s.value for s in AlertStatus] else AlertStatus.ACTIVE,
            source=AlertSource(row["source"]) if row["source"] in [s.value for s in AlertSource] else AlertSource.SENSOR,
            description=row["description"], detected_value=row["detected_value"], threshold_value=row["threshold_value"],
            resolved_by=row["resolved_by"], resolution_note=row["resolution_note"],
            resolved_at=_parse_datetime(row["resolved_at"]),
            created_at=_parse_datetime(row["created_at"]), updated_at=_parse_datetime(row["updated_at"])
        )


# =============================================
# User Repository
# =============================================
class SQLiteUserRepository(UserRepository):

    def create(self, user: User) -> User:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, full_name, hashed_password, role) VALUES (?, ?, ?, ?)",
            (user.email, user.full_name, user.hashed_password,
             user.role.value if isinstance(user.role, UserRole) else user.role)
        )
        conn.commit()
        user.id = cursor.lastrowid
        conn.close()
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        conn = get_connection()
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        return self._row_to_user(row) if row else None

    def get_by_email(self, email: str) -> Optional[User]:
        conn = get_connection()
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()
        return self._row_to_user(row) if row else None

    def get_all(self) -> List[User]:
        conn = get_connection()
        rows = conn.execute("SELECT * FROM users ORDER BY role, full_name").fetchall()
        conn.close()
        return [self._row_to_user(r) for r in rows]

    def update(self, user: User) -> User:
        conn = get_connection()
        conn.execute(
            "UPDATE users SET email=?, full_name=?, role=?, is_active=?, last_login=? WHERE id=?",
            (user.email, user.full_name,
             user.role.value if isinstance(user.role, UserRole) else user.role,
             int(user.is_active), user.last_login.isoformat() if user.last_login else None, user.id)
        )
        conn.commit()
        conn.close()
        return user

    def delete(self, user_id: int) -> bool:
        conn = get_connection()
        cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    def _row_to_user(self, row) -> User:
        return User(
            id=row["id"], email=row["email"], full_name=row["full_name"],
            hashed_password=row["hashed_password"],
            role=UserRole(row["role"]) if row["role"] in [r.value for r in UserRole] else UserRole.OPERATOR,
            is_active=bool(row["is_active"]), created_at=_parse_datetime(row["created_at"]),
            last_login=_parse_datetime(row["last_login"])
        )


# =============================================
# Audit Log Repository
# =============================================
class SQLiteAuditLogRepository(AuditLogRepository):

    def create(self, log: AuditLog) -> AuditLog:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (user_id, user_email, action, resource, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (log.user_id, log.user_email, log.action, log.resource, log.resource_id, log.details, log.ip_address)
        )
        conn.commit()
        log.id = cursor.lastrowid
        conn.close()
        return log

    def get_recent(self, limit: int = 100) -> List[AuditLog]:
        conn = get_connection()
        rows = conn.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,)).fetchall()
        conn.close()
        return [self._row_to_log(r) for r in rows]

    def get_by_user(self, user_id: int, limit: int = 50) -> List[AuditLog]:
        conn = get_connection()
        rows = conn.execute("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", (user_id, limit)).fetchall()
        conn.close()
        return [self._row_to_log(r) for r in rows]

    def _row_to_log(self, row) -> AuditLog:
        return AuditLog(
            id=row["id"], user_id=row["user_id"], user_email=row["user_email"],
            action=row["action"], resource=row["resource"], resource_id=row["resource_id"],
            details=row["details"], ip_address=row["ip_address"], timestamp=_parse_datetime(row["timestamp"])
        )
