import pytest
from unittest.mock import MagicMock
from datetime import datetime
from app.services import eventos_service
from app.models import models

def test_toggle_asistencia_manual_unit():
    db = MagicMock()
    staff = MagicMock(spec=models.Usuario)
    staff.id_usuario = 1
    staff.rol = "ADMIN"

    ins = MagicMock(spec=models.InscripcionEvento)
    ins.id_inscripcion = 50
    ins.id_evento = 10
    ins.asistio = False
    ins.estado_inscripcion = "CONFIRMADA"
    ins.id_estado = 2

    cp = MagicMock(spec=models.Checkpoint)
    cp.id_checkpoint = 100

    def query_side_effect(model):
        q = MagicMock()
        if model == models.InscripcionEvento:
            q.filter.return_value.first.return_value = ins
        elif model == models.Checkpoint:
            q.filter.return_value.first.return_value = cp
        elif model == models.AsistenciaDetalle:
            q.filter.return_value.first.return_value = None
            q.filter.return_value.all.return_value = []
        return q

    db.query.side_effect = query_side_effect

    # Test toggling to True
    res1 = eventos_service.toggle_asistencia_manual(db, staff, 50)
    assert res1["asistio"] is True
    assert ins.asistio is True

    # Test toggling back to False
    res2 = eventos_service.toggle_asistencia_manual(db, staff, 50)
    assert res2["asistio"] is False
    assert ins.asistio is False
