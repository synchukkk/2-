@echo off
cd /d C:\Users\yarik\OneDrive\Рабочий стол\diplomna
echo Starting NewsFlow App Server...
echo.
echo Open your browser at: http://localhost:8000
echo.
python -m http.server 8000
pause
