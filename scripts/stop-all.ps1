#Requires -Version 5.1
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")

Write-Host "Stopping Happy Veggie (API + Angular frontend)..."
Stop-AllServices
Write-Host "All tracked processes and listeners on ports 5262 and 4200 have been stopped."
Write-Host "(Also cleared legacy React ports 5173/5174 if anything was still listening.)"
