@echo off
echo ============================================
echo  CineTrack - Backend Setup
echo ============================================
echo.
echo Step 1: Installing Python dependencies...
python -m pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo ERROR: pip install failed. Is Python installed?
    pause
    exit /b 1
)
echo.
echo Step 2: Generating dataset...
python generate_dataset.py
echo.
echo Step 3: Starting FastAPI server on http://localhost:8000
echo   API docs: http://localhost:8000/docs
echo.
python -m uvicorn app:app --reload --port 8000
