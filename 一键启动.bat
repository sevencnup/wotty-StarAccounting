@echo off
setlocal
set "PROJECT_DIR=%~dp0"

where pnpm >nul 2>nul
if errorlevel 1 (
    echo 未找到 pnpm，请安装 pnpm 或将其加入 PATH 后重试。
    pause
    exit /b 1
)

for /f "tokens=1,2" %%A in ('node "%PROJECT_DIR%app\scripts\dev-ports.mjs"') do (
    set "WEB_PORT=%%A"
    set "API_PORT=%%B"
)
if not defined WEB_PORT (
    echo 未找到可用的网页端口。
    pause
    exit /b 1
)
if not defined API_PORT (
    echo 未找到可用的 API 端口。
    goto startup_failed
)
echo 使用 Web 端口 %WEB_PORT%，API 端口 %API_PORT%。

echo 正在启动 Wotty Stark 网页和 API...
echo 等待网页就绪后将自动打开浏览器。
start "Wotty Stark Dev" /D "%PROJECT_DIR%" cmd /k "set WEB_PORT=%WEB_PORT%&& set API_PORT=%API_PORT%&& pnpm dev"

powershell -NoProfile -Command "$url = 'http://127.0.0.1:%WEB_PORT%'; $deadline = (Get-Date).AddMinutes(3); while ((Get-Date) -lt $deadline) { try { $response = Invoke-WebRequest -Uri $url -TimeoutSec 2 -UseBasicParsing; if ($response.StatusCode -lt 500) { Start-Process $url; exit 0 } } catch {}; Start-Sleep -Seconds 1 }; Write-Error 'Wotty Stark 网页未能在 3 分钟内启动，请检查服务窗口中的错误。'; exit 1"

if errorlevel 1 (
    goto startup_failed
)
echo.
echo Wotty Stark 已启动，浏览器地址：http://127.0.0.1:%WEB_PORT%
echo 开发服务窗口会保持运行。此窗口可以关闭。
pause
endlocal
exit /b 0

:startup_failed
echo.
echo Wotty Stark 启动失败，请检查上方错误信息以及 Wotty Stark Dev 窗口。
pause
endlocal
exit /b 1
