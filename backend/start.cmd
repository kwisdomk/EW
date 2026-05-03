@echo off
REM EpidermiWatch - Backend Startup Script
REM Handles Java 25 + ByteBuddy compatibility automatically

setlocal

REM Detect JAVA_HOME if not set
if "%JAVA_HOME%"=="" (
    echo [EpidemiWatch] JAVA_HOME not set. Trying to detect Java...
    for /f "tokens=*" %%i in ('where java 2^>nul') do (
        set JAVA_EXE=%%i
        goto :found_java
    )
    echo [EpidemiWatch] ERROR: Java not found. Install Java 17+ and set JAVA_HOME.
    exit /b 1
    :found_java
    echo [EpidemiWatch] Found Java at: %JAVA_EXE%
    for %%a in ("%JAVA_EXE%") do set "JAVA_HOME_TEMP=%%~dpa"
    set "JAVA_HOME=%JAVA_HOME_TEMP:\bin\=%"
    echo [EpidemiWatch] Setting JAVA_HOME to: %JAVA_HOME%
) else (
    echo [EpidemiWatch] Using JAVA_HOME: %JAVA_HOME%
)

echo.
echo ============================================
echo   EpidermiWatch Backend
echo   Quarkus 3.15.1 ^| Port 8080
echo   DB: H2 Persistent File Mode (./data)
echo ============================================
echo.

if not exist data\ (
    echo [EpidemiWatch] Creating data directory for H2 persistent mode...
    mkdir data
)

echo Starting server... (first run downloads dependencies)
echo Press Ctrl+C to stop.
echo.

REM -Dnet.bytebuddy.experimental=true enables Java 25 support
call mvnw.cmd quarkus:dev -Dquarkus.console.enabled=false -Dnet.bytebuddy.experimental=true

endlocal
