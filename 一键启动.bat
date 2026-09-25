@echo off
setlocal
set "PROJECT_DIR=%~dp0"

where pnpm >nul 2>nul
if errorlevel 1 (
    echo 未找到 pnpm，请安装 pnpm 或将其加入 PATH 后重试。
    pause
    exit /b 1
)

powershell -NoProfile -Command "$ports = 12366,12367; $busy = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $ports }; if ($busy) { $busy | ForEach-Object { Write-Host ('端口 {0} 已被 PID {1} 占用。' -f $_.LocalPort, $_.OwningProcess) }; exit 1 }"
if errorlevel 1 (
    echo 请先释放 Wotty Stark 所需的 12366 或 12367 端口，再重新启动。
    pause
    exit /b 1
)

echo 正在启动 Wotty Stark 网页和 API...
echo 等待网页就绪后将自动打开浏览器。
start "Wotty Stark Dev" /D "%PROJECT_DIR%" cmd /k "pnpm dev"

powershell -NoProfile -Command "$url = 'http://127.0.0.1:12366'; $deadline = (Get-Date).AddMinutes(3); while ((Get-Date) -lt $deadline) { try { $response = Invoke-WebRequest -Uri $url -TimeoutSec 2 -UseBasicParsing; if ($response.StatusCode -lt 500) { Start-Process $url; exit 0 } } catch {}; Start-Sleep -Seconds 1 }; Write-Error 'Wotty Stark 网页未能在 3 分钟内启动，请检查服务窗口中的错误。'; exit 1"

if errorlevel 1 (
    echo.
    echo 请检查 Wotty Stark Dev 窗口，确认网页服务已正常启动。
    pause
)
endlocal
