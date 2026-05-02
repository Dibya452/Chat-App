@echo off
echo Starting Real-time Chat Application...

echo.
echo Starting Server...
cd server
start cmd /k "npm run server"

echo.
echo Waiting 3 seconds before starting client...
timeout /t 3 /nobreak > nul

echo.
echo Starting Client...
cd ..\chat-app
start cmd /k "npm run dev"

echo.
echo Both server and client are starting...
echo Server: http://localhost:5000
echo Client: http://localhost:5173
echo.
pause
