# fix-kotlin.ps1
# Parchea la version de Kotlin en android/build.gradle a 2.1.0
# Uso: .\fix-kotlin.ps1

$buildGradle = "android\build.gradle"

if (-not (Test-Path $buildGradle)) {
    Write-Host "ERROR: No existe $buildGradle" -ForegroundColor Red
    Write-Host "Primero ejecuta: npx expo prebuild --platform android --clean"
    exit 1
}

$content = Get-Content $buildGradle -Raw

if ($content -match 'kotlinVersion\s*=\s*"([^"]+)"') {
    $currentVersion = $matches[1]
    if ($currentVersion -eq "2.1.0") {
        Write-Host "OK - Kotlin ya es version 2.1.0, no se necesita cambio." -ForegroundColor Green
        exit 0
    }
    $content = $content -replace "kotlinVersion\s*=\s*`"[^`"]+`"", 'kotlinVersion = "2.1.0"'
    Set-Content $buildGradle $content -NoNewline
    Write-Host "OK - Kotlin actualizado de $currentVersion a 2.1.0" -ForegroundColor Green
    Write-Host "Ahora haz Sync en Android Studio (File -> Sync Project with Gradle Files)"
} else {
    Write-Host "No se encontro kotlinVersion en $buildGradle" -ForegroundColor Yellow
    Write-Host "Contenido del archivo:"
    Get-Content $buildGradle | Select-Object -First 30
}
