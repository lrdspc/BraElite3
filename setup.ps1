# Script de setup para o projeto BraElite3

# Verifica se o Python já está instalado
$pythonInstalled = $false
try {
    python --version
    $pythonInstalled = $true
} catch {
    # Python não encontrado
}

# Se o Python não está instalado, baixa e instala
if (-not $pythonInstalled) {
    Write-Host "Python não encontrado. Iniciando instalação..."
    
    # Baixa o instalador do Python
    $pythonUrl = "https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe"
    $installerPath = "C:\\temp\\python_installer.exe"
    
    # Cria a pasta temp se não existir
    if (-not (Test-Path "C:\\temp")) {
        New-Item -ItemType Directory -Path "C:\\temp"
    }
    
    # Baixa o instalador
    Invoke-WebRequest -Uri $pythonUrl -OutFile $installerPath
    
    # Executa o instalador com as opções de instalação silenciosa
    Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_test=0" -Wait
    
    # Remove o instalador
    Remove-Item $installerPath
    
    Write-Host "Python instalado com sucesso!"
}

# Instala as dependências do backend
Write-Host "Instalando dependências do backend..."
Set-Location -Path "server"
pip install -r requirements.txt
Set-Location -Path ".."

# Instala as dependências do frontend
Write-Host "Instalando dependências do frontend..."
Set-Location -Path "client"
npm install
Set-Location -Path ".."

Write-Host "Setup concluído! Você pode iniciar os servidores agora."
