import pytest
import uuid
from decimal import Decimal
from datetime import datetime, date, timedelta
from fastapi import UploadFile
from io import BytesIO
from app.database import SessionLocal
from app.models import models
from app.utils.similarity import jaro_winkler_similarity, check_name_in_description_fuzzy
from app.services import pagos_service, ocrm_service

def test_jaro_winkler_core_similarity():
    """Valida el cálculo de similitud de Jaro-Winkler en texto."""
    # 1. Mismo texto
    assert jaro_winkler_similarity("mario", "mario") == 100.0
    
    # 2. Typos ligeros (Similitud alta)
    sim_typo = jaro_winkler_similarity("mamani", "mamany")
    assert sim_typo > 85.0
    
    # 3. Textos completamente distintos (Similitud baja)
    # "mario" vs "pedro" has exactly 60.0% Jaro score
    assert jaro_winkler_similarity("mario", "pedro") < 65.0
    
    # 4. Mayúsculas y espacios
    assert jaro_winkler_similarity("  JUAN PEREZ  ", "juan perez") == 100.0

def test_name_in_description_fuzzy():
    """Valida la búsqueda difusa de nombres en descripciones bancarias."""
    full_name = "Carlos Condori Flores"
    
    # 1. Coincidencia perfecta en mayúsculas y acentos
    desc_ok = "TRF DESDE BANCO UNION - PAGO CARLOS CONDORI FLORES"
    assert check_name_in_description_fuzzy(full_name, desc_ok) == 100.0
    
    # 2. Coincidencia con typos (ej. "condory" en lugar de "condori", acentos)
    desc_typo = "TRF BNB CARLOS CONDORY FLOREZ COD 987"
    assert check_name_in_description_fuzzy(full_name, desc_typo) == 100.0 # Las 3 palabras matchean de forma difusa (>=85% cada una)
    
    # 3. Coincidencia parcial (ej. falta segundo apellido)
    desc_parcial = "BNB NET: TRANSFERENCIA DE CARLOS CONDORI"
    assert check_name_in_description_fuzzy(full_name, desc_parcial) == (2 / 3) * 100.0
    
    # 4. Sin coincidencia
    desc_fail = "PAGO DE MATRICULA DE MARCOS QUISPE"
    assert check_name_in_description_fuzzy(full_name, desc_fail) == 0.0

@pytest.mark.anyio
async def test_deterministic_ocr_comprobante_upload():
    """Valida que la subida de comprobantes calcule la confianza de forma determinística."""
    db = SessionLocal()
    user = None
    pago_ok = None
    pago_sospechoso = None
    try:
        unique_id = uuid.uuid4().hex[:8]
        user = models.Usuario(
            nombres=f"Maria_{unique_id}",
            apellidos=f"Estudiante_{unique_id}",
            correo=f"maria_ocr_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="MIEMBRO"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Caso A: Comprobante válido (PDF de 1000 bytes) -> VERIFICADO_AUTOMATICO (98% confianza)
        pago_ok = await pagos_service.process_comprobante_upload_ocr(
            db=db,
            user_id=user.id_usuario,
            id_referencia=99,
            tipo_referencia="CURSO",
            monto=Decimal("150.00"),
            metodo_pago="TRANSFERENCIA_BANCARIA",
            file_content=b"PDF_DIGITAL_TICKET_DUMMY_DATA" * 50, # ~ 1500 bytes
            file_extension=".pdf"
        )
        assert pago_ok.porcentaje_ocr == 98
        assert pago_ok.estado_pago == "VERIFICADO_AUTOMATICO"
        assert f"Cliente detectado: Maria_{unique_id} Estudiante_{unique_id}" in pago_ok.texto_ocr
        
        # Caso B: Comprobante sospechoso (muy pequeño, 10 bytes) -> REVISION_MANUAL (50% confianza)
        pago_sospechoso = await pagos_service.process_comprobante_upload_ocr(
            db=db,
            user_id=user.id_usuario,
            id_referencia=99,
            tipo_referencia="CURSO",
            monto=Decimal("150.00"),
            metodo_pago="TRANSFERENCIA_BANCARIA",
            file_content=b"small",
            file_extension=".jpg"
        )
        assert pago_sospechoso.porcentaje_ocr == 50
        assert pago_sospechoso.estado_pago == "REVISION_MANUAL"
        
    finally:
        if pago_ok:
            try:
                db.delete(pago_ok)
                db.commit()
            except:
                db.rollback()
        if pago_sospechoso:
            try:
                db.delete(pago_sospechoso)
                db.commit()
            except:
                db.rollback()
        if user:
            try:
                db.delete(user)
                db.commit()
            except:
                db.rollback()
        db.close()

@pytest.mark.anyio
async def test_reconciliacion_extracto_bancario_fuzzy():
    """Valida la reconciliación difusa de extractos bancarios en lote."""
    db = SessionLocal()
    admin = None
    user = None
    pago_pendiente = None
    try:
        unique_id = uuid.uuid4().hex[:8]
        admin = models.Usuario(
            nombres="Admin",
            apellidos="Conciliador",
            correo=f"admin_con_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="ADMIN"
        )
        nombres_test = f"Jose{unique_id}"
        apellidos_test = f"Mamani{unique_id}"
        user = models.Usuario(
            nombres=nombres_test,
            apellidos=apellidos_test,
            correo=f"jose_m_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="MIEMBRO"
        )
        db.add(admin)
        db.add(user)
        db.commit()
        db.refresh(admin)
        db.refresh(user)
        
        # Pago pendiente en la DB
        fecha_pago = datetime.utcnow()
        pago_pendiente = models.Pago(
            id_usuario=user.id_usuario,
            id_referencia=1,
            tipo_referencia="EVENTO",
            monto=Decimal("100.00"),
            metodo_pago="TRANSFERENCIA_BANCARIA",
            estado_pago="PENDIENTE",
            fecha_pago=fecha_pago
        )
        db.add(pago_pendiente)
        db.commit()
        db.refresh(pago_pendiente)
        
        # Simular extracto CSV bancario
        # 1. Match perfecto por código de ID de Pago y Monto
        # 2. Match difuso por nombre (Jose Mamany - typo) y Monto
        fecha_csv_str = fecha_pago.strftime('%Y-%m-%d')
        csv_content = (
            "Fecha,Descripcion,Monto\n"
            f"{fecha_csv_str},TRF DESDE BNB DE {nombres_test} MAMANY{unique_id},100.00\n"
            f"{fecha_csv_str},TRANSFERENCIA ID PAGO {pago_pendiente.id_pago},100.00\n"
        )
        
        csv_file = UploadFile(
            filename="extracto.csv",
            file=BytesIO(csv_content.encode('utf-8'))
        )
        
        resultados = await ocrm_service.procesar_extracto_bancario(
            db=db,
            current_user=admin,
            file=csv_file
        )
        
        # Debería encontrar coincidencia
        assert len(resultados) == 2
        
        # El primero matcheado por nombre difuso ("Mamany" vs "Mamani" + coincidencia de monto)
        assert resultados[0]["match_encontrado"] is True
        assert resultados[0]["id_pago"] == pago_pendiente.id_pago
        assert resultados[0]["usuario_pago"] == f"{nombres_test} {apellidos_test}"
        assert resultados[0]["similitud"] >= 80.0
        
    finally:
        if pago_pendiente:
            try:
                db.delete(pago_pendiente)
                db.commit()
            except:
                db.rollback()
        if user:
            try:
                db.delete(user)
                db.commit()
            except:
                db.rollback()
        if admin:
            try:
                db.delete(admin)
                db.commit()
            except:
                db.rollback()
        db.close()
