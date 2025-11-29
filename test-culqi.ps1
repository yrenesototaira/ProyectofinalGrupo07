# Script de prueba para Culqi API
# Basado en: https://docs.culqi.com

$PUBLIC_KEY = "pk_test_uCOEU0RtRLlhaXEM"
$SECRET_KEY = "sk_test_nkLhW0hDq2C0OIuh"
$BASE_URL = "https://secure.culqi.com"

Write-Host "=== PRUEBA DE CULQI API ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "TEST 1: Creando Token..." -ForegroundColor Yellow

$tokenHeaders = @{
    "Authorization" = "Bearer $PUBLIC_KEY"
    "Content-Type" = "application/json"
}

$tokenBody = @{
    card_number = "4111111111111111"
    cvv = "123"
    expiration_month = 9
    expiration_year = 2026
    email = "richard@piedpiper.com"
} | ConvertTo-Json

Write-Host "Request Body: $tokenBody"

try {
    $tokenResponse = Invoke-RestMethod -Uri "$BASE_URL/v2/tokens" -Method Post -Headers $tokenHeaders -Body $tokenBody
    Write-Host "Token creado exitosamente!" -ForegroundColor Green
    Write-Host "Token ID: $($tokenResponse.id)"
    
    Write-Host "`nTEST 2: Procesando Cargo..." -ForegroundColor Yellow
    
    $chargeHeaders = @{
        "Authorization" = "Bearer $SECRET_KEY"
        "Content-Type" = "application/json"
    }
    
    $chargeBody = @{
        amount = 25000
        currency_code = "PEN"
        source_id = $tokenResponse.id
        email = "test@culqi.com"
        description = "Venta de prueba"
    } | ConvertTo-Json
    
    $chargeResponse = Invoke-RestMethod -Uri "$BASE_URL/v2/charges" -Method Post -Headers $chargeHeaders -Body $chargeBody
    Write-Host "Cargo procesado exitosamente!" -ForegroundColor Green
    Write-Host "Charge ID: $($chargeResponse.id)"
    Write-Host "Amount: $($chargeResponse.amount)"
    $chargeResponse | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
}

Write-Host "`n=== FIN DE PRUEBAS ===" -ForegroundColor Cyan
