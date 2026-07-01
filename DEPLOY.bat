@echo off
title ParkSpot - Deploy to Live Server
color 0A
echo.
echo  ============================================
echo   ParkSpot - Live Deployment Helper
echo  ============================================
echo.
echo  This will prepare your project for cloud deployment.
echo.
echo  You need:
echo  1. GitHub account (free)
echo  2. Render.com account (free)
echo  3. MongoDB Atlas account (free)
echo.
echo  ============================================
echo.

REM Build React frontend
echo [1/4] Building React frontend...
cd /d "%~dp0client"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check for errors above.
    pause
    exit /b
)
echo Frontend built successfully!
echo.

REM Install production dependencies
echo [2/4] Installing server dependencies...
cd /d "%~dp0server"
call npm install --production
echo.

REM Initialize git
echo [3/4] Setting up Git repository...
cd /d "%~dp0"
if not exist ".git" (
    git init
    git add .
    git commit -m "Initial commit - ParkSpot"
)
echo.

echo [4/4] Ready for deployment!
echo.
echo  ============================================
echo   Next Steps:
echo  ============================================
echo.
echo  1. Create GitHub repo at github.com
echo  2. Push code:
echo     git remote add origin https://github.com/YOUR_USERNAME/parkspot.git
echo     git push -u origin main
echo.
echo  3. Create MongoDB Atlas at mongodb.com/atlas (FREE)
echo     - Get connection string
echo.
echo  4. Deploy on render.com:
echo     - New Web Service
echo     - Connect GitHub repo
echo     - Build: cd server ^&^& npm install
echo     - Start: cd server ^&^& node src/server.js
echo     - Add env: MONGODB_URI, JWT_SECRET, etc.
echo.
echo  5. Update Flutter app with your Render URL:
echo     Edit parkspot_mobile/lib/config/api_config.dart
echo     Change baseUrl to: https://YOUR-APP.onrender.com/api
echo.
echo  6. Rebuild APK:
echo     cd parkspot_mobile
echo     flutter build apk --release
echo.
echo  ============================================
pause
