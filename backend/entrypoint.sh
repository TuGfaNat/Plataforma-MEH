#!/bin/bash
set -e

echo "============================================"
echo "🚀 PLATAFORMA MEH - BACKEND ENTRYPOINT"
echo "============================================"

# ─────────────────────────────────────────────
# 1. Esperar a que PostgreSQL esté disponible
# ─────────────────────────────────────────────
echo "⏳ Esperando a PostgreSQL en db:5432..."
export PGPASSWORD="${POSTGRES_PASSWORD:-password123}"
for i in $(seq 1 30); do
  if pg_isready -h db -U postgres -q 2>/dev/null; then
    echo "✅ PostgreSQL está listo (intento $i)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "❌ PostgreSQL no respondió después de 30 intentos"
    exit 1
  fi
  echo "   Esperando... ($i/30)"
  sleep 2
done

# ─────────────────────────────────────────────
# 1b. Sincronizar archivos estáticos por defecto (evita enmascaramiento de volumen)
# ─────────────────────────────────────────────
echo "📁 Restaurando archivos estáticos por defecto (badges, etc.)..."
mkdir -p /app/static/badges /app/static/uploads /app/static/certificados /app/static/comprobantes /app/static/qrs
cp -rn /app/static_backup/* /app/static/ || true
chmod -R 777 /app/static || true

# ─────────────────────────────────────────────
# 2. Ejecutar migraciones con Alembic
# ─────────────────────────────────────────────
echo "📦 Ejecutando migraciones..."
cd /app
alembic upgrade head
echo "✅ Migraciones ejecutadas correctamente"

# ─────────────────────────────────────────────
# 2b. Ejecutar saneamiento estructural de base de datos
# ─────────────────────────────────────────────
echo "🛠️ Ejecutando saneamiento estructural de base de datos..."
python -m app.sanitize_db
echo "✅ Saneamiento estructural completado"

# ─────────────────────────────────────────────
# 3. Seed opcional según variable RUN_SEED
# ─────────────────────────────────────────────
if [ "$RUN_SEED" = "super" ]; then
    echo "🌱 Ejecutando SUPER SEED (datos completos de prueba)..."
    python -m app.super_seed
    echo "🌱 Creando certificados de prueba..."
    python -m app.create_test_certs
elif [ "$RUN_SEED" = "basic" ]; then
    echo "🌱 Ejecutando SEED básico (usuarios staff)..."
    python -m app.seed
else
    echo "⏭️  Seed no solicitado (RUN_SEED=$RUN_SEED)"
fi

echo ""
echo "============================================"
echo "✅ INICIO COMPLETO — Arrancando servidor..."
echo "============================================"

# ─────────────────────────────────────────────
# 4. Iniciar servidor (reemplaza el proceso actual)
# ─────────────────────────────────────────────
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"