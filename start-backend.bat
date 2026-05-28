@echo off
echo ========================================
echo   Starting HireFlow Backend Server
echo ========================================
echo.

cd hireflow-backend\hireflow-backend

echo Checking Java version...
java -version
echo.

echo Starting Spring Boot application...
echo Backend will be available at: http://localhost:8080
echo H2 Console will be available at: http://localhost:8080/h2-console
echo.
echo Press Ctrl+C to stop the server
echo.

call mvnw.cmd spring-boot:run

pause
