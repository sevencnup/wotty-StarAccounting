@echo off
setlocal
cd /d "%~dp0"

echo [wotty] 开始执行远程 MySQL 一键初始化...
echo [wotty] 默认读取 scripts\mysql-remote-init.config.json
echo.

npm.cmd --prefix server run db:remote:init
set EXIT_CODE=%ERRORLEVEL%

echo.
if "%EXIT_CODE%"=="0" (
  echo [wotty] 远程 MySQL 初始化完成。
) else (
  echo [wotty] 远程 MySQL 初始化失败，退出码 %EXIT_CODE%。
)

pause
exit /b %EXIT_CODE%
