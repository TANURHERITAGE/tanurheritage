@echo off
cd /d "%~dp0"
echo ========================================================
echo   Uploading TANUR HERITAGE files and assets to GitHub
echo ========================================================
echo.
git push origin main
echo.
if %errorlevel% equ 0 (
    echo --------------------------------------------------------
    echo [SUCCESS] All styles and assets are now uploaded to GitHub!
    echo Vercel and GitHub Pages will now display your website properly.
    echo --------------------------------------------------------
) else (
    echo --------------------------------------------------------
    echo [NOTE] If a browser window popped up, sign in to authorize.
    echo If it failed, check your GitHub permissions.
    echo --------------------------------------------------------
)
pause
