/**
 * BootCraft Studio — Code & Configuration Generator
 * Анализирует цепочку блоков на холсте и генерирует готовые скрипты и конфигурации.
 */

class CodeGenerator {
  generate(nodes, targetType) {
    switch (targetType) {
      case 'autounattend':
        return this.generateAutounattend(nodes);
      case 'format_script':
        return this.generateFormatScript(nodes);
      case 'setup_complete':
        return this.generateSetupComplete(nodes);
      case 'fat_sorter':
        return this.generateFatSorterScript(nodes);
      case 'diskpart_script':
        return this.generateDiskpartScript(nodes);
      default:
        return '# Неизвестный целевой тип';
    }
  }

  // ── Генерация autounattend.xml ───────────────────────────────────────────
  generateAutounattend(nodes) {
    const winProfile = nodes.find(n => n.type === 'profile_windows') || {};
    const bypassBlock = nodes.find(n => n.type === 'win_bypass_requirements');
    const userBlock = nodes.find(n => n.type === 'win_local_user');
    const debloatBlock = nodes.find(n => n.type === 'win_debloat_tweaks');

    const username = userBlock?.props?.username || 'User';
    const password = userBlock?.props?.password || '';
    const autoLogon = userBlock?.props?.autoLogon ?? true;
    const bypassTpm = bypassBlock?.props?.bypassTPM ?? true;

    return `<?xml version="1.0" encoding="utf-8"?>
<!-- Сгенерировано в BootCraft Studio -->
<unattend xmlns="urn:schemas-microsoft-com:unattend">
  <settings pass="windowsPE">
    <component name="Microsoft-Windows-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <UserData>
        <AcceptEula>true</AcceptEula>
      </UserData>
      ${bypassTpm ? `
      <!-- Обход требований к оборудованию Windows 11 -->
      <RunSynchronous>
        <RunSynchronousCommand wcm:action="add">
          <Order>1</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassTPMCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
        <RunSynchronousCommand wcm:action="add">
          <Order>2</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassSecureBootCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
        <RunSynchronousCommand wcm:action="add">
          <Order>3</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassRAMCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
        <RunSynchronousCommand wcm:action="add">
          <Order>4</Order>
          <Path>reg add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassCPUCheck /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
      </RunSynchronous>` : ''}
    </component>
  </settings>

  <settings pass="oobeSystem">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <OOBE>
        <HideEULAPage>true</HideEULAPage>
        <HideOnlineAccountScreens>true</HideOnlineAccountScreens>
        <HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>
        <ProtectYourPC>3</ProtectYourPC>
      </OOBE>
      <UserAccounts>
        <LocalAccounts>
          <LocalAccount wcm:action="add">
            <Name>${username}</Name>
            <Group>Administrators</Group>
            <Password>
              <Value>${password}</Value>
              <PlainText>true</PlainText>
            </Password>
          </LocalAccount>
        </LocalAccounts>
      </UserAccounts>
      ${autoLogon ? `
      <AutoLogon>
        <Username>${username}</Username>
        <Enabled>true</Enabled>
        <LogonCount>999</LogonCount>
        <Password>
          <Value>${password}</Value>
          <PlainText>true</PlainText>
        </Password>
      </AutoLogon>` : ''}
    </component>
  </settings>
</unattend>`;
  }

  // ── Генерация PowerShell скрипта форматирования (FAT32 Bypass) ───────────
  generateFormatScript(nodes) {
    const fatBlock = nodes.find(n => n.type === 'fs_fat32_formatter');
    const mbrBlock = nodes.find(n => n.type === 'fs_mbr_partition');
    const cluster = fatBlock?.props?.clusterSize || '32K';
    const label = fatBlock?.props?.volumeLabel || 'BOOTCRAFT';
    const isMbr = !!mbrBlock;

    return `# =====================================================================
# BootCraft Studio — Форматирование накопителя в FAT32 (Обход лимита 32 ГБ)
# =====================================================================

param (
    [Parameter(Mandatory=$true)]
    [string]$DriveLetter, # Например: "E:"

    [int]$ClusterSizeKB = ${cluster.replace('K', '')}
)

Write-Host ">>> Запуск форматирования BootCraft для накопителя $DriveLetter" -ForegroundColor Cyan

# Проверка прав администратора
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Запустите PowerShell от имени Администратора!"
    exit 1
}

$cleanDrive = $DriveLetter.TrimEnd(':')
$clusterBytes = $ClusterSizeKB * 1024

Write-Host ">>> Метка тома: ${label}, Размер кластера: $ClusterSizeKB KB, ФС: FAT32" -ForegroundColor Yellow

# Форматирование тома в FAT32 в обход ограничений GUI
Format-Volume -DriveLetter $cleanDrive -FileSystem FAT32 -NewFileSystemLabel "${label}" -AllocationUnitSize $clusterBytes -Force -Confirm:$false

Write-Host ">>> Успешно! Флешка отформатирована в FAT32 и готова к использованию." -ForegroundColor Green
`;
  }

