@echo off
title Deploy Tanur Heritage
echo ============================================
echo   TANUR HERITAGE - DEPLOY TO LIVE SITE
echo ============================================
echo.
cd /d "C:\Users\Student\Documents\TANURHERITAGE-master"
echo Pushing to GitHub...
git push origin main
echo.
if %errorlevel% == 0 (
  echo ============================================
  echo   SUCCESS! Site will update in ~1 minute.
  echo   Visit: https://tanurheritage.in/admin
  echo ============================================
) else (
  echo ============================================
  echo   ERROR - Push failed. Try again.
  echo ============================================
)
pause
