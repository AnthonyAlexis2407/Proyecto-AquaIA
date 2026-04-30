"""
AquaIA — Report Generation Service
Genera reportes en PDF y Excel para el cumplimiento de RF-10 y HU-13.
"""
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import pandas as pd
from io import BytesIO

class ReportService:
    def __init__(self):
        self.output_dir = "exports"
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_sensor_summary_pdf(self, sensors_data: list, zones_data: list) -> BytesIO:
        """Genera un PDF con el resumen técnico de sensores por zona."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        
        # Estilos personalizados
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Title'],
            fontSize=18,
            spaceAfter=20,
            textColor=colors.hexColor("#0ea5e9")
        )
        
        elements = []
        
        # Título
        elements.append(Paragraph("Reporte de Infraestructura IoT — AquaIA", title_style))
        elements.append(Paragraph(f"Fecha de generación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
        elements.append(Spacer(1, 12))
        
        # Tabla de Sensores
        data = [["Código", "Tipo", "Zona", "Estado", "Batería"]]
        for s in sensors_data:
            zone_name = next((z.name for z in zones_data if z.id == s.zone_id), "N/A")
            data.append([s.sensor_code, s.sensor_type, zone_name, s.status, f"{s.battery_level}%"])
            
        t = Table(data, colWidths=[100, 80, 120, 80, 70])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.hexColor("#0ea5e9")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(t)
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("Resumen de Operatividad:", styles["Heading3"]))
        elements.append(Paragraph(f"Total de sensores: {len(sensors_data)}", styles["Normal"]))
        elements.append(Paragraph(f"Sensores online: {len([s for s in sensors_data if s.status == 'online'])}", styles["Normal"]))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_readings_excel(self, readings: list) -> BytesIO:
        """Genera un archivo Excel con el historial de lecturas."""
        buffer = BytesIO()
        df = pd.DataFrame([
            {
                "ID": r.id,
                "Sensor ID": r.sensor_id,
                "Valor": r.value,
                "Anomalía": "SÍ" if r.is_anomaly else "NO",
                "Score": r.anomaly_score,
                "Timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S") if r.timestamp else ""
            } for r in readings
        ])
        
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Lecturas')
            
        buffer.seek(0)
        return buffer
