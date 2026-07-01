@echo off
title ParkSpot Server - Always Running
cd /d "%~dp0server"
echo Starting ParkSpot server with pm2...
npx pm2 start ecosystem.config.js
npx pm2 save
echo.
echo Server is now running permanently!
echo It will auto-restart if it crashes.
echo It will auto-start when Windows boots.
echo.
echo To check status: npx pm2 status
echo To view logs: npx pm2 logs parkspot-server
echo To stop: npx pm2 stop parkspot-server
echo.
pause
