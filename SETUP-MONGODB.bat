@echo off
title ParkSpot - MongoDB Atlas Setup
color 0A
echo.
echo  ============================================
echo   ParkSpot - Quick MongoDB Atlas Setup
echo  ============================================
echo.
echo  Since local MongoDB download is blocked,
echo  we'll use MongoDB Atlas (FREE cloud database).
echo.
echo  Steps (takes 2 minutes):
echo  --------------------------------------------
echo.
echo  1. Open: https://www.mongodb.com/atlas
echo  2. Click "Try Free" and create account
echo  3. Click "Build a Database"
echo  4. Choose "M0 Free" tier, click "Create"
echo  5. Choose AWS closest to India, click "Create"
echo  6. Set username: parkspot_user
echo     Set password: ParkSpot123
echo     Click "Create User"
echo  7. Under "IP Access List", click "Add Entry"
echo     IP: 0.0.0.0/0 (allows access from anywhere)
echo     Click "Confirm"
echo  8. Click "Choose a connection method"
echo  9. Click "Drivers"
echo  10. Copy the connection string (looks like:)
echo     mongodb+srv://parkspot_user:ParkSpot123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
echo.
echo  --------------------------------------------
echo  After copying, paste it below:
echo  --------------------------------------------
echo.
set /p MONGO_URI="Paste MongoDB Atlas connection string: "

REM Update .env file
echo Updating server configuration...
(
echo PORT=5000
echo MONGODB_URI=%MONGO_URI%
echo JWT_SECRET=parkspot_super_secret_key_2026
echo JWT_EXPIRE=7d
echo RAZORPAY_KEY_ID=rzp_test_xxxxx
echo RAZORPAY_KEY_SECRET=xxxxx
echo CLIENT_URL=http://localhost:5173
) > "%~dp0server\.env"

echo.
echo Configuration updated!
echo.
echo Starting ParkSpot server...
cd /d "%~dp0server"
node src/server.js
pause
