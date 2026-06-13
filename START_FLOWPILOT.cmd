@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_EXE=node"

where node >nul 2>nul
if errorlevel 1 (
  set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

cd /d "%PROJECT_DIR%"

powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/api/overview' -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
if errorlevel 1 (
  start "FlowPilot Server" /min "%NODE_EXE%" "%PROJECT_DIR%\server.mjs"
  timeout /t 2 /nobreak >nul
)

start "" "http://localhost:3000"
endlocal
