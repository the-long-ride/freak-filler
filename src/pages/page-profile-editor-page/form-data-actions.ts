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

// Update form data
export function updateFormData(id: string, updates: Partial<FormFieldData>) {
    const index = state.formDataList.findIndex(f => f.id === id);
    if (index !== -1) {
        state.formDataList[index] = {
            ...state.formDataList[index],
            ...updates,
            updatedAt: getCurrentTimestamp()
        };
        state.hasUnsavedPresetChanges = true;
        actions.updatePresetButtons();
    }
}

// Delete form data row
export function deleteFormDataRow(id: string) {
    state.formDataList = state.formDataList.filter(f => f.id !== id);
    actions.reorderFormData();
    actions.renderFormDataTable();
    state.hasUnsavedPresetChanges = true;
    actions.updatePresetButtons();
}

// Reset form data to original state
export function resetFormData() {
    state.formDataList = JSON.parse(JSON.stringify(state.originalFormDataList));
    state.hasUnsavedPresetChanges = false;
    actions.updatePresetButtons();
    // Reload UI
    (document.getElementById('presetName') as HTMLInputElement).value = state.currentPreset?.name || '';
    (document.getElementById('presetDescription') as HTMLTextAreaElement).value = state.currentPreset?.description || '';
    actions.renderFormDataTable();
}

// Update button visibility based on unsaved changes
export function updateButtonVisibility() {
    actions.updatePresetButtons();
    actions.updateSavedValuesButtons();
}

