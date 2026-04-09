# Script para Iniciar Servidor e Mostrar Informações de Rede

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciando Servidor Next.js em Rede" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obter IP local
$ipAddress = (Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway -ne $null} | Select-Object -ExpandProperty IPv4Address).IPAddress

Write-Host "Seu IP Local:" -ForegroundColor Green
Write-Host "  $ipAddress" -ForegroundColor Yellow
Write-Host ""

Write-Host "Acesse o projeto em:" -ForegroundColor Green
Write-Host "  Local:        http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Via Rede:     http://$ipAddress`:3000" -ForegroundColor Yellow
Write-Host ""

Write-Host "Compartilhe este endereço com outros computadores da rede!" -ForegroundColor Cyan
Write-Host "Para acessar de outro PC: http://$ipAddress`:3000" -ForegroundColor Yellow
Write-Host ""

Write-Host "Iniciando servidor..." -ForegroundColor Cyan
Write-Host ""

# Iniciar o servidor
npm run dev
