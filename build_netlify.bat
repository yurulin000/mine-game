@echo off
REM ============================================================
REM  Mine Game - build the upload folder for Netlify
REM  ------------------------------------------------------------
REM  Double-click this file. It creates / refreshes the folder
REM  "netlify_deploy" next to this file, containing ONLY the
REM  files the game actually needs (about 40 MB instead of 208 MB).
REM  Then drag that folder onto the Netlify deploy box.
REM
REM  Keep this file in English only - Chinese characters break
REM  the way cmd.exe parses the script.
REM ============================================================

cd /d "%~dp0"
set OUT=netlify_deploy

echo.
echo   Building %OUT% ...
echo.

if exist "%OUT%" rmdir /s /q "%OUT%"
mkdir "%OUT%"

REM --- page and scripts ---
copy /y index.html      "%OUT%\" >nul
copy /y polish.js       "%OUT%\" >nul
copy /y mining.js       "%OUT%\" >nul
copy /y mobile.js       "%OUT%\" >nul
copy /y look.js         "%OUT%\" >nul
copy /y camp.js         "%OUT%\" >nul
copy /y quality-pass.js "%OUT%\" >nul
copy /y detail-pass.js  "%OUT%\" >nul
copy /y audio.js        "%OUT%\" >nul
copy /y info.js         "%OUT%\" >nul

REM --- 3D models actually loaded by the game ---
robocopy models "%OUT%\models" reference_cavern.glb reference_cavern_nav.js stylized_mine_lamp.glb /njh /njs /ndl /nfl /nc /ns >nul
robocopy assets\models\pickaxes "%OUT%\assets\models\pickaxes" *.glb /njh /njs /ndl /nfl /nc /ns >nul

REM --- pictures, music, sound effects ---
robocopy images "%OUT%\images" /e /njh /njs /ndl /nfl /nc /ns >nul
robocopy music  "%OUT%\music"  /e /njh /njs /ndl /nfl /nc /ns >nul
robocopy sfx    "%OUT%\sfx"    /e /njh /njs /ndl /nfl /nc /ns >nul

echo   Done.
echo.
echo   Next step:
echo     1. Open https://app.netlify.com and sign in
echo     2. Go to your site - Deploys
echo     3. Drag the folder "%OUT%" onto the dashed drop box
echo.
echo   Do NOT zip it - Chinese file names in music / sfx
echo   can break inside a zip. Dragging the folder is safest.
echo.
pause
