import csv
from decimal import Decimal
from datetime import datetime
from app.database import SessionLocal
from app.models import models

def generate_test_data():
    db = SessionLocal()
    try:
        # Buscar pagos pendientes
        pagos_pendientes = db.query(models.Pago).join(models.Pago.usuario).filter(
            models.Pago.estado_pago == 'PENDIENTE'
        ).all()
        
        print(f"Encontrados {len(pagos_pendientes)} pagos pendientes.")
        
        # Generar un CSV de prueba
        csv_filename = "../extracto_bancario_prueba.csv"
        with open(csv_filename, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Fecha', 'Descripcion', 'Monto'])
            
            # 1. Crear un match perfecto por ID de pago
            if len(pagos_pendientes) > 0:
                p1 = pagos_pendientes[0]
                fecha_str = p1.fecha_pago.strftime('%Y-%m-%d')
                desc = f"TRANSFERENCIA ID PAGO {p1.id_pago} BANCO UNION"
                writer.writerow([fecha_str, desc, str(p1.monto)])
                print(f"Match 1 (Por ID): Creada fila para Pago #{p1.id_pago}, Usuario: {p1.usuario.nombres} {p1.usuario.apellidos}, Monto: {p1.monto} Bs.")
                print(f"  --> Iniciar sesión con: {p1.usuario.correo} / password123 (para ver este pago)")
            
            # 2. Crear un match difuso por nombre (con un typo) y fecha cercana
            if len(pagos_pendientes) > 1:
                p2 = pagos_pendientes[1]
                fecha_str = p2.fecha_pago.strftime('%Y-%m-%d')
                # Hacemos typo en su apellido o nombre
                nombre_con_typo = f"{p2.usuario.nombres} {p2.usuario.apellidos}z".upper()
                desc = f"TRF DESDE BANCO DE {nombre_con_typo}"
                writer.writerow([fecha_str, desc, str(p2.monto)])
                print(f"Match 2 (Fuzzy Nombre): Creada fila para Pago #{p2.id_pago}, Usuario: {p2.usuario.nombres} {p2.usuario.apellidos}, Monto: {p2.monto} Bs.")
                print(f"  --> Iniciar sesión con: {p2.usuario.correo} / password123 (para ver este pago)")
            
            # 3. Fila sin coincidencia (ruido)
            writer.writerow(['2026-06-10', 'PAGO DE PLANILLA DE EMPRESA X', '5000.00'])
            
        print(f"✅ Archivo '{csv_filename}' creado con éxito en la raíz del proyecto.")
    finally:
        db.close()

if __name__ == "__main__":
    generate_test_data()
