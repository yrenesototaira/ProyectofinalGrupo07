$headers = @{
    'Authorization' = 'Bearer pk_test_iKnf1lmmOdlUHuLu'
    'Content-Type' = 'application/json'
}

$body = '{
  "card_number": "5111111111111118",
  "cvv": "123",
  "expiration_month": 12,
  "expiration_year": 2026,
  "email": "test@culqi.com"
}'

Write-Host '=== CREANDO TOKEN EN CULQI ===' -ForegroundColor Cyan
Write-Host 'URL: https://api.culqi.com/v2/tokens'
Write-Host 'Headers:'
$headers | ConvertTo-Json
Write-Host 'Body:'
$body
Write-Host ''

try {
    $response = Invoke-WebRequest -Uri 'https://api.culqi.com/v2/tokens' -Method Post -Headers $headers -Body $body
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