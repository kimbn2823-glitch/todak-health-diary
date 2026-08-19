' 건강 식단관리 앱 서버를 창 없이 백그라운드로 실행합니다.
' 0 = 창 숨김, False = 종료를 기다리지 않음
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = appDir

' dist 폴더(빌드 결과)가 없으면 먼저 빌드한다.
If Not fso.FolderExists(appDir & "\dist") Then
  sh.Run "cmd /c npm.cmd run build", 0, True
End If

sh.Run "cmd /c npm.cmd run serve", 0, False
