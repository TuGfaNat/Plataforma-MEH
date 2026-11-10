"""add_tallas_to_productos_and_pedidos

Revision ID: f7a8b9c0d1e2
Revises: e6f7a8b9c0d1
Create Date: 2026-11-09 23:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f7a8b9c0d1e2'
down_revision: Union[str, Sequence[str], None] = 'e6f7a8b9c0d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    prod_columns = [col['name'] for col in inspector.get_columns('productos')]
    if 'tiene_tallas' not in prod_columns:
        op.add_column('productos', sa.Column('tiene_tallas', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    if 'tallas_disponibles' not in prod_columns:
        op.add_column('productos', sa.Column('tallas_disponibles', sa.String(255), nullable=True))
        
    det_columns = [col['name'] for col in inspector.get_columns('pedido_detalles')]
    if 'talla' not in det_columns:
        op.add_column('pedido_detalles', sa.Column('talla', sa.String(30), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    prod_columns = [col['name'] for col in inspector.get_columns('productos')]
    if 'tallas_disponibles' in prod_columns:
        op.drop_column('productos', 'tallas_disponibles')
    if 'tiene_tallas' in prod_columns:
        op.drop_column('productos', 'tiene_tallas')
        
    det_columns = [col['name'] for col in inspector.get_columns('pedido_detalles')]
    if 'talla' in det_columns:
        op.drop_column('pedido_detalles', 'talla')
