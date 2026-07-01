@echo off
echo ============================================
echo   ParkSpot - Auto-Start Installation
echo ============================================
echo.

REM Create Task Scheduler task to start server on boot
echo [1/2] Creating auto-start task...
schtasks /create /tn "ParkSpot-Server" /tr "wscript.exe \"C:\Users\MITHESH D\parkspot\start-server.vbs\"" /sc onlogon /rl highest /f
if %ERRORLEVEL% EQU 0 (
    echo Auto-start task created successfully!
) else (
    echo Failed to create task. Run as Administrator.
)

REM Start the server now
echo.
echo [2/2] Starting server now...
cd /d "%~dp0server"
start "ParkSpot-Server" cmd /c "node src/server.js"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo   ParkSpot Server is running!
echo ============================================
echo.
echo   Server URL: http://localhost:5000
echo   Auto-start: Task scheduled on Windows login
echo.
echo   To stop: taskkill /f /im node.exe
echo   To restart: run start-server.bat
echo.
pause
