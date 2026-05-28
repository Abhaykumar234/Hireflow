# HireFlow PostgreSQL Setup Script
# Run this script to set up PostgreSQL for HireFlow

Write-Host "🐘 HireFlow PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking for PostgreSQL installation..." -ForegroundColor Yellow

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($null -eq $pgService) {
    Write-Host "❌ PostgreSQL is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "1. Using Chocolatey: choco install postgresql" -ForegroundColor White
    Write-Host "2. Manual download: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ PostgreSQL is installed" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is running
if ($pgService.Status -ne "Running") {
    Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service $pgService.Name
    Start-Sleep -Seconds 3
    Write-Host "✅ PostgreSQL service started" -ForegroundColor Green
} else {
    Write-Host "✅ PostgreSQL is already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open SQL Shell (psql) from Start Menu" -ForegroundColor Yellow
Write-Host "   OR run: psql -U postgres" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Run these SQL commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   CREATE DATABASE hireflow;" -ForegroundColor White
Write-Host "   CREATE USER hireflow_user WITH ENCRYPTED PASSWORD 'HireFlow2026!Secure';" -ForegroundColor White
Write-Host "   GRANT ALL PRIVILEGES ON DATABASE hireflow TO hireflow_user;" -ForegroundColor White
Write-Host "   \c hireflow" -ForegroundColor White
Write-Host "   GRANT ALL ON SCHEMA public TO hireflow_user;" -ForegroundColor White
Write-Host "   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hireflow_user;" -ForegroundColor White
Write-Host "   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hireflow_user;" -ForegroundColor White
Write-Host "   \q" -ForegroundColor White
Write-Host ""
Write-Host "3. Update application-prod.properties with your password" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Set production profile:" -ForegroundColor Yellow
Write-Host "   `$env:SPRING_PROFILES_ACTIVE = 'prod'" -ForegroundColor White
Write-Host ""
Write-Host "5. Run the backend:" -ForegroundColor Yellow
Write-Host "   cd hireflow-backend\hireflow-backend" -ForegroundColor White
Write-Host "   .\mvnw.cmd spring-boot:run" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "For detailed instructions, see: POSTGRESQL-SETUP.md" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
