@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==========================================
echo   wotty StarAccounting Deploy Tool
echo ==========================================
echo.
echo Starting full build and direct server deploy process...
echo 1. Build Backend
echo 2. Build Frontend
echo 3. Package Current Workspace
echo 4. Upload to Server by SCP
echo 5. Run Remote Deploy Script by SSH
echo.
echo [Note] Default remote app dir is /www/wwwroot/staraccountting.sevencn.com
echo [Note] The script will auto-read deploy-config.json and .env / .env.local first.
echo [Note] Configure wotty_DIRECT_HOST / wotty_DIRECT_USER / wotty_DIRECT_APP_DIR if needed.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-one-click.ps1"
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
    echo.
    echo [FAILED] Deployment failed, please check logs above.
    color 0c
) else (
    echo.
    echo [SUCCESS] Build and direct upload completed. Server deployment has been triggered by SSH.
    color 0a
)

pause
exit /b %EXITCODE%
