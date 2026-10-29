@echo off
setlocal
set "WEB_PORT=%~1"
set "API_PORT=%~2"

if not defined WEB_PORT (
    echo Missing Web port.
    pause
    exit /b 1
)
if not defined API_PORT (
    echo Missing API port.
    pause
    exit /b 1
)

node app\scripts\dev.mjs
set "EXIT_CODE=%ERRORLEVEL%"
echo.
echo Wotty Stark development service stopped. Exit code: %EXIT_CODE%
pause
exit /b %EXIT_CODE%
