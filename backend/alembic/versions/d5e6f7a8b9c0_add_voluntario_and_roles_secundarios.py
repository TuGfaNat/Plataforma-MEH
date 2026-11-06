"""add voluntario and roles_secundarios

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-11-06 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5e6f7a8b9c0'
down_revision = 'c4d5e6f7a8b9'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Agregar columna roles_secundarios a usuarios
    try:
        op.add_column("usuarios", sa.Column("roles_secundarios", sa.String(), nullable=True))
    except Exception:
        pass

    # 2. Actualizar CheckConstraint de rol en usuarios para permitir VOLUNTARIO
    try:
        op.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;")
        op.execute(
            "ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check "
            "CHECK (rol IN ('ADMIN', 'ORGANIZADOR', 'MODERADOR', 'SOPORTE', 'EMBAJADOR', 'VOLUNTARIO', 'MIEMBRO', 'SPEAKER', 'MENTOR'));"
        )
    except Exception:
        pass


def downgrade():
    try:
        op.drop_column("usuarios", "roles_secundarios")
    except Exception:
        pass
    try:
        op.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;")
        op.execute(
            "ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check "
            "CHECK (rol IN ('ADMIN', 'ORGANIZADOR', 'MODERADOR', 'SOPORTE', 'EMBAJADOR', 'MIEMBRO', 'SPEAKER', 'MENTOR'));"
        )
    except Exception:
        pass
