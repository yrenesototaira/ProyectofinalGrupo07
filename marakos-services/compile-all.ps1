# Script PowerShell para compilar todos los microservicios de Marakos Grill

Write-Host "🚀 Compilando todos los microservicios de Marakos Grill..." -ForegroundColor Cyan
Write-Host "=================================================="

# Configurar Java 17
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "✅ Java configurado: " -ForegroundColor Green -NoNewline
java -version 2>&1 | Select-Object -First 1
Write-Host ""

$services = @("auth-service", "customer-service", "management-service", "reservation-service")
$success = $true

foreach ($service in $services) {
    Write-Host "📦 Compilando $service..." -ForegroundColor Yellow
    Set-Location $service
    
    & .\gradlew.bat compileJava --no-daemon
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $service`: BUILD SUCCESSFUL" -ForegroundColor Green
    } else {
        Write-Host "❌ $service`: BUILD FAILED" -ForegroundColor Red
        $success = $false
        break
    }
    
    Set-Location ..
    Write-Host ""
}

if ($success) {
    Write-Host "🎉 ¡Todos los microservicios compilados exitosamente!" -ForegroundColor Green
    Write-Host "=================================================="
} else {
    Write-Host "❌ Error al compilar los servicios" -ForegroundColor Red
    exit 1
}