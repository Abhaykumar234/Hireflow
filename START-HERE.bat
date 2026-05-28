@echo off
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                                                           ║
echo  ║              🚀 HIREFLOW QUICK START 🚀                   ║
echo  ║                                                           ║
echo  ║         Recruitment Management System                     ║
echo  ║                                                           ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo.
echo  This will start both Backend and Frontend servers
echo  in separate windows.
echo.
echo  📋 Prerequisites:
echo     ✓ Java 17 or higher
echo     ✓ Node.js 16 or higher
echo.
echo  🔐 Demo Login Credentials:
echo     Email: marcus@hireflow.com
echo     Password: demo123
echo.
echo  🌐 URLs:
echo     Frontend: http://localhost:5173
echo     Backend:  http://localhost:8080
echo     H2 Console: http://localhost:8080/h2-console
echo.
echo.
pause

echo.
echo Starting Backend Server...
start "HireFlow Backend" cmd /k "cd /d "%~dp0" && start-backend.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "HireFlow Frontend" cmd /k "cd /d "%~dp0" && start-frontend.bat"

echo.
echo ✅ Both servers are starting in separate windows!
echo.
echo 📖 Check the QUICKSTART.md file for more information.
echo.
echo Press any key to close this window...
pause >nul
