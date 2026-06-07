import { StorageService } from '../../services/storage.service';
import { PageData, Preset, FormFieldData, RootData, ExtensionSettings, SaveItemTarget, RandomStringCharset } from '../../types';
import { escapeHtml, initTheme, initVersion } from '../../utils/common';
import { getCurrentTimestamp, generateGuid, buildQuantityString } from '../../utils/helpers';
import { showConfirm, showToast, showModal, hideModal } from '../../utils/modal-utils';
import { downloadFile } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initIconReplacement } from '../../utils/icon-replacer';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { initGuideOverlays } from '../../utils/guide-overlay';
import { DEFAULTS } from '../../constants/appConstants';
import { actions, state } from './context';

interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// Export presets to JSON file
export async function exportPresets() {
    const data = await StorageService.getData();
    if (!data || data.presets.length === 0) {
        showToast('No presets to export', 'info');
        return;
    }
    await actions.showPresetExportSelectionModal(data.presets);
}

// Show preset export selection modal
export async function showPresetExportSelectionModal(allPresets: Preset[]) {
    const modalContent = `
    <div class="export-selection">
      <p>Select presets to export:</p>
      <div class="modal-selection-counter">Selected: ${allPresets.length} / ${allPresets.length}</div>
      
      <div class="preset-selection-list">
        <label class="export-option select-all-option">
          <input type="checkbox" id="selectAllPresets" checked>
          <span class="checkmark"></span>
          <strong>Select All Presets</strong>
        </label>
        
        <div class="preset-list">
          ${allPresets.map(preset => `
            <label class="export-option preset-option">
              <input type="checkbox" class="preset-checkbox" value="${preset.id}" checked>
              <span class="checkmark"></span>
              <div class="preset-card">
                <div class="preset-title">${escapeHtml(preset.name)}</div>
                <div class="preset-card-description">${preset.description ? escapeHtml(preset.description) : 'No description'}</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="modal-actions">
        <button id="cancelPresetExportBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="exportSelectedPresetsBtn" class="cyber-btn">
        Export Selected
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Export Presets', modalContent);
    // Update counter function
    const updateCounter = () => {
        const checkedCount = document.querySelectorAll('.preset-checkbox:checked').length;
        const totalCount = allPresets.length;
        const counterEl = document.querySelector('.modal-selection-counter');
        if (counterEl) {
            counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
        }
    };
    // Handle select all checkbox
    document.getElementById('selectAllPresets')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        const checkboxes = document.querySelectorAll('.preset-checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(cb => cb.checked = checked);
        updateCounter();
    });
    // Handle individual checkbox changes to update select all state
    document.querySelectorAll('.preset-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            const allCheckboxes = document.querySelectorAll('.preset-checkbox') as NodeListOf<HTMLInputElement>;
            const selectAllCheckbox = document.getElementById('selectAllPresets') as HTMLInputElement;
            const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            const noneChecked = Array.from(allCheckboxes).every(cb => !cb.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = !allChecked && !noneChecked;
            updateCounter();
        });
    });
    // Handle export selected button
    document.getElementById('exportSelectedPresetsBtn')?.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.preset-checkbox:checked') as NodeListOf<HTMLInputElement>)
            .map(cb => cb.value);
        if (selectedIds.length === 0) {
            showToast('Please select at least one preset to export', 'warning');
            return;
        }
        const selectedPresets = allPresets.filter(preset => selectedIds.includes(preset.id));
        hideModal();
        await actions.performPresetExport(selectedPresets);
    });
    // Handle cancel button
    document.getElementById('cancelPresetExportBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Perform the actual preset export
export async function performPresetExport(selectedPresets: Preset[]) {
    const exportFile = createExportFile({
        included: { presets: true },
        data: { presets: selectedPresets }
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `presets-export-${Date.now()}.json`);
    showToast(`${selectedPresets.length} preset${selectedPresets.length === 1 ? '' : 's'} exported and downloaded`, 'success');
}

// Import presets from JSON file
export async function importPresets(file: File) {
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.presets || !Array.isArray(imported.data.presets)) {
            showToast('Invalid import file: presets section not included', 'error');
            return;
        }
        const data = await StorageService.getData();
        if (!data)
            return;
        let addedCount = 0;
        let skippedIdCount = 0;
        let skippedDuplicateCount = 0;
        for (const preset of imported.data.presets) {
            // Check if preset already exists with same ID
            const existingById = data.presets.find(p => p.id === preset.id);
            if (existingById) {
                skippedIdCount++;
                continue;
            }
            // Check if preset already exists with same name
            const existingByName = data.presets.find(p => p.name === preset.name);
            if (existingByName) {
                skippedDuplicateCount++;
                continue;
            }
            // Add new preset with new ID
            const newPreset = {
                ...preset,
                id: generateGuid(),
                createdAt: getCurrentTimestamp(),
                updatedAt: getCurrentTimestamp()
            };
            data.presets.push(newPreset);
            addedCount++;
        }
        await StorageService.setData(data);
        await actions.loadPresets();
        let message = `Added ${addedCount} presets`;
        if (skippedIdCount > 0)
            message += `, skipped ${skippedIdCount} with existing IDs`;
        if (skippedDuplicateCount > 0)
            message += `, skipped ${skippedDuplicateCount} duplicates`;
        showToast(message, 'success');
    }
    catch (error) {
        console.error('Import presets error:', error);
        showToast('Failed to import presets. Please check the file format.', 'error');
    }
}
