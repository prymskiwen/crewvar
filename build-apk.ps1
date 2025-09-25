Write-Host "Building APK for BlueStacks testing..." -ForegroundColor Green

# Build the web app
Write-Host "Step 1: Building web app..." -ForegroundColor Yellow
npm run build

# Sync with Capacitor
Write-Host "Step 2: Syncing with Capacitor..." -ForegroundColor Yellow
npx cap sync

# Navigate to Android directory
Set-Location android

# Build APK
Write-Host "Step 3: Building APK..." -ForegroundColor Yellow
.\gradlew assembleDebug

Write-Host ""
Write-Host "APK built successfully!" -ForegroundColor Green
Write-Host "Location: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan
Write-Host ""
Write-Host "To install on BlueStacks:" -ForegroundColor Yellow
Write-Host "1. Open BlueStacks" -ForegroundColor White
Write-Host "2. Drag and drop the APK file into BlueStacks" -ForegroundColor White
Write-Host "3. Or use: adb install android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
