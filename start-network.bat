@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo Iniciando Servidor Next.js em Rede
echo ========================================
echo.

echo Seu IP Local:
for /f "delims=" %%A in ('powershell -Command "Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway -ne $null} | Select-Object -ExpandProperty IPv4Address | Select-Object -ExpandProperty IPAddress"') do set IP=%%A

echo   %IP%
echo.

echo Acesse o projeto em:
echo   Local:        http://localhost:3000
echo   Via Rede:     http://%IP%:3000
echo.

echo Compartilhe este endereço com outros computadores da rede!
echo Para acessar de outro PC: http://%IP%:3000
echo.

echo Iniciando servidor...
echo.

npm run dev

pause
