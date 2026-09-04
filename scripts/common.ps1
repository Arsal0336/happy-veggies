$ErrorActionPreference = "Stop"

$script:RepoRoot = Split-Path -Parent $PSScriptRoot
$script:RuntimeDir = Join-Path $PSScriptRoot ".runtime"
$script:PidFile = Join-Path $script:RuntimeDir "pids.json"
$script:PnpmShimDir = Join-Path $env:LOCALAPPDATA "pnpm-shims"

function Ensure-PnpmOnPath {
    $nodeDir = Join-Path $env:ProgramFiles "nodejs"
    $pathParts = @()
    if (Test-Path $script:PnpmShimDir) { $pathParts += $script:PnpmShimDir }
    if (Test-Path $nodeDir) { $pathParts += $nodeDir }
    $pathParts += $env:Path
    $env:Path = ($pathParts -join ";")

    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        $corepack = Get-Command corepack.cmd -ErrorAction SilentlyContinue
        if (-not $corepack) { $corepack = Get-Command corepack -ErrorAction SilentlyContinue }
        if ($corepack) {
            if (-not (Test-Path $script:PnpmShimDir)) {
                New-Item -ItemType Directory -Path $script:PnpmShimDir | Out-Null
            }
            & $corepack.Source enable --install-directory $script:PnpmShimDir
            $env:Path = "$script:PnpmShimDir;$env:Path"
        }
    }
}

Ensure-PnpmOnPath

function Get-CommandPath([string]$Name) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

function Resolve-PnpmPath {
    foreach ($name in @("pnpm.cmd", "pnpm.exe", "pnpm")) {
        $path = Get-CommandPath $name
        if ($path) { return $path }
    }

    $userPnpm = Join-Path $env:APPDATA "npm\pnpm.cmd"
    if (Test-Path $userPnpm) { return $userPnpm }

    $corepack = Get-CommandPath "corepack.cmd"
    if (-not $corepack) { $corepack = Get-CommandPath "corepack" }
    if ($corepack) { return $corepack }

    return $null
}

function Resolve-DotnetPath {
    $path = Get-CommandPath "dotnet"
    if ($path) { return $path }
    $fallback = Join-Path $env:ProgramFiles "dotnet\dotnet.exe"
    if (Test-Path $fallback) { return $fallback }
    return $null
}

$script:DotnetPath = Resolve-DotnetPath
$script:PnpmPath = Resolve-PnpmPath
$script:PnpmUsesCorepack = $false
if ($script:PnpmPath -and ((Split-Path -Leaf $script:PnpmPath) -match '^corepack')) {
    $script:PnpmUsesCorepack = $true
}

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
        Name      = "farmer-web"
        Port      = 5173
        Url       = "http://localhost:5173"
        FilePath  = $script:PnpmPath
        Arguments = $(if ($script:PnpmUsesCorepack) { @("pnpm", "dev:farmer") } else { @("dev:farmer") })
        WorkDir   = Join-Path $script:RepoRoot "Frontend"
    }
    @{
        Name      = "admin-web"
        Port      = 5174
        Url       = "http://localhost:5174"
        FilePath  = $script:PnpmPath
        Arguments = $(if ($script:PnpmUsesCorepack) { @("pnpm", "dev:admin") } else { @("dev:admin") })
        WorkDir   = Join-Path $script:RepoRoot "Frontend"
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
    foreach ($entry in $tracked) {
        Stop-ProcessTree ([int]$entry.Pid)
    }
}

function Stop-AllServices {
    Stop-TrackedProcesses
    foreach ($svc in $script:Services) {
        Stop-PortListeners ([int]$svc.Port)
    }
    if (Test-Path $script:PidFile) {
        Remove-Item $script:PidFile -Force
    }
}
