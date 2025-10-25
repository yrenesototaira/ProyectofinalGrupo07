# Script PowerShell para ejecutar todos los microservicios de Marakos Grill

param(
    [switch]$Build,
    [switch]$Stop
)

Write-Host "🏪 Marakos Grill - Gestión de Microservicios" -ForegroundColor Cyan
Write-Host "=============================================="

# Configurar Java 17
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

$services = @(
    @{Name="auth-service"; Port=8081; Description="Servicio de Autenticación"},
    @{Name="customer-service"; Port=8082; Description="Servicio de Clientes"},
    @{Name="management-service"; Port=8083; Description="Servicio de Gestión"},
    @{Name="reservation-service"; Port=8084; Description="Servicio de Reservas"}
)

if ($Stop) {
    Write-Host "🛑 Deteniendo todos los servicios..." -ForegroundColor Red
    foreach ($service in $services) {
        $processes = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*$($service.Name)*"
        }
        if ($processes) {
            $processes | Stop-Process -Force
            Write-Host "✅ $($service.Name) detenido" -ForegroundColor Yellow
        }
    }
    return
}

if ($Build) {
    Write-Host "🔧 Compilando servicios antes de ejecutar..." -ForegroundColor Yellow
    & .\compile-all.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en compilación. Abortando ejecución." -ForegroundColor Red
        return
    }
}

Write-Host "🚀 Iniciando microservicios..." -ForegroundColor Green
Write-Host ""

foreach ($service in $services) {
    Write-Host "📦 Iniciando $($service.Description) (Puerto $($service.Port))..." -ForegroundColor Yellow
    
    Set-Location $service.Name
    
    # Ejecutar servicio en background
    Start-Process -FilePath "cmd" -ArgumentList "/c", "gradlew.bat bootRun" -WindowStyle Minimized
    
    Set-Location ..
    
    Write-Host "✅ $($service.Name) iniciado en puerto $($service.Port)" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🎉 Todos los servicios están iniciándose..." -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de los servicios:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "   • $($service.Description): http://localhost:$($service.Port)" -ForegroundColor White
}
Write-Host ""
Write-Host "Para detener los servicios, ejecuta: .\run-all.ps1 -Stop" -ForegroundColor Yellow