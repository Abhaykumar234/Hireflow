@echo off
color 0A
cls
echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                                                           ║
echo  ║         🔒 HIREFLOW - SECURITY ENHANCED VERSION 🔒        ║
echo  ║                                                           ║
echo  ║              JWT Authentication Enabled                   ║
echo  ║                                                           ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo.
echo  📋 IMPORTANT CHANGES:
echo.
echo  ✅ JWT Token Authentication
echo  ✅ Role-Based Access Control
echo  ✅ Password Validation (min 8 chars, uppercase, lowercase, number)
echo  ✅ Account Lockout Protection
echo  ✅ PostgreSQL Support
echo  ✅ Input Validation
echo  ✅ Security Headers
echo.
echo  🔐 NEW DEMO CREDENTIALS:
echo     Email: marcus@hireflow.com
echo     Password: Demo123!
echo.
echo     Email: admin@hireflow.com
echo     Password: Admin123!
echo.
echo  ⚠️  NOTE: Old passwords (demo123, admin123) will NOT work!
echo.
echo  📖 For detailed instructions, see HOW-TO-RUN.md
echo.
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════
echo  STEP 0: Setting up Java Environment...
echo ═══════════════════════════════════════════════════════════
echo.

REM Set JAVA_HOME
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"

REM Check if Java exists
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo ❌ Java not found at: %JAVA_HOME%
    echo.
    echo Please install Java 17 or higher from:
    echo https://adoptium.net/
    echo.
    echo Or update JAVA_HOME in this batch file to point to your Java installation.
    echo.
    pause
    exit /b 1
)

echo ✅ JAVA_HOME set to: %JAVA_HOME%
echo.
"%JAVA_HOME%\bin\java.exe" -version
echo.

echo.
echo ═══════════════════════════════════════════════════════════
echo  STEP 1: Building Backend...
echo ═══════════════════════════════════════════════════════════
echo.
cd hireflow-backend\hireflow-backend
call mvnw.cmd clean install -DskipTests
if errorlevel 1 (
    echo.
    echo ❌ Backend build failed!
    echo    Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Backend built successfully!
echo.
echo ═══════════════════════════════════════════════════════════
echo  STEP 2: Starting Backend Server...
echo ═══════════════════════════════════════════════════════════
echo.
echo  Backend will start on: http://localhost:8080
echo  H2 Console: http://localhost:8080/h2-console
echo.
start "HireFlow Backend (Secure)" cmd /k "set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot && call mvnw.cmd spring-boot:run"

timeout /t 10 /nobreak >nul

echo.
echo ═══════════════════════════════════════════════════════════
echo  STEP 3: Starting Frontend Server...
echo ═══════════════════════════════════════════════════════════
echo.
cd ..\..\hireflow-frontend

if not exist "node_modules" (
    echo  Installing npm packages...
    call npm install
)

echo.
echo  Frontend will start on: http://localhost:5173
echo.
start "HireFlow Frontend" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ═══════════════════════════════════════════════════════════
echo  ✅ BOTH SERVERS STARTED!
echo ═══════════════════════════════════════════════════════════
echo.
echo  🌐 Open your browser to: http://localhost:5173
echo.
echo  🔐 Login with:
echo     Email: marcus@hireflow.com
echo     Password: Demo123!
echo.
echo  📝 IMPORTANT NOTES:
echo     • All API requests now require JWT authentication
echo     • Passwords must meet complexity requirements
echo     • Account locks after 5 failed login attempts
echo     • Tokens expire after 24 hours
echo.
echo  📖 For API usage and troubleshooting, see:
echo     • HOW-TO-RUN.md
echo     • SECURITY-IMPROVEMENTS.md
echo     • FRONTEND-JWT-UPDATES.md
echo.
echo  ✅ Frontend has been updated to handle JWT tokens!
echo.
echo.
pause
