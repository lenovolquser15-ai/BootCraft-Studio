/**
 * BootCraft Studio — Pipeline Canvas & Inspector Controller
 * Управляет отображением блоков на холсте, их свойствами и взаимодействием.
 */

class PipelineCanvas {
  constructor() {
    this.nodes = [];
    this.selectedNodeId = null;

    // DOM элементы
    this.canvasContainer = document.getElementById('pipeline-canvas');
    this.emptyState = document.getElementById('canvas-empty-state');
    this.statusText = document.getElementById('pipeline-status-text');
    this.propertiesForm = document.getElementById('block-properties-form');
    this.codeOutput = document.getElementById('code-output');
    this.codeTargetSelect = document.getElementById('code-target-select');
    this.copyCodeBtn = document.getElementById('btn-copy-code');

    // Зум
    this.zoomLevel = 1;
    this.scrollContainer = document.getElementById('canvas-scroll-container');
  }

  init() {
    // Слушатель изменения целевого файла для генерации
    this.codeTargetSelect?.addEventListener('change', () => this.refreshCodeView());

    // Копирование кода
    this.copyCodeBtn?.addEventListener('click', () => {
      const text = this.codeOutput?.innerText || '';
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = this.copyCodeBtn.innerText;
        this.copyCodeBtn.innerText = '✅ Скопировано!';
        setTimeout(() => this.copyCodeBtn.innerText = originalText, 1800);
      });
    });

    // Зум контролы
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.setZoom(this.zoomLevel + 0.1));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.setZoom(this.zoomLevel - 0.1));
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => this.setZoom(1));

    // Очистка холста
    document.getElementById('btn-clear-canvas')?.addEventListener('click', () => {
      if (confirm('Очистить весь холст?')) {
        this.clear();
      }
    });

    // Переключение вкладок инспектора
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.inspector-tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabId = 'tab-' + btn.getAttribute('data-tab');
        document.getElementById(tabId)?.classList.add('active');
      });
    });
  }

  setZoom(val) {
    this.zoomLevel = Math.min(Math.max(val, 0.6), 1.5);
    if (this.canvasContainer) {
      this.canvasContainer.style.transform = `scale(${this.zoomLevel})`;
      this.canvasContainer.style.transformOrigin = 'top center';
    }
    const resetBtn = document.getElementById('btn-zoom-reset');
    if (resetBtn) resetBtn.innerText = `${Math.round(this.zoomLevel * 100)}%`;
  }

  addNode(blockDef) {
    const newNode = {
      id: 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: blockDef.type,
      name: blockDef.name,
      icon: blockDef.icon,
      category: blockDef.category,
      desc: blockDef.desc,
      fields: blockDef.fields || [],
      props: JSON.parse(JSON.stringify(blockDef.defaultProps || {})),
      isCustom: !!blockDef.isCustom,
      target: blockDef.target || 'setup_complete'
    };

    this.nodes.push(newNode);
    this.renderCanvas();
    this.selectNode(newNode.id);
    this.updateStatus();
    this.refreshCodeView();
  }

  removeNode(nodeId) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
      this.renderProperties();
    }
    this.renderCanvas();
    this.updateStatus();
    this.refreshCodeView();
  }

  moveNode(nodeId, direction) {
    const idx = this.nodes.findIndex(n => n.id === nodeId);
    if (idx < 0) return;

    if (direction === 'up' && idx > 0) {
      const temp = this.nodes[idx];
      this.nodes[idx] = this.nodes[idx - 1];
      this.nodes[idx - 1] = temp;
    } else if (direction === 'down' && idx < this.nodes.length - 1) {
      const temp = this.nodes[idx];
      this.nodes[idx] = this.nodes[idx + 1];
      this.nodes[idx + 1] = temp;
    }

    this.renderCanvas();
    this.refreshCodeView();
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    document.querySelectorAll('.pipeline-node').forEach(el => {
      el.classList.toggle('selected', el.getAttribute('data-id') === nodeId);
    });
    this.renderProperties();
  }

  clear() {
    this.nodes = [];
    this.selectedNodeId = null;
    this.renderCanvas();
    this.renderProperties();
    this.updateStatus();
    this.refreshCodeView();
  }

  updateStatus() {
    if (this.statusText) {
      this.statusText.innerText = `Конфигурация активна • Блоков: ${this.nodes.length}`;
    }
  }

  renderCanvas() {
    if (!this.canvasContainer) return;

    // Очистка всех блоков кроме emptyState
    const currentNodes = this.canvasContainer.querySelectorAll('.pipeline-node');
    currentNodes.forEach(el => el.remove());

    if (this.nodes.length === 0) {
      if (this.emptyState) this.emptyState.style.display = 'flex';
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';

    this.nodes.forEach((node, index) => {
      const nodeEl = document.createElement('div');
      nodeEl.className = 'pipeline-node' + (this.selectedNodeId === node.id ? ' selected' : '');
      nodeEl.setAttribute('data-id', node.id);

      nodeEl.innerHTML = `
        <div class="node-drag-handle">⋮⋮</div>
        <div class="node-icon-wrap">${node.icon}</div>
        <div class="node-info">
          <div class="node-category-tag">${node.category}</div>
          <div class="node-title">${node.name}</div>
          <div class="node-summary">${node.desc}</div>
        </div>
        <div class="node-actions">
          <button class="node-btn move-up" title="Поднять выше">▲</button>
          <button class="node-btn move-down" title="Опустить ниже">▼</button>
          <button class="node-btn delete-btn" title="Удалить блок">✕</button>
        </div>
      `;

      // Клики
      nodeEl.addEventListener('click', (e) => {
        if (!e.target.closest('.node-actions')) {
          this.selectNode(node.id);
        }
      });

      nodeEl.querySelector('.move-up')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveNode(node.id, 'up');
      });

      nodeEl.querySelector('.move-down')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveNode(node.id, 'down');
      });

      nodeEl.querySelector('.delete-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeNode(node.id);
      });

      this.canvasContainer.appendChild(nodeEl);
    });
  }

  renderProperties() {
    if (!this.propertiesForm) return;

    const node = this.nodes.find(n => n.id === this.selectedNodeId);
    if (!node) {
      this.propertiesForm.innerHTML = `
        <div class="properties-placeholder">
          <p>Выберите блок на холсте для настройки параметров</p>
        </div>
      `;
      return;
    }

    let html = `
      <div style="margin-bottom: 16px;">
        <span class="node-category-tag">${node.category}</span>
        <h4 style="font-size: 14px; margin-top: 4px; color: var(--accent-cyan);">${node.icon} ${node.name}</h4>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${node.desc}</p>
      </div>
      <hr style="border: 0; border-top: 1px solid var(--border-subtle); margin-bottom: 16px;">
    `;

    if (!node.fields || node.fields.length === 0) {
      html += `<p style="color: var(--text-muted); font-size: 12px;">У этого блока нет настраиваемых параметров.</p>`;
    } else {
      node.fields.forEach(field => {
        const val = node.props[field.key] !== undefined ? node.props[field.key] : '';

        if (field.type === 'checkbox') {
          html += `
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" data-key="${field.key}" ${val ? 'checked' : ''}>
                <span>${field.label}</span>
              </label>
            </div>
          `;
        } else if (field.type === 'select') {
          html += `
            <div class="form-group">
              <label>${field.label}</label>
              <select class="select-styled" data-key="${field.key}">
                ${field.options.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt}</option>`).join('')}
              </select>
            </div>
          `;
        } else if (field.type === 'textarea') {
          html += `
            <div class="form-group">
              <label>${field.label}</label>
              <textarea class="textarea-styled" data-key="${field.key}" rows="5">${val}</textarea>
            </div>
          `;
        } else {
          html += `
            <div class="form-group">
              <label>${field.label}</label>
              <input type="text" class="input-styled" data-key="${field.key}" value="${val}">
            </div>
          `;
        }
      });
    }

    this.propertiesForm.innerHTML = html;

    // Слушатели изменения параметров
    this.propertiesForm.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.getAttribute('data-key');
        if (!key) return;
        node.props[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.refreshCodeView();
      });
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        input.addEventListener('input', (e) => {
          const key = e.target.getAttribute('data-key');
          if (!key) return;
          node.props[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          this.refreshCodeView();
        });
      }
    });
  }

  refreshCodeView() {
    if (!this.codeOutput || !window.codeGenerator) return;
    const target = this.codeTargetSelect?.value || 'autounattend';
    const generated = window.codeGenerator.generate(this.nodes, target);
    this.codeOutput.innerText = generated;
  }
}

window.pipelineCanvas = new PipelineCanvas();
