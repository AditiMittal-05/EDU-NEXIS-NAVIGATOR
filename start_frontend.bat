@echo off
title EDU-NEXIS React Frontend (Port 5173)
cd /d "%~dp0frontend\Edu-Nexis frontend"

if not exist "node_modules" (
    echo [INFO] Installing frontend npm packages...
    call npm install
)

echo [INFO] Starting Vite Frontend Server on http://localhost:5173 ...
call npm run dev
pause