$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting ClimaSense Environment      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start FastAPI Backend
Write-Host "--> Starting FastAPI Backend (Port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot`"; Write-Host 'FastAPI Backend running...'; python backend\main.py"

# 2. Start Streamlit Dashboard
Write-Host "--> Starting Streamlit Dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot`"; Write-Host 'Streamlit Dashboard running...'; streamlit run backend\app.py"

# 3. Start React Frontend
Write-Host "--> Starting React Frontend (Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot\frontend`"; Write-Host 'React Frontend running...'; npm run dev"

Write-Host ""
Write-Host "All services have been initiated in separate windows!" -ForegroundColor Green
Write-Host "Close the spawned PowerShell windows to stop the servers." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
