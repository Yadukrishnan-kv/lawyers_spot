# One-shot setup: create DB user (needs postgres superuser password), schema, seed, start API
param(
    [Parameter(Mandatory = $true)]
    [string]$PostgresPassword
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot + "\.."

$env:POSTGRES_ADMIN_URL = "postgresql://postgres:$PostgresPassword@localhost:5432/postgres"

Write-Host "Creating lawyerspot user and database..."
npm run db:init

Write-Host "Applying schema and seeding..."
npm run db:setup

Write-Host "Starting API on http://127.0.0.1:4000 ..."
npm run dev
