@echo off
title Hentikan Kantor Mari Partner
echo Menghentikan Kantor Mari Partner...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8788 ^| findstr LISTENING') do (
    echo Menghentikan proses PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
del "%TEMP%\kantor-agent-*.pid" >nul 2>&1
echo Kantor Mari Partner telah dihentikan.
pause
