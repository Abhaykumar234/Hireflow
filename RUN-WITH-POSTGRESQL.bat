@echo off
REM HireFlow - Run with PostgreSQL
REM This script runs the backend with PostgreSQL database

echo ========================================
echo HireFlow - PostgreSQL Mode
echo ========================================
echo.

REM Set JAVA_HOME
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot
echo JAVA_HOME set to: %JAVA_HOME%
echo.

REM Set Spring Profile to Production
set SPRING_PROFILES_ACTIVE=prod
echo Spring Profile: %SPRING_PROFILES_ACTIVE%
echo.

echo Starting backend with PostgreSQL...
echo.
echo Make sure:
echo  1. PostgreSQL is installed and running
echo  2. Database 'hireflow' exists
echo  3. User 'hireflow_user' exists
echo  4. Password is set in application-prod.properties
echo.
echo ========================================
echo.

cd hireflow-backend\hireflow-backend

REM Run the application
call mvnw.cmd spring-boot:run

pause
