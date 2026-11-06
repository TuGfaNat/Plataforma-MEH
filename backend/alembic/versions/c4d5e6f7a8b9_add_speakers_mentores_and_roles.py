"""add speakers mentores and roles

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-11-06 12:12:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4d5e6f7a8b9'
down_revision = 'b3c4d5e6f7a8'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Actualizar CheckConstraint de rol en usuarios para permitir SPEAKER y MENTOR
    try:
        op.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;")
        op.execute(
            "ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check "
            "CHECK (rol IN ('ADMIN', 'ORGANIZADOR', 'MODERADOR', 'SOPORTE', 'EMBAJADOR', 'MIEMBRO', 'SPEAKER', 'MENTOR'));"
        )
    except Exception:
        pass

    # 2. Agregar columna id_usuario a speakers
    try:
        op.add_column("speakers", sa.Column("id_usuario", sa.Integer(), sa.ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True))
        op.create_index("ix_speakers_id_usuario", "speakers", ["id_usuario"])
    except Exception:
        pass

    # 3. Crear tabla mentores
    try:
        op.create_table(
            "mentores",
            sa.Column("id_mentor", sa.Integer(), primary_key=True, index=True),
            sa.Column("id_usuario", sa.Integer(), sa.ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True),
            sa.Column("nombre", sa.String(), nullable=False),
            sa.Column("bio", sa.Text(), nullable=True),
            sa.Column("trayectoria", sa.Text(), nullable=True),
            sa.Column("foto_url", sa.String(), nullable=True),
            sa.Column("trabajo_actual", sa.String(), nullable=True),
            sa.Column("area_mentoria", sa.String(), nullable=True),
            sa.Column("linkedin_url", sa.String(), nullable=True),
            sa.Column("twitter_url", sa.String(), nullable=True),
            sa.Column("facebook_url", sa.String(), nullable=True),
            sa.Column("instagram_url", sa.String(), nullable=True),
            sa.Column("correo_contacto", sa.String(), nullable=True),
            sa.Column("whatsapp_contacto", sa.String(), nullable=True),
            sa.Column("id_estado", sa.Integer(), server_default="1", nullable=True),
            sa.Column("creado_por", sa.Integer(), sa.ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True),
            sa.Column("fecha_creacion", sa.DateTime(), server_default=sa.func.now(), nullable=True),
            sa.Column("modificado_por", sa.Integer(), sa.ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True),
            sa.Column("fecha_modificacion", sa.DateTime(), nullable=True),
            sa.Column("fecha_modificacion_estado", sa.DateTime(), nullable=True),
            sa.Column("id_usuario_modificacion", sa.Integer(), nullable=True),
        )
        op.create_index("ix_mentores_id_usuario", "mentores", ["id_usuario"])
    except Exception:
        pass


def downgrade():
    try:
        op.drop_table("mentores")
    except Exception:
        pass

    try:
        op.drop_index("ix_speakers_id_usuario", table_name="speakers")
        op.drop_column("speakers", "id_usuario")
    except Exception:
        pass

    try:
        op.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;")
        op.execute(
            "ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check "
            "CHECK (rol IN ('ADMIN', 'ORGANIZADOR', 'MODERADOR', 'SOPORTE', 'EMBAJADOR', 'MIEMBRO'));"
        )
    except Exception:
        pass
