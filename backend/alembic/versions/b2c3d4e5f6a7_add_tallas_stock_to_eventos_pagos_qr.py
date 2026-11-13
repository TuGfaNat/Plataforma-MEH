"""add_tallas_stock_to_eventos_pagos_qr

Revision ID: b2c3d4e5f6a7
Revises: f7a8b9c0d1e2
Create Date: 2026-11-13 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'f7a8b9c0d1e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # 1. eventos_pagos_qr
    qr_cols = [col['name'] for col in inspector.get_columns('eventos_pagos_qr')]
    if 'tiene_tallas' not in qr_cols:
        op.add_column('eventos_pagos_qr', sa.Column('tiene_tallas', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    if 'tallas_stock' not in qr_cols:
        op.add_column('eventos_pagos_qr', sa.Column('tallas_stock', sa.Text(), nullable=True))

    # 2. inscripciones_eventos
    insc_cols = [col['name'] for col in inspector.get_columns('inscripciones_eventos')]
    if 'id_qr' not in insc_cols:
        op.add_column('inscripciones_eventos', sa.Column('id_qr', sa.Integer(), sa.ForeignKey('eventos_pagos_qr.id_qr', ondelete='SET NULL'), nullable=True))
    if 'talla' not in insc_cols:
        op.add_column('inscripciones_eventos', sa.Column('talla', sa.String(30), nullable=True))

    # 3. productos
    prod_cols = [col['name'] for col in inspector.get_columns('productos')]
    if 'tallas_stock' not in prod_cols:
        op.add_column('productos', sa.Column('tallas_stock', sa.Text(), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    qr_cols = [col['name'] for col in inspector.get_columns('eventos_pagos_qr')]
    if 'tallas_stock' in qr_cols:
        op.drop_column('eventos_pagos_qr', 'tallas_stock')
    if 'tiene_tallas' in qr_cols:
        op.drop_column('eventos_pagos_qr', 'tiene_tallas')

    insc_cols = [col['name'] for col in inspector.get_columns('inscripciones_eventos')]
    if 'talla' in insc_cols:
        op.drop_column('inscripciones_eventos', 'talla')
    if 'id_qr' in insc_cols:
        op.drop_column('inscripciones_eventos', 'id_qr')

    prod_cols = [col['name'] for col in inspector.get_columns('productos')]
    if 'tallas_stock' in prod_cols:
        op.drop_column('productos', 'tallas_stock')
