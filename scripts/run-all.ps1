#Requires -Version 5.1
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")
Ensure-RuntimeDir

if (-not $script:DotnetPath) {
    throw "'dotnet' is not on PATH. Install the .NET SDK before running the stack."
}
if (-not $script:NpmPath) {
    throw "'npm' is not on PATH. Install Node.js (includes npm), then retry."
}
if (-not (Test-Path (Join-Path $script:FrontendRoot "package.json"))) {
    throw "Angular frontend not found at $($script:FrontendRoot). Expected package.json."
}

if (-not (Test-Path (Join-Path $script:FrontendRoot "node_modules"))) {
    Write-Host "Installing frontend dependencies (npm install)..."
    Push-Location $script:FrontendRoot
    try {
        & $script:NpmPath "install"
        if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
    }
    finally {
        Pop-Location
    }
}

Write-Host "Stopping any existing Happy Veggie processes..."
Stop-AllServices
Start-Sleep -Seconds 1

$started = @()

foreach ($svc in $script:Services) {
    if (-not $svc.FilePath) {
        throw "Missing executable for service '$($svc.Name)'."
    }

    $outLog = Join-Path $script:RuntimeDir "$($svc.Name).out.log"
    $argString = ($svc.Arguments | ForEach-Object {
            if ($_ -match '\s') { '"{0}"' -f $_ } else { $_ }
        }) -join " "

    $pathEnv = $env:Path -replace '"', '""'
    $quotedExe = $svc.FilePath
    $cmdLine = "set `"PATH=$pathEnv`" && cd /d `"$($svc.WorkDir)`" && `"$quotedExe`" $argString > `"$outLog`" 2>&1"

    $proc = Start-Process `
        -FilePath "cmd.exe" `
        -ArgumentList "/c", $cmdLine `
        -WindowStyle Hidden `
        -PassThru

    $started += [pscustomobject]@{
        Name = $svc.Name
        Pid  = $proc.Id
        Port = $svc.Port
        Url  = $svc.Url
        Log  = $outLog
    }

    Write-Host "Started $($svc.Name) (PID $($proc.Id)) -> $($svc.Url)"
}

$started | ConvertTo-Json | Set-Content -Encoding utf8 $script:PidFile

Write-Host ""
Write-Host "Waiting for API health..."
$healthy = $false
$deadline = (Get-Date).AddSeconds(90)
while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5262/api/v1/system/health" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    }
    catch {
        Start-Sleep -Seconds 2
        continue
    }
    Start-Sleep -Seconds 2
}

if (-not $healthy) {
    Write-Host "API did not become healthy within 90s. Check $script:RuntimeDir\api.out.log"
}
else {
    Write-Host "API is healthy (SQLite or SQL Server is ready)."
}

Write-Host ""
Write-Host "Happy Veggie is starting:"
Write-Host "  API        http://localhost:5262"
Write-Host "  Swagger    http://localhost:5262/swagger"
Write-Host "  App        http://localhost:4200"
Write-Host "  Admin      http://localhost:4200/admin"
Write-Host ""
Write-Host "Demo farmer: +923001234567  OTP 1234"
Write-Host "Demo admin:  admin@happyveggie.pk / HappyVeggie!2026"
Write-Host ""
Write-Host "Logs: $script:RuntimeDir"
Write-Host "Stop with: .\scripts\stop-all.ps1"
