@echo off
title EDU-NEXIS Python AI Microservice (Port 8000)
cd /d "%~dp0"

if not exist "venv\Scripts\activate.bat" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
cd backend\python_ai_service

echo [INFO] Installing/verifying Python dependencies...
pip install -r requirements.txt --quiet

echo [INFO] Starting FastAPI AI Server on http://127.0.0.1:8000 ...
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause