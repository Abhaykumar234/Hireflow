@echo off
echo ========================================
echo   Starting HireFlow Frontend Server
echo ========================================
echo.

cd hireflow-frontend

echo Checking Node.js version...
node -v
echo.

echo Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
) else (
    echo Dependencies already installed.
)
echo.

echo Starting Vite development server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
