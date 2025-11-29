$headers = @{
    'Content-Type' = 'application/json'
}

# Datos de prueba para el pago
$body = @{
    reservationId = 1001
    paymentMethod = "CULQI_CARD"
    amount = 150.00
    customerEmail = "test@culqi.com"
    customerName = "Juan Perez"
    customerPhone = "987654321"
    cardNumber = "4111111111111111"
    cvv = "123"
    expirationMonth = "12"
    expirationYear = "2026"
} | ConvertTo-Json

Write-Host '=== PROBANDO PAGO COMPLETO CON CULQI ===' -ForegroundColor Cyan
Write-Host 'URL: http://localhost:8084/api/payment/culqi'
Write-Host 'Datos de prueba:'
Write-Host $body
Write-Host ''

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8084/api/payment/culqi' -Method Post -Headers $headers -Body $body
    Write-Host '=== PAGO EXITOSO ===' -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host '=== ERROR EN EL PAGO ===' -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Description: $($_.Exception.Response.StatusDescription)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host 'Error Body:'
        $errorBody | ConvertFrom-Json | ConvertTo-Json -Depth 3
    }
}
