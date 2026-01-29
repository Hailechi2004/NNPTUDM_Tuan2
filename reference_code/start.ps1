# Script để chạy JSON Server và tự động mở test.html

# Chạy JSON Server ở background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npx json-server db.json"

# Đợi 3 giây để server khởi động
Start-Sleep -Seconds 3

# Mở test.html trong browser mặc định
Start-Process "$PSScriptRoot\test.html"

Write-Host "JSON Server đang chạy tại http://localhost:3000" -ForegroundColor Green
Write-Host "test.html đã được mở trong browser" -ForegroundColor Green
Write-Host "Để dừng server, đóng cửa sổ PowerShell của JSON Server" -ForegroundColor Yellow