// Insert new row below
export function insertRowBelow(id: string) {
    const index = state.formDataList.findIndex(f => f.id === id);
    if (index === -1)
        return;
    const newData: FormFieldData = {
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
        order: index + 2
    };
    state.formDataList.splice(index + 1, 0, newData);
    actions.reorderFormData();
    actions.renderFormDataTable();
    state.hasUnsavedPresetChanges = true;
    actions.updateButtonVisibility();
    // Highlight new row
    setTimeout(() => {
        const newRow = document.querySelector(`tr[data-id="${newData.id}"]`) as HTMLElement;
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}

// Clone row below
export function cloneRowBelow(id: string) {
    const index = state.formDataList.findIndex(f => f.id === id);
    if (index === -1)
        return;
    const sourceData = state.formDataList[index];
    const clonedData: FormFieldData = {
        ...sourceData,
        id: generateGuid(),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        order: index + 2
    };
    state.formDataList.splice(index + 1, 0, clonedData);
    actions.reorderFormData();
    actions.renderFormDataTable();
    state.hasUnsavedPresetChanges = true;
    actions.updateButtonVisibility();
    // Highlight cloned row
    setTimeout(() => {
        const newRow = document.querySelector(`tr[data-id="${clonedData.id}"]`) as HTMLElement;
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}

// Move row to specified position
export function moveRowToPosition(id: string) {
    const currentIndex = state.formDataList.findIndex(f => f.id === id);
    if (currentIndex === -1)
        return;
    const body = `
    <div class="modal-body">
      <p>Enter the new position for this row (1 to ${state.formDataList.length}):</p>
      <input class="modal-input" type="number" id="movePositionInput" min="1" max="${state.formDataList.length}" value="${currentIndex + 1}" />
      <div class="modal-actions">
        <button id="moveCancelBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="moveConfirmBtn" class="cyber-btn">
          Move
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Move row to new position', body, () => { });
    document.getElementById('moveCancelBtn')?.addEventListener('click', () => hideModal());
    document.getElementById('moveConfirmBtn')?.addEventListener('click', () => {
        const inputEl = document.getElementById('movePositionInput') as HTMLInputElement;
        const newPos = parseInt(inputEl.value);
        if (isNaN(newPos) || newPos < 1 || newPos > state.formDataList.length) {
            showToast('Invalid position', 'error');
            return;
        }
        // Move the item
        const item = state.formDataList.splice(currentIndex, 1)[0];
        state.formDataList.splice(newPos - 1, 0, item);
        actions.reorderFormData();
        actions.renderFormDataTable();
        state.hasUnsavedPresetChanges = true;
        actions.updatePresetButtons();
        hideModal();
    });
}

// Open modal to select target presets and share (clone) a row into them
export async function openShareRowModal(rowId: string) {
    const sourceField = state.formDataList.find(f => f.id === rowId);
    if (!sourceField) {
        showToast('Field not found', 'error');
        return;
    }
    try {
        const data = await StorageService.getData();
        const allPresets = data?.presets ?? [];
        // Exclude current preset
        const targets = allPresets.filter(p => p.id !== state.currentPresetId);
        if (targets.length === 0) {
            showToast('No other presets available to share to', 'info');
            return;
        }
        const itemsHtml = targets.map(p => {
            const fieldsCount = (p.formData || []).length;
            return `
        <label class="modal-list-item">
          <input type="checkbox" class="share-preset-checkbox" value="${p.id}" />
          <div class="meta">
            <div class="title">${escapeHtml(p.name || '(Untitled)')}</div>
            <div class="subtitle">${escapeHtml(p.description || '')}</div>
            <div class="subtitle">Fields: ${fieldsCount}</div>
          </div>
        </label>
      `;
        }).join('');
        const body = `
      <div class="modal-body">
        <div class="modal-selection-counter">Selected: 0 / ${targets.length}</div>
        <div class="modal-list">${itemsHtml}</div>
        <div class="modal-actions">
          <button id="shareCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel<span class="cyber-btn__glitch"></span></button>
          <button id="shareConfirmBtn" class="cyber-btn">Confirm<span class="cyber-btn__glitch"></span></button>
        </div>
      </div>
    `;
        showModal('Share Field To Presets', body, () => { });
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.share-preset-checkbox:checked').length;
            const totalCount = targets.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.share-preset-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        document.getElementById('shareCancelBtn')?.addEventListener('click', () => hideModal());
        document.getElementById('shareConfirmBtn')?.addEventListener('click', async () => {
            const selected: string[] = [];
            document.querySelectorAll('.share-preset-checkbox:checked').forEach(cb => selected.push((cb as HTMLInputElement).value));
            if (selected.length === 0) {
                showToast('Please choose at least one preset', 'warning');
                return;
            }
            try {
                for (const presetId of selected) {
                    const preset = await StorageService.getPresetById(presetId);
                    if (!preset)
                        continue;
                    const newField: FormFieldData = {
                        ...sourceField,
                        id: generateGuid(),
                        createdAt: getCurrentTimestamp(),
                        updatedAt: getCurrentTimestamp(),
                        order: (preset.formData?.length || 0) + 1
                    };
                    const updatedFormData = [...(preset.formData || []), newField];
                    await StorageService.updatePreset(presetId, { formData: updatedFormData });
                }
                hideModal();
                showToast(`Field shared to ${selected.length} preset(s)`, 'success');
            }
            catch (err) {
                console.error('Failed to share field:', err);
                showToast('Failed to share field. Please try again.', 'error');
            }
        });
    }
    catch (err) {
        console.error('Failed to load presets:', err);
        showToast('Failed to load presets. Please try again.', 'error');
    }
}

// Reorder form data after changes
export function reorderFormData() {
    state.formDataList.forEach((item, index) => {
        item.order = index + 1;
        item.updatedAt = getCurrentTimestamp();
    });
}

// Drag and drop handlers
export function handleDragStart(e: DragEvent) {
    // Prevent drag if user is focused on an input element
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
        e.preventDefault();
        return;
    }
    state.draggedRow = e.currentTarget as HTMLTableRowElement;
    state.draggedRow.classList.add('dragging');
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
    }
}

export function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    const target = e.currentTarget as HTMLTableRowElement;
    // Remove drag-over class from all rows first
    document.querySelectorAll('#formDataTable tbody tr').forEach(row => {
        row.classList.remove('drag-over');
    });
    // Add drag-over class to current target if it's not the dragged row
    if (state.draggedRow && target !== state.draggedRow) {
        target.classList.add('drag-over');
    }
}

export function handleDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLTableRowElement;
    target.classList.remove('drag-over');
    if (!state.draggedRow || target === state.draggedRow)
        return;
    const draggedId = state.draggedRow.getAttribute('data-id');
    const targetId = target.getAttribute('data-id');
    if (!draggedId || !targetId)
        return;
    const draggedIndex = state.formDataList.findIndex(f => f.id === draggedId);
    const targetIndex = state.formDataList.findIndex(f => f.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1)
        return;
    // Reorder array
    const [removed] = state.formDataList.splice(draggedIndex, 1);
    state.formDataList.splice(targetIndex, 0, removed);
    actions.reorderFormData();
    actions.renderFormDataTable();
    state.hasUnsavedPresetChanges = true;
    actions.updateButtonVisibility();
}

export function handleDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLTableRowElement;
    target.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    state.draggedRow = null;
}
