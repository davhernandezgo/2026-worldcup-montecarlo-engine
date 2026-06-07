#!/bin/bash

# Configuration
SERVER="usuario@tu_ip_del_servidor"
PROJECT_DIR="/var/www/2026-world-cup-engine" # Change to your actual project path on the server
SYSTEMD_SERVICE="worldcup-engine.service" # Change to your service name if using systemd

echo "🚀 Iniciando despliegue hacia $SERVER..."

ssh $SERVER << EOF
  echo "📥 Actualizando código desde Git..."
  cd $PROJECT_DIR
  git pull origin main

  echo "🔨 Recompilando Backend (Go)..."
  cd backend
  go build -o engine main.go

  echo "🔄 Reiniciando servicio del Backend..."
  # Opción A: Usando pkill si se ejecuta en background simple
  # pkill engine || true
  # nohup ./engine > backend.log 2>&1 &
  
  # Opción B: Usando systemd (Recomendado para Producción)
  sudo systemctl restart $SYSTEMD_SERVICE

  echo "📦 Recompilando Frontend (React/Vite)..."
  cd ../victored-predictor
  npm install
  npm run build

  echo "✅ Despliegue completado con éxito."
EOF

echo "🎉 Proceso local finalizado."
