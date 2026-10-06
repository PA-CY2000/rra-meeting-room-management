@echo off
echo Starting RRA Meeting Room Management System...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

timeout /t 15 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both servers are starting...
echo Backend  : http://localhost:8081
echo Frontend : http://localhost:3000
echo.
pause
