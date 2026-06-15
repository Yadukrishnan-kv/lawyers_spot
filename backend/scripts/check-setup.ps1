# LawyerSpot setup checker (Windows)
$ErrorActionPreference = "Continue"
$backendRoot = Split-Path $PSScriptRoot -Parent

Write-Host "`n=== LawyerSpot setup check ===`n" -ForegroundColor Cyan

# Python
Write-Host "Python:"
if (Get-Command python -ErrorAction SilentlyContinue) {
    python --version
} else {
    Write-Host "  NOT FOUND - Install from https://www.python.org/downloads/ (check Add to PATH)" -ForegroundColor Red
}

# venv
Write-Host "`nVirtual env:"
$venv = Join-Path $backendRoot ".venv\Scripts\python.exe"
if (Test-Path $venv) {
    Write-Host "  OK: .venv exists" -ForegroundColor Green
} else {
    Write-Host "  Missing - run: python -m venv .venv" -ForegroundColor Yellow
}

# .env
Write-Host "`nConfig:"
$envFile = Join-Path $backendRoot ".env"
if (Test-Path $envFile) {
    Write-Host "  OK: backend\.env exists" -ForegroundColor Green
} else {
    Write-Host "  Missing - run: copy .env.example .env" -ForegroundColor Yellow
}

# cms.json for seed
$cmsJson = Join-Path $backendRoot "..\platform\data\cms.json"
if (Test-Path $cmsJson) {
    Write-Host "  OK: platform\data\cms.json found" -ForegroundColor Green
} else {
    Write-Host "  Missing cms.json for seeding" -ForegroundColor Red
}

# API health
Write-Host "`nAPI (http://127.0.0.1:8000):"
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "  OK: $($r.Content)" -ForegroundColor Green
} catch {
    Write-Host "  Not running - start: uvicorn app.main:app --reload --port 8000" -ForegroundColor Yellow
}

# Next.js
Write-Host "`nWebsite (http://127.0.0.1:3000):"
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "  OK: HTTP $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  Not running - start: npm run dev in platform folder" -ForegroundColor Yellow
}

# platform .env.local
Write-Host "`nFrontend config:"
$localEnv = Join-Path $backendRoot "..\platform\.env.local"
if (Test-Path $localEnv) {
    Write-Host "  OK: platform\.env.local exists" -ForegroundColor Green
} else {
    Write-Host "  Missing - run: copy .env.local.example .env.local" -ForegroundColor Yellow
}

Write-Host "`nFull guide: D:\xampp\htdocs\lawrato\SETUP-GUIDE.md`n" -ForegroundColor Cyan
