# Script para iniciar os servidores

# Inicia o servidor backend
Write-Host "Iniciando servidor backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'server'; python app.py"

# Aguarda 2 segundos para o backend iniciar
Start-Sleep -Seconds 2

# Inicia o servidor frontend
Write-Host "Iniciando servidor frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'client'; npm run dev"

Write-Host "Servidores iniciados! Acesse http://localhost:3000 no seu navegador."
