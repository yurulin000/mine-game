@echo off
REM ============================================================
REM  Mine Game - local test server
REM  Double-click this file to play the game.
REM  (Model files (.glb) cannot be loaded by double-clicking
REM   index.html directly, so a small local server is needed.)
REM  Keep the black server window open while playing.
REM  Close that window to stop the server.
REM ============================================================

cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo   ERROR: Python was not found.
  echo   Please install Python from https://www.python.org
  echo.
  pause
  exit /b
)

start "Mine Game Server - close this window to stop" python -m http.server 8765 --bind 127.0.0.1
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8765/index.html
exit
