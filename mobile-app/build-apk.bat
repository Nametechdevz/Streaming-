@echo off
REM =============================================================================
REM  build-apk.bat  -  Build IPTV Stream APK (Windows)
REM =============================================================================
REM  Usage:
REM    build-apk.bat               -> cloud build via EAS (production)
REM    build-apk.bat --preview     -> cloud build via EAS (preview / no store)
REM    build-apk.bat --local       -> local build (requires Android SDK + JDK)
REM =============================================================================

setlocal enabledelayedexpansion

cd /d "%~dp0"

set PROFILE=production
set LOCAL=false

REM Parse arguments
:parse_args
if "%~1"=="" goto done_args
if "%~1"=="--preview" set PROFILE=preview
if "%~1"=="--local"   set LOCAL=true
shift
goto parse_args
:done_args

echo ========================================
echo  IPTV Stream - APK Builder (Windows)
echo ========================================

REM ----------------------------------------------------------------
REM [1/4] Install dependencies
REM ----------------------------------------------------------------
echo.
echo [1/4] Installing npm dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed.
    exit /b 1
)

REM ----------------------------------------------------------------
REM [2/4] Generate assets
REM ----------------------------------------------------------------
echo.
echo [2/4] Generating assets (icons, splash)...
call node generate-assets.js
if errorlevel 1 (
    echo ERROR: generate-assets.js failed.
    exit /b 1
)

REM ----------------------------------------------------------------
REM [3/4] Build
REM ----------------------------------------------------------------
echo.
if "%LOCAL%"=="true" (
    echo [3/4] Running LOCAL build (expo prebuild + Gradle)...
    echo       Requires: Android SDK with ANDROID_HOME set, and JDK 17+
    echo.

    REM Check ANDROID_HOME
    if "%ANDROID_HOME%"=="" (
        echo ERROR: ANDROID_HOME is not set.
        echo        Install Android Studio and set ANDROID_HOME, e.g.:
        echo        set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
        exit /b 1
    )

    REM Check JAVA_HOME
    if "%JAVA_HOME%"=="" (
        echo WARNING: JAVA_HOME is not set. Gradle may fail.
        echo          Install JDK 17 from https://adoptium.net/
    )

    REM Expo prebuild
    call npx expo prebuild --platform android --clean
    if errorlevel 1 (
        echo ERROR: expo prebuild failed.
        exit /b 1
    )

    REM Gradle build
    cd android
    call gradlew.bat assembleRelease
    if errorlevel 1 (
        echo ERROR: Gradle build failed.
        cd ..
        exit /b 1
    )
    cd ..

    echo.
    echo ========================================
    echo  APK ready:
    echo  android\app\build\outputs\apk\release\app-release.apk
    echo ========================================

) else (
    echo [3/4] Running CLOUD build via EAS (profile: %PROFILE%)...
    echo.
    echo       If not logged in yet, run first:
    echo         npx eas-cli login
    echo         npx eas-cli project:init   (updates projectId in app.json)
    echo.

    call npx eas-cli build --platform android --profile %PROFILE%
    if errorlevel 1 (
        echo.
        echo  EAS build failed. Steps to fix:
        echo    1. npx eas-cli login
        echo    2. npx eas-cli project:init
        echo    3. Run this script again
        exit /b 1
    )
)

REM ----------------------------------------------------------------
REM [4/4] Done
REM ----------------------------------------------------------------
echo.
echo [4/4] Done.
endlocal
