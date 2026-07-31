@echo off
setlocal

if "%~1"=="" (
  echo Drag an HTML file onto this script.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\Build-ConsoShareHtml.ps1" -InputPath "%~1" -OutputPath "%~dpn1.test.conso.html" -Environment test -MiniAppDomain invite_miniApp_v2_bot -MiniAppName invite
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Test build completed.
pause
