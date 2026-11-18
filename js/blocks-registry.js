/**
 * BootCraft Studio — Blocks Registry
 * Реестр встроенных блоков для моделирования кастомных сборок флешек.
 */

const BLOCK_CATEGORIES = [
  { id: 'profiles', name: 'Профили назначения' },
  { id: 'disk_fs', name: 'Диск и Файловая система' },
  { id: 'windows_unattended', name: 'Windows Автоустановка' },
  { id: 'audio_ops', name: 'Аудио для муз. центров' },
  { id: 'scripts_ext', name: 'Скрипты и твики' }
];

const BUILTIN_BLOCKS = [
  // ── Профили ─────────────────────────────────────────────────────────────
  {
    type: 'profile_windows',
    category: 'profiles',
    name: 'Инсталлятор Windows 11/10',
    icon: '💿',
    desc: 'Базовая цель: подготовка автономного установщика Windows',
    defaultProps: {
      version: 'Windows 11 Pro',
      architecture: 'x64',
      language: 'ru-RU'
    },
    fields: [
      { key: 'version', label: 'Редакция ОС', type: 'select', options: ['Windows 11 Pro', 'Windows 11 Home', 'Windows 10 Pro', 'Windows 10 Home'] },
      { key: 'architecture', label: 'Архитектура', type: 'select', options: ['x64', 'ARM64'] },
      { key: 'language', label: 'Язык интерфейса', type: 'select', options: ['ru-RU', 'en-US'] }
    ]
  },
  {
    type: 'profile_retro_audio',
    category: 'profiles',
    name: 'Музыкальный центр / Автомагнитола',
    icon: '📻',
    desc: 'Базовая цель: флешка для старых аудиосистем с FAT32 и сортировкой',
    defaultProps: {
      deviceProfile: 'Старый муз. центр / Автомагнитола (USB 1.1 - 2.0)',
      targetFolder: 'Music'
    },
    fields: [
      { key: 'deviceProfile', label: 'Тип аудиоустройства', type: 'select', options: ['Старый муз. центр / Автомагнитола (USB 1.1 - 2.0)', 'DVD/Blu-ray проигрыватель', 'Ретро-консоль (PS2, Xbox 360)'] },
      { key: 'targetFolder', label: 'Корневая папка музыки', type: 'text' }
    ]
  },
  {
    type: 'profile_live_media',
    category: 'profiles',
    name: 'Live Медиаплеер USB',
    icon: '🎬',
    desc: 'Автономная среда воспроизведения видео и звука без установки ОС',
    defaultProps: {
      playerEngine: 'MPV Standalone Live',
      autoPlayOnBoot: true
    },
    fields: [
      { key: 'playerEngine', label: 'Медиа-движок', type: 'select', options: ['MPV Standalone Live', 'Kodi Media Center'] },
      { key: 'autoPlayOnBoot', label: 'Автозапуск при загрузке ПК', type: 'checkbox' }
    ]
  },

  // ── Диск и Файловая система ─────────────────────────────────────────────
  {
    type: 'fs_mbr_partition',
    category: 'disk_fs',
    name: 'Разметка MBR (Legacy)',
    icon: '💾',
    desc: 'Таблица разделов MBR для совместимости с древней электроникой',
    defaultProps: {
      activePartition: true,
      wipeDisk: true
    },
    fields: [
      { key: 'activePartition', label: 'Сделать раздел активным (Bootable)', type: 'checkbox' },
      { key: 'wipeDisk', label: 'Полная очистка диска перед разметкой (Clean)', type: 'checkbox' }
    ]
  },
  {
    type: 'fs_fat32_formatter',
    category: 'disk_fs',
    name: 'Форматтер FAT32 (>32GB Bypass)',
    icon: '⚡',
    desc: 'Обход лимита Windows 32 ГБ: поддержка флешек 64 ГБ - 512 ГБ в FAT32',
    defaultProps: {
      clusterSize: '32K',
      volumeLabel: 'AUDIO_USB'
    },
    fields: [
      { key: 'clusterSize', label: 'Размер кластера (16K/32K рекомендуются)', type: 'select', options: ['32K', '16K', '64K', '8K'] },
      { key: 'volumeLabel', label: 'Метка тома (только латиница)', type: 'text' }
    ]
  },

  // ── Windows Автоустановка ──────────────────────────────────────────────
  {
    type: 'win_bypass_requirements',
    category: 'windows_unattended',
    name: 'Обход требований Windows 11',
    icon: '🛡️',
    desc: 'Снятие ограничений по TPM 2.0, Secure Boot, RAM и процессору',
    defaultProps: {
      bypassTPM: true,
      bypassSecureBoot: true,
      bypassRAM: true,
      bypassCPU: true
    },
    fields: [
      { key: 'bypassTPM', label: 'Обход TPM 2.0 Check', type: 'checkbox' },
      { key: 'bypassSecureBoot', label: 'Обход проверки Secure Boot', type: 'checkbox' },
      { key: 'bypassRAM', label: 'Обход лимита 4 ГБ ОЗУ', type: 'checkbox' },
      { key: 'bypassCPU', label: 'Обход черного списка процессоров', type: 'checkbox' }
    ]
  },
  {
    type: 'win_local_user',
    category: 'windows_unattended',
    name: 'Локальный пользователь (Без MS)',
    icon: '👤',
    desc: 'Создание локального администратора без входа в учетную запись Microsoft',
    defaultProps: {
      username: 'User',
      password: '',
      autoLogon: true
    },
    fields: [
      { key: 'username', label: 'Имя локального пользователя', type: 'text' },
      { key: 'password', label: 'Пароль (пусто = без пароля)', type: 'text' },
      { key: 'autoLogon', label: 'Автоматический вход в систему', type: 'checkbox' }
    ]
  },
  {
    type: 'win_driver_injection',
    category: 'windows_unattended',
    name: 'Интеграция драйверов (DISM)',
    icon: '🔌',
    desc: 'Вшивание драйверов Intel VMD/RST, Wi-Fi и сети в boot.wim / install.wim',
    defaultProps: {
      driverFolder: 'C:\\BootCraft\\Drivers',
      recurse: true
    },
    fields: [
      { key: 'driverFolder', label: 'Папка с .inf драйверами на ПК', type: 'text' },
      { key: 'recurse', label: 'Рекурсивный поиск драйверов в подпапках', type: 'checkbox' }
    ]
  },
  {
    type: 'win_debloat_tweaks',
    category: 'windows_unattended',
    name: 'Отключение телеметрии и твики',
    icon: '🚀',
    desc: 'Выключение фонового сбора данных, рекламы, Кортаны и ненужных служб',
    defaultProps: {
      disableTelemetry: true,
      disableCortana: true,
      disableWebSearchInStart: true,
      enableClassicContextMenu: true
    },
    fields: [
      { key: 'disableTelemetry', label: 'Отключить диагностические данные', type: 'checkbox' },
      { key: 'disableCortana', label: 'Отключить Cortana', type: 'checkbox' },
      { key: 'disableWebSearchInStart', label: 'Убрать поиск в Bing из пуска', type: 'checkbox' },
      { key: 'enableClassicContextMenu', label: 'Классическое контекстное меню Win10', type: 'checkbox' }
    ]
  },

  // ── Аудио для муз. центров ──────────────────────────────────────────────
  {
    type: 'audio_fat_sorter',
    category: 'audio_ops',
    name: 'FAT Directory Table Sorter',
    icon: '🎵',
    desc: 'Физическая сортировка файлов в таблице FAT32 для строгого порядка треков',
    defaultProps: {
      sortBy: 'Alphabetical and Track Numbers (01, 02...)',
      recursiveFolders: true
    },
    fields: [
      { key: 'sortBy', label: 'Критерий сортировки', type: 'select', options: ['Alphabetical and Track Numbers (01, 02...)', 'Album / Track Tag'] },
      { key: 'recursiveFolders', label: 'Сортировать все вложенные папки', type: 'checkbox' }
    ]
  },
  {
    type: 'audio_cbr_converter',
    category: 'audio_ops',
    name: 'Нормализация аудио (MP3 CBR)',
    icon: '🎛️',
    desc: 'Конвертация треков в совместимый формат MP3 320/256 kbps (44.1 kHz)',
    defaultProps: {
      bitrate: '320k',
      sampleRate: '44100'
    },
    fields: [
      { key: 'bitrate', label: 'Битрейт MP3 CBR', type: 'select', options: ['320k', '256k', '192k'] },
      { key: 'sampleRate', label: 'Частота дискретизации (Hz)', type: 'select', options: ['44100', '48000'] }
    ]
  },
  {
    type: 'audio_id3_cleaner',
    category: 'audio_ops',
    name: 'Очистка тегов (ID3v2.3 / ID3v1)',
    icon: '🏷️',
    desc: 'Удаление несовместимых тегов и спецсимволов, ломающих старые дисплеи',
    defaultProps: {
      tagVersion: 'ID3v2.3 UTF-16 / ASCII',
      stripAlbumArt: true
    },
    fields: [
      { key: 'tagVersion', label: 'Целевая версия тегов', type: 'select', options: ['ID3v2.3 UTF-16 / ASCII', 'ID3v1 Only'] },
      { key: 'stripAlbumArt', label: 'Удалять встроенные обложки (ускоряет чтение флешки)', type: 'checkbox' }
    ]
  },

  // ── Скрипты и твики ─────────────────────────────────────────────────────
  {
    type: 'script_custom_ps1',
    category: 'scripts_ext',
    name: 'Пользовательский PowerShell-скрипт',
    icon: '💻',
    desc: 'Выполнение произвольных команд PowerShell при создании или установке',
    defaultProps: {
      scriptContent: 'Write-Host "BootCraft: Настройка завершена" -ForegroundColor Cyan'
    },
    fields: [
      { key: 'scriptContent', label: 'Текст скрипта PowerShell', type: 'textarea' }
    ]
  }
];

// Экспорт в глобальную область
window.BLOCK_CATEGORIES = BLOCK_CATEGORIES;
window.BUILTIN_BLOCKS = BUILTIN_BLOCKS;
