/**
 * BootCraft Studio — Custom Blocks Engine
 * Позволяет пользователям создавать, сохранять и редактировать собственные блоки.
 */

class CustomBlocksManager {
  constructor() {
    this.storageKey = 'bootcraft_custom_blocks';
    this.modalEl = document.getElementById('custom-block-modal');
    this.openBtn = document.getElementById('btn-open-custom-block');
    this.closeBtn = document.getElementById('btn-close-modal');
    this.cancelBtn = document.getElementById('btn-cancel-custom-block');
    this.saveBtn = document.getElementById('btn-save-custom-block');

    // Поля формы
    this.inputName = document.getElementById('cb-name');
    this.inputCategory = document.getElementById('cb-category');
    this.inputIcon = document.getElementById('cb-icon');
    this.inputDesc = document.getElementById('cb-desc');
    this.inputTarget = document.getElementById('cb-target');
    this.inputCode = document.getElementById('cb-code');
  }

  init() {
    if (!this.modalEl) return;

    this.openBtn?.addEventListener('click', () => this.openModal());
    this.closeBtn?.addEventListener('click', () => this.closeModal());
    this.cancelBtn?.addEventListener('click', () => this.closeModal());
    this.saveBtn?.addEventListener('click', () => this.saveBlock());

    // Закрытие по клику вне окна
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.closeModal();
    });
  }

  getCustomBlocks() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Ошибка загрузки кастомных блоков:', e);
      return [];
    }
  }

  openModal() {
    // Сброс значений
    this.inputName.value = '';
    this.inputDesc.value = '';
    this.inputIcon.value = '⚙️';
    this.inputCode.value = '';
    this.modalEl.classList.remove('hidden');
    this.inputName.focus();
  }

  closeModal() {
    this.modalEl.classList.add('hidden');
  }

  saveBlock() {
    const name = this.inputName.value.trim();
    if (!name) {
      alert('Пожалуйста, введите название блока');
      return;
    }

    const newBlock = {
      type: 'custom_' + Date.now(),
      category: this.inputCategory.value,
      name: name,
      icon: this.inputIcon.value.trim() || '⚙️',
      desc: this.inputDesc.value.trim() || 'Пользовательский блок',
      isCustom: true,
      target: this.inputTarget.value,
      defaultProps: {
        customScript: this.inputCode.value
      },
      fields: [
        { key: 'customScript', label: 'Пользовательский скрипт', type: 'textarea' }
      ]
    };

    const existing = this.getCustomBlocks();
    existing.push(newBlock);
    localStorage.setItem(this.storageKey, JSON.stringify(existing));

    this.closeModal();

    // Обновляем палитру через событие
    window.dispatchEvent(new CustomEvent('bootcraft:custom_blocks_updated'));
  }
}

window.customBlocksManager = new CustomBlocksManager();
