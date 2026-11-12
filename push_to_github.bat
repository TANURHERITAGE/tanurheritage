@echo off
title Deploy Tanur Heritage
echo ========================================================
echo   TANUR HERITAGE - PUSH UPDATES TO LIVE WEBSITE
echo ========================================================
echo.
cd /d "%~dp0"
echo 1. Adding all changes...
git add -A
echo 2. Committing changes...
git commit -m "Update homepage to magazine layout (Posters, Editorial, Videos, Recent) and admin controls"
echo 3. Pushing to GitHub repository...
git push origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   [SUCCESS] All files uploaded to GitHub!
    echo   Your live website will be updated in 1-2 minutes:
    echo   https://tanurheritage.in
    echo   https://tanurheritage.in/admin
    echo ========================================================
) else (
    echo ========================================================
    echo   [NOTE] If a browser login window appeared, sign in.
    echo   If push failed, check your internet or git credentials.
    echo ========================================================
)
echo.
pause
