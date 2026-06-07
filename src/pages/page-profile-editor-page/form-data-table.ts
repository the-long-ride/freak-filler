import { StorageService } from '../../services/storage.service';
import { Preset, FormFieldData, PageData, SavedValue } from '../../types';
import { buildQuantityString, generateGuid, getCurrentTimestamp } from '../../utils/helpers';
import { downloadFile, escapeHtml, initTheme, initVersion } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { initIconReplacement } from '../../utils/icon-replacer';
import { showConfirm, showToast, showModal, hideModal } from '../../utils/modal-utils';
import { initGuideOverlays } from '../../utils/guide-overlay';
import { actions, state } from './context';

// Add new form data row
export function addFormDataRow(data?: FormFieldData) {
    const newData: FormFieldData = data || {
        id: generateGuid(),
        type: 'text',
        title: '',
        value: '',
        testId: '',
        querySelector: '',
        fillDelay: 0,
        autoBlur: true,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        order: state.formDataList.length + 1
    };
    state.formDataList.push(newData);
    actions.renderFormDataTable();
    if (!data) {
        state.hasUnsavedPresetChanges = true;
        actions.updateButtonVisibility();
    }
    // Scroll to bottom and highlight new row
    setTimeout(() => {
        const tbody = document.getElementById('formDataBody');
        const newRow = tbody?.querySelector(`tr[data-id="${newData.id}"]`) as HTMLElement;
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}

// Render form data table
export function renderFormDataTable() {
    const tbody = document.getElementById('formDataBody') as HTMLTableSectionElement;
    tbody.innerHTML = '';
    state.formDataList.forEach((data, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', data.id);
        row.setAttribute('draggable', 'true');
        // Generate value cell based on type
        let valueCell = '';
        if (data.type === 'checkbox') {
            const checked = data.value === true || data.value === 'true' ? 'checked' : '';
            valueCell = `<label class="toggle-switch"><input type="checkbox" class="value-checkbox" ${checked} data-id="${data.id}" /><span class="toggle-slider"></span></label>`;
        }
        else if (data.type === 'radio') {
            valueCell = `<input type="text" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" placeholder="Radio value" />`;
        }
        else if (data.type === 'range' || data.type === 'number') {
            valueCell = `<input type="number" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
        }
        else if (data.type === 'color') {
            const colorValue = data.value || '#000000';
            valueCell = `
        <div class="color-input-group">
          <input type="color" class="value-color-picker" value="${escapeHtml(String(colorValue))}" data-id="${data.id}" />
          <input type="text" class="value-color-text" value="${escapeHtml(String(colorValue))}" data-id="${data.id}" placeholder="#000000" />
        </div>`;
        }
        else if (data.type === 'datepicker') {
            valueCell = `<input type="date" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
        }
        else if (data.type === 'htmlEditor') {
            valueCell = `<textarea class="value-input html-editor-value" rows="3" data-id="${data.id}" placeholder="HTML content">${escapeHtml(String(data.value || ''))}</textarea>`;
        }
        else if (data.type === 'dynamicDate') {
            // Parse existing value or use defaults
            let years = 0, months = 0, days = 0;
            try {
                if (data.value) {
                    const parsed = JSON.parse(String(data.value));
                    years = parsed.years || 0;
                    months = parsed.months || 0;
                    days = parsed.days || 0;
                }
            }
            catch (e) {
                // Use defaults if parsing fails
            }
            valueCell = `
        <div class="dynamic-date-group">
          <span class="dynamic-date-label">Current date + </span>
          <input type="number" class="value-dynamic-years" value="${years}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">years</span>
          <input type="number" class="value-dynamic-months" value="${months}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">months</span>
          <input type="number" class="value-dynamic-days" value="${days}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">days</span>
        </div>`;
        }
        else if (data.type === 'clickable') {
            valueCell = `
        <div class="clickable-input-group">
          <span class="clickable-label">wait for</span>
          <input type="number" class="value-clickable-delay" value="${escapeHtml(String(data.value || '0'))}" min="1" max="30000" step="100" data-id="${data.id}" placeholder="0" />
          <span class="clickable-label">(ms) before clicking</span>
        </div>`;
        }
        else {
            valueCell = `<input type="text" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
        }
        row.innerHTML = `
      <td class="order-cell">
        <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
        <span class="order-number">${data.order}</span>
        <div class="order-actions">
          <button class="btn-order-action" data-action="insert" data-id="${data.id}" title="Insert row below">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="btn-order-action" data-action="clone" data-id="${data.id}" title="Clone row below">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="btn-order-action" data-action="move" data-id="${data.id}" title="Move to position">
            <svg 
              width="14" height="14"
              shape-rendering="geometricPrecision" 
              text-rendering="geometricPrecision" 
              image-rendering="optimizeQuality" 
              fill-rule="evenodd" 
              clip-rule="evenodd" 
              viewBox="0 0 320 512.29"
              fill="currentColor"
            >
                <path 
                    fill-rule="nonzero" 
                    d="M51.49 169.41h218.18L163.39 40.96 51.49 169.41zM16.1 310.66h287.79c8.9 0 16.11 7.21 16.11 16.11 0 4.18-1.59 7.98-4.2 10.85L176.1 506.46c-5.66 6.85-15.82 7.8-22.66 2.14l-1.88-1.83L3.96 337.34c-5.84-6.7-5.14-16.88 1.57-22.71a16.09 16.09 0 0 1 10.57-3.97zm253.57 32.22H51.49l111.9 128.45 106.28-128.45zm34.22-141.25H16.1c-3.75 0-7.52-1.31-10.57-3.96-6.71-5.84-7.41-16.01-1.57-22.72L151.55 5.52l1.89-1.83c6.84-5.66 17-4.7 22.66 2.14l139.7 168.84c2.61 2.87 4.2 6.68 4.2 10.85 0 8.9-7.21 16.11-16.11 16.11z"
                />
            </svg>
          </button>
          <button class="btn-order-action btn-share-action" data-id="${data.id}" title="Share row to other presets" data-icons="Share"></button>
        </div>
      </td>
      <td><input type="text" class="title-input" value="${escapeHtml(data.title || '')}" data-id="${data.id}" placeholder="Field title" /></td>
      <td>
        <select class="type-select" data-id="${data.id}">
          <option value="text" ${data.type === 'text' ? 'selected' : ''}>Text</option>
          <option value="search" ${data.type === 'search' ? 'selected' : ''}>Search</option>
          <option value="checkbox" ${data.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
          <option value="dropdown" ${data.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
          <option value="datepicker" ${data.type === 'datepicker' ? 'selected' : ''}>Datepicker</option>
          <option value="radio" ${data.type === 'radio' ? 'selected' : ''}>Radio</option>
          <option value="range" ${data.type === 'range' ? 'selected' : ''}>Range</option>
          <option value="number" ${data.type === 'number' ? 'selected' : ''}>Number</option>
          <option value="color" ${data.type === 'color' ? 'selected' : ''}>Color</option>
          <option value="htmlEditor" ${data.type === 'htmlEditor' ? 'selected' : ''}>HTML Editor</option>
          <option value="dynamicDate" ${data.type === 'dynamicDate' ? 'selected' : ''}>Dynamic Date</option>
          <option value="clickable" ${data.type === 'clickable' ? 'selected' : ''}>Click on</option>
        </select>
      </td>
      <td class="value-cell">${valueCell}</td>
      <td><input type="text" class="testid-input" value="${escapeHtml(data.testId || '')}" data-id="${data.id}" placeholder="data-testid" /></td>
      <td><input type="text" class="querySelector-input" value="${escapeHtml(data.querySelector || '')}" data-id="${data.id}" placeholder="CSS selector" /></td>
      <td><input type="number" class="delay-input" value="${data.fillDelay || 0}" min="0" max="30000" step="100" data-id="${data.id}" placeholder="0" /></td>
      <td><button class="action-btn action-btn--delete" data-id="${data.id}" title="Delete row" data-icons="Trash"></button></td>
    `;
        // Add drag events
        row.addEventListener('dragstart', actions.handleDragStart);
        row.addEventListener('dragover', actions.handleDragOver);
        row.addEventListener('drop', actions.handleDrop);
        row.addEventListener('dragend', actions.handleDragEnd);
        tbody.appendChild(row);
    });
    // Add event listeners
    actions.addTableEventListeners();
    // Update form data count
    const formDataCountEl = document.getElementById('formDataCount');
    if (formDataCountEl) {
        formDataCountEl.textContent = buildQuantityString(state.formDataList.length);
    }
}

// Add event listeners to table inputs
export function addTableEventListeners() {
    document.querySelectorAll('.title-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = (e.target as HTMLInputElement).value;
            actions.updateFormData(id!, { title: value });
        });
    });
    document.querySelectorAll('.type-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = (e.target as HTMLSelectElement).value as FormFieldData['type'];
            actions.updateFormData(id!, { type: value });
            actions.renderFormDataTable(); // Re-render to show correct value input
        });
    });
    document.querySelectorAll('.value-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = (e.target as HTMLInputElement).value;
            actions.updateFormData(id!, { value: value });
        });
    });
    document.querySelectorAll('.value-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = (e.target as HTMLInputElement).checked;
            actions.updateFormData(id!, { value: value });
        });
    });
    // Color picker input synchronization
    document.querySelectorAll('.value-color-picker').forEach(picker => {
        picker.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = (e.target as HTMLInputElement).value;
            // Update the corresponding text input
            const textInput = document.querySelector(`.value-color-text[data-id="${id}"]`) as HTMLInputElement;
            if (textInput) {
                textInput.value = value;
            }
            actions.updateFormData(id!, { value: value });
        });
    });
    // Clickable delay input
    document.querySelectorAll('.value-clickable-delay').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = parseInt((e.target as HTMLInputElement).value) || 0;
            actions.updateFormData(id!, { value: value });
        });
    });
    // Color text input synchronization
    document.querySelectorAll('.value-color-text').forEach(textInput => {
        textInput.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            let value = (e.target as HTMLInputElement).value.trim();
            // Add # prefix if not present and value looks like a hex color
            if (value && !value.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(value)) {
                value = '#' + value;
                (e.target as HTMLInputElement).value = value;
            }
            // Update the corresponding color picker if valid hex color
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                const colorPicker = document.querySelector(`.value-color-picker[data-id="${id}"]`) as HTMLInputElement;
                if (colorPicker) {
                    colorPicker.value = value;
                }
                actions.updateFormData(id!, { value: value });
            }
        });
    });
    document.querySelectorAll('.testid-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = (e.target as HTMLInputElement).value;
            actions.updateFormData(id!, { testId: value });
        });
    });
    document.querySelectorAll('.querySelector-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = (e.target as HTMLInputElement).value;
            actions.updateFormData(id!, { querySelector: value });
        });
    });
    document.querySelectorAll('.delay-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            const value = parseInt((e.target as HTMLInputElement).value) || 0;
            actions.updateFormData(id!, { fillDelay: Math.min(value, 30000) });
        });
    });
    // Dynamic date input event listeners
    const updateDynamicDateValue = (id: string) => {
        const yearsInput = document.querySelector(`.value-dynamic-years[data-id="${id}"]`) as HTMLInputElement;
        const monthsInput = document.querySelector(`.value-dynamic-months[data-id="${id}"]`) as HTMLInputElement;
        const daysInput = document.querySelector(`.value-dynamic-days[data-id="${id}"]`) as HTMLInputElement;
        if (yearsInput && monthsInput && daysInput) {
            const years = parseInt(yearsInput.value) || 0;
            const months = parseInt(monthsInput.value) || 0;
            const days = parseInt(daysInput.value) || 0;
            const value = JSON.stringify({ years, months, days });
            actions.updateFormData(id, { value });
        }
    };
    document.querySelectorAll('.value-dynamic-years, .value-dynamic-months, .value-dynamic-days').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = (e.target as HTMLElement).getAttribute('data-id');
            if (id)
                updateDynamicDateValue(id);
        });
    });
    document.querySelectorAll('.action-btn--delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
            actions.deleteFormDataRow(id!);
        });
    });
    document.querySelectorAll('.btn-order-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const id = target.getAttribute('data-id');
            const action = target.getAttribute('data-action');
            if (action === 'insert') {
                actions.insertRowBelow(id!);
            }
            else if (action === 'clone') {
                actions.cloneRowBelow(id!);
            }
            else if (action === 'move') {
                actions.moveRowToPosition(id!);
            }
        });
    });
    // Share action (clone to selected presets)
    document.querySelectorAll('.btn-share-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
            if (id)
                actions.openShareRowModal(id);
        });
    });
}
