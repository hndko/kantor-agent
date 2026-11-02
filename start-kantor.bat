@echo off
title Kantor Mari Partner (Antigravity 3D Office)
echo Menyalakan Kantor Mari Partner untuk Antigravity...
cd /d "%~dp0skills\kantor-agent\runtime"
start "Kantor Mari Partner Server" node bin\serve-node.mjs
timeout /t 2 /nobreak >nul
start http://127.0.0.1:8788/kerja
echo.
echo Kantor Mari Partner aktif di: http://127.0.0.1:8788/kerja
echo.
pause
