#Requires -Version 5.1
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")
Ensure-RuntimeDir

if (-not $script:DotnetPath) {
    throw "'dotnet' is not on PATH. Install the .NET SDK before running the stack."
}
if (-not $script:PnpmPath) {
    throw "'pnpm' is not on PATH. Enable Corepack (`corepack enable`) or install pnpm, then retry."
}

$frontendRoot = Join-Path $script:RepoRoot "Frontend"
if (-not (Test-Path (Join-Path $frontendRoot "node_modules"))) {
    Write-Host "Installing frontend dependencies..."
    Push-Location $frontendRoot
    try {
        $installArgs = $(if ($script:PnpmUsesCorepack) { @("pnpm", "install") } else { @("install") })
        & $script:PnpmPath @installArgs
        if ($LASTEXITCODE -ne 0) { throw "pnpm install failed." }
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
    $outLog = Join-Path $script:RuntimeDir "$($svc.Name).out.log"
    $errLog = Join-Path $script:RuntimeDir "$($svc.Name).err.log"
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
Write-Host "Happy Veggie is starting:"
Write-Host "  API        http://localhost:5262"
Write-Host "  Farmer web http://localhost:5173"
Write-Host "  Admin web  http://localhost:5174"
Write-Host ""
Write-Host "Logs: $script:RuntimeDir"
Write-Host "Stop with: .\scripts\stop-all.ps1"
