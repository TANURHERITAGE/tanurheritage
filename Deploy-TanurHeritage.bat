@echo off
title Deploy Tanur Heritage to Live Site
echo ========================================================
echo   TANUR HERITAGE - ONE-CLICK DEPLOY TO LIVE SITE
echo   Target: https://www.tanurheritage.in
echo ========================================================
echo.
cd /d "%~dp0"

echo 1. Pushing code to GitHub...
git push origin main
echo.

echo 2. Deploying to Vercel...
if exist "%~dp0.vercel_token" (
  set /p VERCEL_TOKEN=<"%~dp0.vercel_token"
  call npx vercel deploy --prod --yes --token %VERCEL_TOKEN%
) else (
  call npx vercel deploy --prod --yes
)
echo.

if %errorlevel% == 0 (
  echo ========================================================
  echo   SUCCESS! Deployment complete!
  echo   Website:     https://www.tanurheritage.in
  echo   Admin Panel: https://www.tanurheritage.in/admin
  echo ========================================================
) else (
  echo ========================================================
  echo   Deployment encountered an issue. Check the output above.
  echo ========================================================
)
echo.
pause
