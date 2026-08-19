@echo off
cd /d "%~dp0"
echo.
echo  ================================================
echo    Health Diet Manager  /  Gungang Sikdan Gwanli
echo  ================================================
echo.
echo  Starting server...  http://localhost:5173
echo.
echo  *** Do NOT close this window while using the app ***
echo.
start "" http://localhost:5173
call npm.cmd run dev
echo.
echo  Server stopped.
pause
