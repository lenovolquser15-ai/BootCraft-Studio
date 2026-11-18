/**
 * BootCraft Studio — Typography & Fonts Engine
 * Управляет обширной палитрой шрифтов и динамическим переключением интерфейса.
 */

const AVAILABLE_FONTS = [
  { id: 'jetbrains-mono', name: 'JetBrains Mono (Терминал / Код)', family: "'JetBrains Mono', monospace" },
  { id: 'fira-code', name: 'Fira Code (Лигатуры)', family: "'Fira Code', monospace" },
  { id: 'orbitron', name: 'Orbitron (Sci-Fi / Киберпанк)', family: "'Orbitron', sans-serif" },
  { id: 'rajdhani', name: 'Rajdhani (Tech HUD)', family: "'Rajdhani', sans-serif" },
  { id: 'press-start-2p', name: 'Press Start 2P (Ретро 8-бит)', family: "'Press Start 2P', monospace" },
  { id: 'vt323', name: 'VT323 (Винтажный ЭЛТ-монитор)', family: "'VT323', monospace" },
  { id: 'share-tech-mono', name: 'Share Tech Mono (Хакерский)', family: "'Share Tech Mono', monospace" },
  { id: 'russo-one', name: 'Russo One (Плотный плакатный)', family: "'Russo One', sans-serif" },
  { id: 'syne', name: 'Syne (Футуристический брутализм)', family: "'Syne', sans-serif" },
  { id: 'inter', name: 'Inter (Современный плоский интерфейс)', family: "'Inter', sans-serif" }
];

class FontManager {
  constructor() {
    this.storageKey = 'bootcraft_selected_font';
    this.selectEl = document.getElementById('font-selector');
  }

  init() {
    if (!this.selectEl) return;

    // Заполнение выпадающего списка шрифтов
    this.selectEl.innerHTML = '';
    AVAILABLE_FONTS.forEach(font => {
      const option = document.createElement('option');
      option.value = font.id;
      option.textContent = font.name;
      this.selectEl.appendChild(option);
    });

    // Восстановление сохраненного шрифта
    const savedFontId = localStorage.getItem(this.storageKey) || 'jetbrains-mono';
    this.applyFont(savedFontId);
    this.selectEl.value = savedFontId;

    // Слушатель изменения
    this.selectEl.addEventListener('change', (e) => {
      this.applyFont(e.target.value);
    });
  }

  applyFont(fontId) {
    const font = AVAILABLE_FONTS.find(f => f.id === fontId) || AVAILABLE_FONTS[0];
    document.documentElement.style.setProperty('--ui-font', font.family);
    localStorage.setItem(this.storageKey, font.id);
  }
}

// Экспортируем глобальный экземпляр
window.fontManager = new FontManager();
