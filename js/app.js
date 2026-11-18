/**
 * BootCraft Studio — Main Application Entry Point
 * Связывает палитру, холст, пресеты, шрифты и экспорт сборки.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация шрифтов
  window.fontManager?.init();

  // 2. Инициализация кастомных блоков
  window.customBlocksManager?.init();

  // 3. Инициализация холста
  window.pipelineCanvas?.init();

  // 4. Отрисовка левой палитры блоков
  renderPalette();

  // 5. Обработка пресетов
  initPresets();

  // 6. Кнопка сбора скриптов / Экспорт
  initExport();

  // 7. Подписка на обновление кастомных блоков
  window.addEventListener('bootcraft:custom_blocks_updated', () => {
    renderPalette();
  });

  // Загружаем пресет по умолчанию (Windows 11 Clean)
  loadPreset('win11-clean');
});

/**
 * Отрисовка палитры блоков в левом сайдбаре
 */
function renderPalette() {
  const container = document.getElementById('palette-list');
  if (!container) return;

  container.innerHTML = '';

  const customBlocks = window.customBlocksManager ? window.customBlocksManager.getCustomBlocks() : [];
  const allBlocks = [...(window.BUILTIN_BLOCKS || []), ...customBlocks];

  (window.BLOCK_CATEGORIES || []).forEach(cat => {
    const blocksInCat = allBlocks.filter(b => b.category === cat.id);
    if (blocksInCat.length === 0) return;

    const groupEl = document.createElement('div');
    groupEl.className = 'palette-group';

    const titleEl = document.createElement('div');
    titleEl.className = 'palette-group-title';
    titleEl.innerText = cat.name;
    groupEl.appendChild(titleEl);

    blocksInCat.forEach(block => {
      const itemEl = document.createElement('div');
      itemEl.className = 'palette-item';
      itemEl.innerHTML = `
        <div class="palette-item-icon">${block.icon}</div>
        <div class="palette-item-text">
          <div class="palette-item-name">${block.name}</div>
          <div class="palette-item-desc">${block.desc}</div>
        </div>
      `;

      itemEl.addEventListener('click', () => {
        window.pipelineCanvas?.addNode(block);
      });

      groupEl.appendChild(itemEl);
    });

    container.appendChild(groupEl);
  });
}

/**
 * Инициализация быстрых пресетов
 */
function initPresets() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.getAttribute('data-preset');
      loadPreset(presetId);
    });
  });
}

function loadPreset(presetId) {
  if (!window.pipelineCanvas) return;
  window.pipelineCanvas.clear();

  const findBlock = (type) => (window.BUILTIN_BLOCKS || []).find(b => b.type === type);

  switch (presetId) {
    case 'win11-clean': {
      const b1 = findBlock('profile_windows');
      const b2 = findBlock('win_bypass_requirements');
      const b3 = findBlock('win_local_user');
      const b4 = findBlock('win_debloat_tweaks');
      const b5 = findBlock('win_driver_injection');
      [b1, b2, b3, b4, b5].forEach(b => b && window.pipelineCanvas.addNode(b));
      break;
    }
    case 'retro-fat32': {
      const b1 = findBlock('profile_retro_audio');
      const b2 = findBlock('fs_mbr_partition');
      const b3 = findBlock('fs_fat32_formatter');
      const b4 = findBlock('audio_cbr_converter');
      const b5 = findBlock('audio_fat_sorter');
      const b6 = findBlock('audio_id3_cleaner');
      [b1, b2, b3, b4, b5, b6].forEach(b => b && window.pipelineCanvas.addNode(b));
      break;
    }
    case 'live-media': {
      const b1 = findBlock('profile_live_media');
      const b2 = findBlock('fs_mbr_partition');
      const b3 = findBlock('fs_fat32_formatter');
      [b1, b2, b3].forEach(b => b && window.pipelineCanvas.addNode(b));
      break;
    }
    case 'hybrid-usb': {
      const b1 = findBlock('profile_windows');
      const b2 = findBlock('profile_retro_audio');
      const b3 = findBlock('fs_mbr_partition');
      const b4 = findBlock('fs_fat32_formatter');
      const b5 = findBlock('win_bypass_requirements');
      const b6 = findBlock('audio_fat_sorter');
      [b1, b2, b3, b4, b5, b6].forEach(b => b && window.pipelineCanvas.addNode(b));
      break;
    }
  }
}

/**
 * Скачивание сгенерированного файла
 */
function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Экспорт всех сгенерированных скриптов
 */
function initExport() {
  const exportBtn = document.getElementById('btn-export-bundle');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    if (!window.pipelineCanvas || !window.codeGenerator) return;

    const nodes = window.pipelineCanvas.nodes;
    if (nodes.length === 0) {
      alert('Добавьте хотя бы один блок на холст перед экспортом.');
      return;
    }

    // Переключаем на вкладку предпросмотра кода
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.inspector-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="code-preview"]')?.classList.add('active');
    document.getElementById('tab-code-preview')?.classList.add('active');

    // Определяем текущий выбранный файл и предлагаем его скачать
    const target = document.getElementById('code-target-select')?.value || 'autounattend';
    const filenames = {
      autounattend: 'autounattend.xml',
      format_script: 'format_fat32.ps1',
      setup_complete: 'SetupComplete.cmd',
      fat_sorter: 'sort_tracks.py',
      diskpart_script: 'diskpart_config.txt'
    };

    const fname = filenames[target] || 'script.txt';
    const content = window.codeGenerator.generate(nodes, target);
    downloadFile(fname, content);
  });
}
