"""add_reembolso_and_intentos_to_pagos

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-10-18 16:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, Sequence[str], None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: agregar campos de reembolso e historial de intentos a pagos."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('pagos')]
    
    if 'fecha_reembolso' not in columns:
        op.add_column('pagos', sa.Column('fecha_reembolso', sa.DateTime(), nullable=True))
    if 'reembolsado_por' not in columns:
        op.add_column('pagos', sa.Column('reembolsado_por', sa.Integer(), nullable=True))
        try:
            op.create_index(op.f('ix_pagos_reembolsado_por'), 'pagos', ['reembolsado_por'], unique=False)
        except Exception:
            pass
    if 'motivo_reembolso' not in columns:
        op.add_column('pagos', sa.Column('motivo_reembolso', sa.TEXT(), nullable=True))
    if 'historial_intentos' not in columns:
        op.add_column('pagos', sa.Column('historial_intentos', sa.TEXT(), nullable=True))


def downgrade() -> None:
    """Downgrade schema: remover campos de reembolso e historial."""
    op.drop_column('pagos', 'historial_intentos')
    op.drop_column('pagos', 'motivo_reembolso')
    try:
        op.drop_index(op.f('ix_pagos_reembolsado_por'), table_name='pagos')
    except Exception:
        pass
    op.drop_column('pagos', 'reembolsado_por')
    op.drop_column('pagos', 'fecha_reembolso')
