$headers = @{
    'Content-Type' = 'application/json'
}

$body = '{
  "cardNumber": "4111111111111111",
  "cvv": "123",
  "expirationMonth": 9,
  "expirationYear": 2026,
  "email": "test@culqi.com"
}'

Write-Host '=== PROBANDO CREACIÓN DE TOKEN CON NUEVAS CLAVES CULQI ===' -ForegroundColor Cyan
Write-Host 'URL: http://localhost:8084/api/payment/create-token'
Write-Host 'Body:'
$body
Write-Host ''

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8084/api/payment/create-token' -Method Post -Headers $headers -Body $body
    Write-Host '=== TOKEN CREADO EXITOSAMENTE ===' -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host '=== ERROR ===' -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host 'Error Body:'
        $errorBody
    }
}