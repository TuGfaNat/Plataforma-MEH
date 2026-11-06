"""add es_individual and descripcion to eventos_pagos_qr

Revision ID: e6f7a8b9c0d1
Revises: d5e6f7a8b9c0
Create Date: 2026-11-06 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e6f7a8b9c0d1'
down_revision = 'd5e6f7a8b9c0'
branch_labels = None
depends_on = None


def upgrade():
    try:
        op.add_column(
            "eventos_pagos_qr",
            sa.Column("es_individual", sa.Boolean(), nullable=False, server_default=sa.text('false'))
        )
    except Exception:
        pass

    try:
        op.add_column(
            "eventos_pagos_qr",
            sa.Column("descripcion", sa.Text(), nullable=True)
        )
    except Exception:
        pass


def downgrade():
    try:
        op.drop_column("eventos_pagos_qr", "descripcion")
    except Exception:
        pass
    try:
        op.drop_column("eventos_pagos_qr", "es_individual")
    except Exception:
        pass
