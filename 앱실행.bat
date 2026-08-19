@echo off
chcp 65001 >nul
title 건강 식단관리
cd /d "%~dp0"

echo.
echo   ================================================
echo      🥗  건강 식단관리
echo   ================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo   [오류] Node.js가 설치되어 있지 않습니다.
    echo          https://nodejs.org 에서 설치한 뒤 다시 실행해 주세요.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo   [준비] 최초 실행이라 필요한 파일을 설치합니다. 2~3분 걸려요...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo   [오류] 설치에 실패했습니다.
        pause
        exit /b 1
    )
    echo.
)

echo   앱을 시작합니다. 잠시 후 브라우저가 열립니다.
echo.
echo   ------------------------------------------------
echo     주소:  http://localhost:5173
echo.
echo     ** 이 검은 창을 닫으면 앱도 꺼집니다 **
echo     ** 다 쓰신 뒤에는 이 창을 닫아주세요 **
echo   ------------------------------------------------
echo.

start "" http://localhost:5173
call npm run dev

echo.
echo   앱이 종료되었습니다.
pause
