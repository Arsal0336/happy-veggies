#Requires -Version 5.1
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")

Write-Host "Stopping Happy Veggie (API, farmer-web, admin-web)..."
Stop-AllServices
Write-Host "All tracked processes and listeners on ports 5262, 5173, and 5174 have been stopped."
