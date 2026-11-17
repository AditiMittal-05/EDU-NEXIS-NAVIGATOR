@echo off
title EDU-NEXIS Navigator - Full Stack Launcher
cd /d "%~dp0"

echo ==================================================
echo   Starting EDU-NEXIS Navigator Microservices...
echo ==================================================

start "EDU-NEXIS AI Backend" cmd /k call "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "EDU-NEXIS React Frontend" cmd /k call "%~dp0start_frontend.bat"

timeout /t 4 /nobreak >nul
start http://localhost:5173

echo [SUCCESS] Backend (Port 8000) and Frontend (Port 5173) launched!