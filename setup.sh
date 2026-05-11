#!/bin/bash

# Script de configuración automatizada para Plataforma-MEH
# Uso: ./setup.sh

echo "🚀 Iniciando configuración de entorno MEH..."

# 1. Backend Setup
echo "--- Configurando Backend ---"
cd backend
if [ ! -d "venv" ]; then
    python -m venv venv
    echo "✅ Entorno virtual creado."
fi

# Activar venv (detectando OS)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install --upgrade pip
pip install -r requirements.txt
# Instalación de dependencias de desarrollo y parches de seguridad detectados
pip install "python-jose[cryptography]" pytest flake8 httpx
echo "✅ Dependencias de Python instaladas."

# Crear .env si no existe
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️ Archivo .env creado desde ejemplo. ¡Configura tus credenciales!"
fi
cd ..

# 2. Frontend Setup
echo "--- Configurando Frontend ---"
cd frontend
npm install
echo "✅ Dependencias de Node instaladas."

# Crear .env si no existe
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️ Archivo .env de frontend creado."
fi
cd ..

echo "🎉 ¡Configuración completada con éxito!"
echo "Para comenzar:"
echo "Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "Frontend: cd frontend && npm run dev"
