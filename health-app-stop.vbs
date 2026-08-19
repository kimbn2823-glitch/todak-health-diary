' 건강 식단관리 앱 서버를 종료합니다.
Set sh = CreateObject("WScript.Shell")
sh.Run "cmd /c taskkill /F /IM node.exe", 0, True
MsgBox "건강 식단관리 앱을 종료했습니다.", 64, "건강 식단관리"
