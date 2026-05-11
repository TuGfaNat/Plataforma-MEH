# Script de configuración automatizada para Plataforma-MEH (PowerShell)
# Uso: .\setup.ps1

Write-Host "🚀 Iniciando configuración de entorno MEH en Windows..." -ForegroundColor Cyan

# 1. Backend Setup
Write-Host "--- Configurando Backend ---" -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "✅ Entorno virtual creado." -ForegroundColor Green
}

# Activar venv
.\venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt
pip install "python-jose[cryptography]" pytest flake8 httpx
Write-Host "✅ Dependencias de Python instaladas." -ForegroundColor Green

# Crear .env si no existe
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️ Archivo .env creado desde ejemplo. ¡Configura tus credenciales!" -ForegroundColor Yellow
    }
}
Set-Location ..

# 2. Frontend Setup
Write-Host "--- Configurando Frontend ---" -ForegroundColor Yellow
Set-Location frontend
npm install
Write-Host "✅ Dependencias de Node instaladas." -ForegroundColor Green

# Crear .env si no existe
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️ Archivo .env de frontend creado." -ForegroundColor Yellow
    }
}
Set-Location ..

Write-Host "🎉 ¡Configuración completada con éxito!" -ForegroundColor Cyan
Write-Host "Para comenzar:" -ForegroundColor White
Write-Host "Backend: cd backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload" -ForegroundColor Gray
Write-Host "Frontend: cd frontend; npm run dev" -ForegroundColor Gray
