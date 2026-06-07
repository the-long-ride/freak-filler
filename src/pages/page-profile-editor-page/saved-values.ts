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

// Add new saved value row
export function addSavedValueRow(data?: SavedValue) {
    const newData: SavedValue = data || {
        id: generateGuid(),
        pageId: state.currentPageId,
        label: '',
        value: '',
        testId: '',
        querySelector: '',
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    state.savedValuesList.push(newData);
    actions.renderSavedValuesTable();
    actions.updateSavedValuesCount();
    state.hasUnsavedSavedValuesChanges = true;
    actions.updateButtonVisibility();
    // Highlight and scroll to the new saved value row similar to preset editor
    setTimeout(() => {
        const newRow = document.querySelector(`tr[data-id="${newData.id}"]`) as HTMLElement | null;
        if (newRow) {
            const tbody = document.getElementById('savedValuesBody');
            const container = tbody?.closest('.table-container') as HTMLElement | null;
            if (container)
                container.scrollTop = container.scrollHeight;
            else
                newRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}

// Render saved values table
export function renderSavedValuesTable() {
    const tbody = document.getElementById('savedValuesBody');
    if (!tbody)
        return;
    if (state.savedValuesList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 24px;">No saved values yet</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    state.savedValuesList.forEach((data, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', data.id);
        const formattedDate = new Date(data.updatedAt).toLocaleString('en-US', {
            year: '2-digit',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        row.innerHTML = `
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.label}" 
          data-field="label"
          placeholder="Field label"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.value}" 
          data-field="value"
          placeholder="Saved value"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.testId || ''}" 
          data-field="testId"
          placeholder="data-testid"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.querySelector || ''}" 
          data-field="querySelector"
          placeholder="CSS selector"
        />
      </td>
      <td style="color: var(--text-secondary); font-size: 11px;">
        ${formattedDate}
      </td>
      <td>
        <button class="action-btn action-btn--delete" data-id="${data.id}" title="Delete" data-icons="Trash"></button>
      </td>
    `;
        tbody.appendChild(row);
    });
    // Add event listeners for inputs
    tbody.querySelectorAll('.table-input').forEach(input => {
        input.addEventListener('input', actions.handleSavedValueInputChange);
        input.addEventListener('blur', () => { state.hasUnsavedSavedValuesChanges = true; actions.updateSavedValuesButtons(); });
    });
    // Add event listeners for delete buttons
    tbody.querySelectorAll('.action-btn--delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
            if (id)
                await actions.deleteSavedValue(id);
        });
    });
    // Update saved values count
    actions.updateSavedValuesCount();
}

// Update saved values count (separate function to reuse)
export function updateSavedValuesCount() {
    const el = document.getElementById('savedValuesCount');
    if (!el)
        return;
    el.textContent = buildQuantityString(state.savedValuesList.length);
}

// Handle saved value input change
export function handleSavedValueInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const row = input.closest('tr');
    if (!row)
        return;
    const id = row.getAttribute('data-id');
    if (!id)
        return;
    const field = input.getAttribute('data-field');
    if (!field)
        return;
    const savedValue = state.savedValuesList.find(d => d.id === id);
    if (!savedValue)
        return;
    // Update the data
    (savedValue as any)[field] = input.value;
    savedValue.updatedAt = getCurrentTimestamp();
    state.hasUnsavedSavedValuesChanges = true;
    actions.updateSavedValuesButtons();
}

// Delete saved value
export async function deleteSavedValue(id: string) {
    if (!await showConfirm('Delete Saved Value', 'Are you sure you want to delete this saved value?'))
        return;
    const index = state.savedValuesList.findIndex(d => d.id === id);
    if (index === -1)
        return;
    state.savedValuesList.splice(index, 1);
    actions.renderSavedValuesTable();
    actions.updateSavedValuesCount();
    state.hasUnsavedSavedValuesChanges = true;
    actions.updateSavedValuesButtons();
}

// Export saved values to JSON
export async function exportSavedValues() {
    if (!state.currentPageData) {
        showToast('No page selected', 'warning');
        return;
    }
    if (state.savedValuesList.length === 0) {
        showToast('No saved values to export', 'info');
        return;
    }
    const exportFile = createExportFile({
        included: { pages: true, savedValues: true },
        data: { pages: [state.currentPageData], savedValues: state.savedValuesList },
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `saved-values-${state.currentPageData.pageTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`);
    showToast('Saved values exported and downloaded', 'success');
}

// Import saved values from JSON
export async function importSavedValues(file: File) {
    if (!state.currentPageData) {
        showToast('No page selected', 'warning');
        return;
    }
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.savedValues || !Array.isArray(imported.data.savedValues)) {
            showToast('Invalid import file: savedValues section not included', 'error');
            return;
        }
        let addedCount = 0;
        let skippedCount = 0;
        let updatedCount = 0;
        const addedIds: string[] = [];
        for (const value of imported.data.savedValues) {
            // Check for duplicate by testId AND querySelector
            const existing = state.savedValuesList.find(v => v.testId === value.testId && v.querySelector === value.querySelector);
            if (existing) {
                // Ask user if they want to overwrite
                const overwrite = await showConfirm('Overwrite Saved Value', `A saved value with testId="${value.testId}" and querySelector="${value.querySelector}" already exists.\n\n` +
                    `Current value: "${existing.value}"\n` +
                    `Imported value: "${value.value}"\n\n` +
                    `Do you want to overwrite it?`);
                if (overwrite) {
                    existing.label = value.label;
                    existing.value = value.value;
                    existing.testId = value.testId;
                    existing.querySelector = value.querySelector;
                    existing.updatedAt = getCurrentTimestamp();
                    updatedCount++;
                }
                else {
                    skippedCount++;
                }
            }
            else {
                // Add new saved value with new ID
                const newValue = {
                    ...value,
                    id: generateGuid(),
                    pageId: state.currentPageData.id,
                    createdAt: getCurrentTimestamp(),
                    updatedAt: getCurrentTimestamp()
                };
                state.savedValuesList.push(newValue);
                addedIds.push(newValue.id);
                addedCount++;
            }
        }
        actions.renderSavedValuesTable();
        state.hasUnsavedSavedValuesChanges = true;
        actions.updateSavedValuesButtons();
        actions.updateSavedValuesCount();
        // Highlight the most recently added saved value (if any)
        if (addedIds.length > 0) {
            setTimeout(() => {
                const lastId = addedIds[addedIds.length - 1];
                const newRow = document.querySelector(`tr[data-id="${lastId}"]`) as HTMLElement | null;
                if (newRow) {
                    const tbody = document.getElementById('savedValuesBody');
                    const container = tbody?.closest('.table-container') as HTMLElement | null;
                    if (container)
                        container.scrollTop = container.scrollHeight;
                    else
                        newRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    newRow.classList.add('highlight-new');
                    setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
                }
            }, 100);
        }
        showToast(`Import complete: Added: ${addedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`, 'success');
    }
    catch (error) {
        console.error('Import saved values error:', error);
        showToast('Failed to import saved values. Please check the file format.', 'error');
    }
}
