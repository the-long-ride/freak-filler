@echo off
echo Freak Filler Extension - Build Script
echo =====================================
echo.

echo [1/3] Cleaning previous build...
if exist dist rmdir /s /q dist
mkdir dist

echo [2/3] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed. Check your network/proxy settings.
    pause
    exit /b 1
)

echo [3/3] Building extension...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed. Check error messages above.
    pause
    exit /b 1
)

echo.
echo =====================================
echo Build completed successfully!
echo.
echo Next steps:
echo 1. Open Chrome and go to: chrome://extensions/ (for other chomium-based browsers, use the equivalent URL: {browser name}://extensions/)
echo 2. Enable "Developer mode"
echo 3. Click "Load unpacked"
echo 4. Select the "dist" folder from this directory
echo.
echo The extension is ready to use!
echo =====================================
