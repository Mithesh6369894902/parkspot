@echo off
title ParkSpot - Starting Services
echo ============================================
echo   ParkSpot - Parking Land Rental Platform
echo ============================================
echo.

REM Check if MongoDB is running
echo [1/3] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I "mongod.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB is NOT running!
    echo.
    echo You have 2 options:
    echo.
    echo OPTION A (Recommended - Free Cloud Database):
    echo   1. Go to https://www.mongodb.com/atlas
    echo   2. Create free account
    echo   3. Create a free M0 cluster
    echo   4. Get connection string
    echo   5. Update server\.env with your connection string
    echo.
    echo OPTION B (Local MongoDB):
    echo   1. Download from https://www.mongodb.com/try/download/community
    echo   2. Install and start the service
    echo.
    echo After setting up MongoDB, run this script again.
    pause
    exit /b
) else (
    echo MongoDB is running!
)

echo.
echo [2/3] Starting ParkSpot Backend Server...
cd /d "%~dp0server"
start "ParkSpot-Server" cmd /c "node src/server.js"
timeout /t 2 /nobreak >nul

echo [3/3] Starting ParkSpot Frontend...
cd /d "%~dp0client"
start "ParkSpot-Client" cmd /c "npx vite --host"

echo.
echo ============================================
echo   All Services Started!
echo ============================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
echo   Demo Accounts:
echo   Admin:    admin@parkspot.in / admin123
echo   Owner:    rajesh@parkspot.in / owner123
echo   Customer: amit@parkspot.in / customer123
echo.
echo ============================================
pause
