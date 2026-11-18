# BootCraft Studio — Windows Setup & Shortcut Creator
param (
    [switch]$CreateDesktopShortcut = $true
)

$studioDir = $PSScriptRoot
$launcher = Join-Path $studioDir "Run-BootCraft.bat"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " BootCraft Studio — Установка и создание ярлыка" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $launcher)) {
    Write-Error "Лаунчер не найден: $launcher"
    exit 1
}

if ($CreateDesktopShortcut) {
    try {
        $desktop = [Environment]::GetFolderPath("Desktop")
        $shortcutPath = Join-Path $desktop "BootCraft Studio.lnk"
        
        $wscript = New-Object -ComObject WScript.Shell
        $shortcut = $wscript.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $launcher
        $shortcut.WorkingDirectory = $studioDir
        $shortcut.Description = "BootCraft Studio — Визуальный конструктор USB и ОС"
        $shortcut.Save()
        
        Write-Host ">>> Ярлык успешно создан на рабочем столе: $shortcutPath" -ForegroundColor Green
    }
    catch {
        Write-Warning "Не удалось создать ярлык: $_"
    }
}

Write-Host ">>> Установка завершена! Запустите Run-BootCraft.bat для работы." -ForegroundColor Green
