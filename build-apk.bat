@echo off
echo Building APK for BlueStacks testing...

REM Build the web app
echo Step 1: Building web app...
call npm run build

REM Sync with Capacitor
echo Step 2: Syncing with Capacitor...
call npx cap sync

REM Navigate to Android directory
cd android

REM Build APK
echo Step 3: Building APK...
call gradlew assembleDebug

echo.
echo APK built successfully!
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on BlueStacks:
echo 1. Open BlueStacks
echo 2. Drag and drop the APK file into BlueStacks
echo 3. Or use: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
