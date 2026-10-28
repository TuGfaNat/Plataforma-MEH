"""add_id_evento_to_pedidos

Revision ID: a2b3c4d5e6f7
Revises: f7b8c9d0e1f2
Create Date: 2026-10-27 23:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = 'f7b8c9d0e1f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('pedidos')]
    if 'id_evento' not in columns:
        op.add_column('pedidos', sa.Column('id_evento', sa.Integer(), sa.ForeignKey('eventos.id_evento'), nullable=True))
        try:
            op.create_index('ix_pedidos_id_evento', 'pedidos', ['id_evento'])
        except Exception:
            pass


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('pedidos')]
    if 'id_evento' in columns:
        try:
            op.drop_index('ix_pedidos_id_evento', table_name='pedidos')
        except Exception:
            pass
        op.drop_column('pedidos', 'id_evento')
