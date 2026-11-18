@echo off
title BootCraft Studio Launcher
echo ========================================================
echo   BootCraft Studio - Initializing environment...
echo ========================================================

set SCRIPT_DIR=%~dp0
set TARGET_HTML=%SCRIPT_DIR%index.html

if exist "%TARGET_HTML%" (
    echo Starting BootCraft Studio in your default browser...
    start "" "%TARGET_HTML%"
) else (
    echo Error: index.html not found in %SCRIPT_DIR%
    pause
    exit /b 1
)

exit /b 0
