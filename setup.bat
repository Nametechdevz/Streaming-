@echo off
echo.
echo  ================================
echo   IPTV Platform - Setup Inicial
echo  ================================
echo.

echo [1/3] Instalando Backend...
cd backend
call npm install
cd ..

echo.
echo [2/3] Instalando Admin Panel...
cd admin-panel
call npm install
cd ..

echo.
echo [3/3] Instalando App Movil (Expo)...
cd mobile-app
call npm install
cd ..

echo.
echo  ================================
echo   Instalacion completada!
echo   Ahora ejecuta: start.bat
echo  ================================
pause
