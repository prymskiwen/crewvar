@echo off
REM Firebase Deployment Script for Windows
REM This script builds and deploys the CrewVar frontend to Firebase Hosting

echo 🚀 Starting Firebase deployment...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Firebase first:
    firebase login
)

REM Build the project
echo 📦 Building project...
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Deploy to Firebase
    echo 🚀 Deploying to Firebase Hosting...
    firebase deploy --only hosting
    
    if %errorlevel% equ 0 (
        echo 🎉 Deployment successful!
        echo 🌐 Your app is now live on Firebase Hosting!
    ) else (
        echo ❌ Deployment failed!
        exit /b 1
    )
) else (
    echo ❌ Build failed!
    exit /b 1
)
