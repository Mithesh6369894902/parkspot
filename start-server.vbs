Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\MITHESH D\parkspot\server"
WshShell.Run "cmd /c node src/server.js > logs\server.log 2>&1", 0, False