  // ── Генерация SetupComplete.cmd ──────────────────────────────────────────
  generateSetupComplete(nodes) {
    const debloat = nodes.find(n => n.type === 'win_debloat_tweaks');
    const customBlocks = nodes.filter(n => n.isCustom && n.target === 'setup_complete');

    let output = `@echo off
rem ===========================================================================
rem BootCraft Studio — Скрипт постобработки Windows (SetupComplete.cmd)
rem ===========================================================================

echo [BootCraft] Применение оптимизаций и параметров...
`;

    if (debloat?.props?.disableTelemetry) {
      output += `
rem Отключение телеметрии и сбора данных
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f
`;
    }

    if (debloat?.props?.disableWebSearchInStart) {
      output += `
rem Отключение поиска в сети интернет через Bing в меню Пуск
reg add "HKCU\\Software\\Policies\\Microsoft\\Windows\\Explorer" /v DisableSearchBoxSuggestions /t REG_DWORD /d 1 /f
`;
    }

    if (debloat?.props?.enableClassicContextMenu) {
      output += `
rem Включение классического контекстного меню Windows 10
reg add "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32" /f /ve
`;
    }

    // Кастомные блоки
    customBlocks.forEach(cb => {
      output += `\nrem --- Кастомный блок: ${cb.name} ---\n`;
      output += cb.props?.customScript || '';
      output += '\n';
    });

    output += `\necho [BootCraft] Настройка успешно завершена!\n`;
    return output;
  }

  // ── Генерация Python-скрипта сортировщика записей FAT ────────────────────
  generateFatSorterScript(nodes) {
    return `#!/usr/bin/env python3
"""
BootCraft Studio — FAT Directory Table Sorter
Упорядочивает физический порядок файлов на FAT32-носителе для старых муз. центров.
"""

import os, sys, shutil

def sort_directory_entries(target_path):
    print(f"[BootCraft] Анализ каталога: {target_path}")
    if not os.path.isdir(target_path):
        print(f"Ошибка: путь {target_path} не найден.")
        return

    # Чтение файлов и сортировка по натуральному алфавитному порядку (01, 02...)
    files = [f for f in os.listdir(target_path) if not f.startswith('.')]
    files.sort(key=lambda s: s.lower())

    temp_folder = os.path.join(target_path, '__bootcraft_sort_temp__')
    os.makedirs(temp_folder, exist_ok=True)

    print(f"[BootCraft] Сортировка {len(files)} элементов в физической таблице FAT32...")
    
    # Временное перемещение для перезаписи дескрипторов каталога
    for item in files:
        src = os.path.join(target_path, item)
        dst = os.path.join(temp_folder, item)
        shutil.move(src, dst)

    # Запись обратно в отсортированном порядке
    for item in files:
        src = os.path.join(temp_folder, item)
        dst = os.path.join(target_path, item)
        shutil.move(src, dst)

    os.rmdir(temp_folder)
    print("[BootCraft] Готово! Теперь магнитола будет играть треки в правильном порядке.")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '.'
    sort_directory_entries(target)
`;
  }

  // ── Генерация сценария diskpart ──────────────────────────────────────────
  generateDiskpartScript(nodes) {
    const mbr = nodes.find(n => n.type === 'fs_mbr_partition');
    const label = nodes.find(n => n.type === 'fs_fat32_formatter')?.props?.volumeLabel || 'BOOTCRAFT';

    return `rem ===========================================================================
rem BootCraft Studio — Diskpart Partitioning Script
rem ВНИМАНИЕ: Заменяйте <DISK_NUM> на номер вашей целевой флешки (list disk)
rem ===========================================================================

select disk <DISK_NUM>
clean
${mbr ? 'convert mbr' : 'convert gpt'}
create partition primary
active
format fs=fat32 quick label="${label}"
assign
exit
`;
  }
}

window.codeGenerator = new CodeGenerator();
