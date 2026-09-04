$ErrorActionPreference = "Stop"

$script:RepoRoot = Split-Path -Parent $PSScriptRoot
$script:RuntimeDir = Join-Path $PSScriptRoot ".runtime"
$script:PidFile = Join-Path $script:RuntimeDir "pids.json"
$script:LegacyPorts = @(5173, 5174)

function Get-CommandPath([string]$Name) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

function Resolve-NpmPath {
    foreach ($name in @("npm.cmd", "npm.exe", "npm")) {
        $path = Get-CommandPath $name
        if ($path) { return $path }
    }

    $nodeDir = Join-Path $env:ProgramFiles "nodejs"
    foreach ($name in @("npm.cmd", "npm.exe")) {
        $candidate = Join-Path $nodeDir $name
        if (Test-Path $candidate) { return $candidate }
    }

    return $null
}

function Resolve-DotnetPath {
    $path = Get-CommandPath "dotnet"
    if ($path) { return $path }
    $fallback = Join-Path $env:ProgramFiles "dotnet\dotnet.exe"
    if (Test-Path $fallback) { return $fallback }
    return $null
}

function Resolve-FrontendRoot {
    foreach ($name in @("frontend", "Frontend")) {
        $candidate = Join-Path $script:RepoRoot $name
        if (Test-Path (Join-Path $candidate "package.json")) {
            return $candidate
        }
    }
    return (Join-Path $script:RepoRoot "frontend")
}

$script:DotnetPath = Resolve-DotnetPath
$script:NpmPath = Resolve-NpmPath
$script:FrontendRoot = Resolve-FrontendRoot

$script:Services = @(
    @{
        Name      = "api"
        Port      = 5262
        Url       = "http://localhost:5262"
        FilePath  = $script:DotnetPath
        Arguments = @(
            "run",
            "--project", "src/HappyVeggie.Api/HappyVeggie.Api.csproj",
            "--launch-profile", "http"
        )
        WorkDir   = $script:RepoRoot
    }
    @{
        Name      = "frontend"
        Port      = 4200
        Url       = "http://localhost:4200"
        FilePath  = $script:NpmPath
        Arguments = @("start")
        WorkDir   = $script:FrontendRoot
    }
)

function Ensure-RuntimeDir {
    if (-not (Test-Path $script:RuntimeDir)) {
        New-Item -ItemType Directory -Path $script:RuntimeDir | Out-Null
    }
}

function Get-ListenPids([int]$Port) {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) { return @() }
    return @($conns | Select-Object -ExpandProperty OwningProcess -Unique)
}

function Stop-ProcessTree([int]$ProcessId) {
    if ($ProcessId -le 0) { return }
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    try {
        & taskkill.exe /PID $ProcessId /T /F | Out-Null
    }
    finally {
        $ErrorActionPreference = $prev
        $global:LASTEXITCODE = 0
    }
}

function Stop-PortListeners([int]$Port) {
    foreach ($processId in (Get-ListenPids $Port)) {
        Stop-ProcessTree $processId
    }
}

function Stop-TrackedProcesses {
    if (-not (Test-Path $script:PidFile)) { return }
    $tracked = Get-Content -Raw $script:PidFile | ConvertFrom-Json
    foreach ($entry in @($tracked)) {
        Stop-ProcessTree ([int]$entry.Pid)
    }
}

function Stop-AllServices {
    Stop-TrackedProcesses
    foreach ($svc in $script:Services) {
        Stop-PortListeners ([int]$svc.Port)
    }
    # Clear leftover Vite ports from the old React apps
    foreach ($port in $script:LegacyPorts) {
        Stop-PortListeners ([int]$port)
    }
    if (Test-Path $script:PidFile) {
        Remove-Item $script:PidFile -Force
    }
}
