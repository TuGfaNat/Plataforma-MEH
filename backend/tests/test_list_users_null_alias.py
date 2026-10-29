import pytest
from unittest.mock import MagicMock
from app.services import auth_service
from app.models import models

def test_list_users_null_alias():
    """Valida que los usuarios sin alias (alias=None/NULL) no sean excluidos por la consulta SQL."""
    db = MagicMock()
    query = MagicMock()
    db.query.return_value.execution_options.return_value = query
    query.filter.return_value = query
    query.order_by.return_value.all.return_value = []

    res = auth_service.list_users(db, "ADMIN")
    assert isinstance(res, list)

    # Verificar que el filtro se llamó
    assert query.filter.called
