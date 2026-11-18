<#
.SYNOPSIS
    BootCraft Studio — Standalone FAT32 Formatter for Large Drives (>32GB)
.DESCRIPTION
    Форматирует накопитель любого объема в FAT32 в обход стандартного 32 ГБ лимита Windows.
.EXAMPLE
    .\fat32_formatter.ps1 -DriveLetter "E:" -ClusterSizeKB 32 -VolumeLabel "AUDIO_CAR"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, HelpMessage = "Буква диска, например E:")]
    [string]$DriveLetter,

    [ValidateSet(8, 16, 32, 64)]
    [int]$ClusterSizeKB = 32,

    [string]$VolumeLabel = "BOOTCRAFT"
)

# Проверка прав администратора
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Этот скрипт необходимо запускать от имени Администратора!"
    exit 1
}

$cleanDrive = $DriveLetter.TrimEnd(':')
$clusterBytes = $ClusterSizeKB * 1024

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " BootCraft Studio — Форматирование накопителя $DriveLetter" -ForegroundColor Cyan
Write-Host " Файловая система: FAT32 | Кластер: $ClusterSizeKB KB | Метка: $VolumeLabel" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Подтверждение безопасности
$confirm = Read-Host "ВНИМАНИЕ: Все данные на диске $DriveLetter будут стерты! Продолжить? (y/n)"
if ($confirm.ToLower() -ne 'y') {
    Write-Host "Операция отменена пользователем." -ForegroundColor Red
    exit 0
}

try {
    Write-Host "Выполняется форматирование..." -ForegroundColor Cyan
    Format-Volume -DriveLetter $cleanDrive -FileSystem FAT32 -NewFileSystemLabel $VolumeLabel -AllocationUnitSize $clusterBytes -Force -Confirm:$false
    Write-Host "Форматирование успешно завершено! Накопитель готов к работе." -ForegroundColor Green
}
catch {
    Write-Error "Ошибка при форматировании: $_"
}
