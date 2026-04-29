@echo off
echo ============================================
echo  CineTrack - Frontend Setup
echo ============================================
echo.
echo Step 1: Installing npm packages...
npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm install failed. Is Node.js installed?
    pause
    exit /b 1
)
echo.
echo Step 2: Starting Vite dev server on http://localhost:5173
echo   Make sure backend is running on port 8000 first!
echo.
npm run dev
