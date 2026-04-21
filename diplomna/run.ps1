# NewsFlow App Launcher Script
# PowerShell script to run the news app locally

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   NewsFlow - Viewer with Bookmarks" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$appPath = $PSScriptRoot

Write-Host "App Path: $appPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting local server..." -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

Set-Location $appPath

# Start Python HTTP server
python -m http.server 8000
