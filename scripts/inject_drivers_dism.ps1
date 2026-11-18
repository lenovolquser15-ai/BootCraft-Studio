<#
.SYNOPSIS
    BootCraft Studio — Интеграция драйверов в образ Windows (DISM)
.DESCRIPTION
    Монтирует boot.wim или install.wim и вшивает сторонние драйверы (Intel VMD/RST, Wi-Fi, LAN).
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$WimPath, # Например: "E:\sources\boot.wim"

    [Parameter(Mandatory = $true)]
    [string]$DriversFolder, # Папка с распакованными .inf драйверами

    [int]$Index = 2 # Индекс образа (2 для Windows Setup в boot.wim)
)

$mountDir = "$env:TEMP\BootCraft_WimMount"

Write-Host ">>> Создание точки монтирования: $mountDir" -ForegroundColor Cyan
if (-not (Test-Path $mountDir)) {
    New-Item -ItemType Directory -Path $mountDir | Out-Null
}

try {
    Write-Host ">>> Монтирование WIM-образа..." -ForegroundColor Yellow
    dism /Mount-Wim /WimFile:"$WimPath" /Index:$Index /MountDir:"$mountDir"

    Write-Host ">>> Интеграция драйверов из $DriversFolder..." -ForegroundColor Cyan
    dism /Image:"$mountDir" /Add-Driver /Driver:"$DriversFolder" /Recurse

    Write-Host ">>> Сохранение изменений и размонтирование..." -ForegroundColor Green
    dism /Unmount-Wim /MountDir:"$mountDir" /Commit
    Write-Host ">>> Драйверы успешно интегрированы!" -ForegroundColor Green
}
catch {
    Write-Error "Ошибка при обработке DISM: $_"
    dism /Unmount-Wim /MountDir:"$mountDir" /Discard
}
finally {
    if (Test-Path $mountDir) {
        Remove-Item -Path $mountDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
