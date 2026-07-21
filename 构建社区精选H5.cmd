@echo off
setlocal

if "%~1"=="" (
  echo Drag an HTML file onto this script.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\Build-ConsoShareHtml.ps1" "%~1"
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Build completed.
pause
