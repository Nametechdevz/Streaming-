@echo off
echo.
echo  ================================
echo   IPTV Platform - Iniciando...
echo  ================================
echo.
echo  Backend:    http://localhost:5000
echo  Admin Panel: http://localhost:3000
echo  App Movil:  Escanea el QR con Expo Go
echo.

start "Backend API" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

start "Admin Panel" cmd /k "cd admin-panel && npm start"
timeout /t 3 /nobreak > nul

start "App Movil Expo" cmd /k "cd mobile-app && npx expo start"

echo.
echo  Abriendo panel admin en el navegador...
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo  Todo iniciado! Revisa las ventanas abiertas.
pause
