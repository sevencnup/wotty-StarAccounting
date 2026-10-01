@echo off
setlocal
set "PROJECT_DIR=%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found. Install it or add it to PATH, then retry.
    goto finish
)

for /f "tokens=1,2" %%A in ('node "%PROJECT_DIR%app\scripts\dev-ports.mjs"') do (
    set "WEB_PORT=%%A"
    set "API_PORT=%%B"
)
if not defined WEB_PORT (
    echo No available Web port was found.
    goto finish
)
if not defined API_PORT (
    echo No available API port was found.
    goto finish
)

echo Web port: %WEB_PORT%  API port: %API_PORT%
echo Starting Wotty Stark web and API services...
start "Wotty Stark Dev" /D "%PROJECT_DIR%" "%ComSpec%" /d /k call app\scripts\dev-window.bat %WEB_PORT% %API_PORT%
node "%PROJECT_DIR%app\scripts\windows-launch.mjs" %WEB_PORT% %API_PORT%
set "EXIT_CODE=%ERRORLEVEL%"
if errorlevel 1 (
    echo.
    echo Wotty Stark failed to start. Check the output above and the Wotty Stark Dev window.
)

:finish
if not defined WOTTY_SKIP_PAUSE pause
endlocal
exit /b %EXIT_CODE%
