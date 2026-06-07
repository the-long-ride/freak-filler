import { StorageService } from '../../services/storage.service';
import { FormFieldData, PageData } from '../../types';
import { generateGuid, getCurrentTimestamp, generateRandomString, getCharacterSet } from '../../utils/helpers';
import { downloadFile, initTheme, initVersion } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initIconReplacement } from '../../utils/icon-replacer';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { showModal, hideModal } from '../../utils/modal-utils';
import { initGuideOverlays } from '../../utils/guide-overlay';
import { actions, state } from './context';

// Export presets data
export async function exportPresetsData() {
    if (!state.currentPageData)
        return;
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    if (presets.length === 0) {
        actions.showNotification('No presets to export.');
        return;
    }
    const exportFile = createExportFile({
        included: { presets: true },
        data: { presets },
        exportedAt: new Date().toISOString(),
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `${state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presets.json`);
    actions.showNotification(`Exported ${presets.length} preset(s) successfully!`);
}

// Show export presets modal with selection
export async function showExportPresetsModal() {
    if (!state.currentPageData)
        return;
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    if (presets.length === 0) {
        actions.showNotification('No presets to export.');
        return;
    }
    const checkboxes = presets.map(preset => `
    <label style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" 
           onmouseover="this.style.background='var(--bg-hover)'" 
           onmouseout="this.style.background='transparent'">
      <input type="checkbox" class="preset-export-checkbox" value="${preset.id}" checked 
             style="width: 18px; height: 18px; cursor: pointer;" />
      <div style="flex: 1;">
        <div style="font-weight: 500;">${preset.name}</div>
        ${preset.description ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${preset.description}</div>` : ''}
      </div>
    </label>
  `).join('');
    const bodyContent = `
    <div style="margin-bottom: 16px;">
      <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; margin-bottom: 12px; cursor: pointer;">
        <input type="checkbox" id="selectAllPresets" checked style="width: 18px; height: 18px;" />
        <span>Select All (${presets.length} presets)</span>
      </label>
    </div>
    <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px; padding: 8px;">
      ${checkboxes}
    </div>
    <div class="form-actions" style="margin-top: 16px;">
      <button id="cancelExportBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="exportSelectedBtn" class="cyber-btn">Export Selected
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Export Presets', bodyContent);
    // Select all checkbox logic
    document.getElementById('selectAllPresets')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        document.querySelectorAll('.preset-export-checkbox').forEach(cb => {
            (cb as HTMLInputElement).checked = checked;
        });
    });
    // Export selected button
    document.getElementById('exportSelectedBtn')?.addEventListener('click', async () => {
        const selectedIds: string[] = [];
        document.querySelectorAll('.preset-export-checkbox:checked').forEach(cb => {
            selectedIds.push((cb as HTMLInputElement).value);
        });
        if (selectedIds.length === 0) {
            actions.showNotification('Please select at least one preset to export.');
            return;
        }
        const selectedPresets = presets.filter(p => selectedIds.includes(p.id));
        const exportFile = createExportFile({
            included: { presets: true },
            data: { presets: selectedPresets },
            exportedAt: new Date().toISOString(),
        });
        downloadFile(JSON.stringify(exportFile, null, 2), `${state.currentPageData!.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presets.json`);
        hideModal();
        actions.showNotification(`Exported ${selectedPresets.length} preset(s) successfully!`);
    });
    document.getElementById('cancelExportBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Import presets data
export async function importPresetsData(file: File) {
    if (!state.currentPageData)
        return;
    try {
        const text = await file.text();
        const importedData = parseExtensionExportJson(text);
        if (!importedData.included.presets || !Array.isArray(importedData.data.presets)) {
            actions.showNotification('Invalid import file: presets section not included');
            return;
        }
        const data = await StorageService.getData();
        if (!data)
            return;
        let addedCount = 0;
        let skippedIdCount = 0;
        let skippedDuplicateCount = 0;
        for (const preset of importedData.data.presets) {
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
            const newPreset = await StorageService.addPreset({
                name: preset.name,
                description: preset.description || '',
                formData: preset.formData || []
            });
            await StorageService.linkPresetToPage(newPreset.id, state.currentPageData.id);
            addedCount++;
        }
        let message = `Added ${addedCount} preset${addedCount === 1 ? '' : 's'}`;
        if (skippedIdCount > 0)
            message += `, skipped ${skippedIdCount} with existing IDs`;
        if (skippedDuplicateCount > 0)
            message += `, skipped ${skippedDuplicateCount} duplicates`;
        actions.showNotification(message, async () => {
            await actions.loadPageData();
        });
    }
    catch (error) {
        console.error('Import error:', error);
        actions.showNotification('Failed to import presets. Please check the file format.');
    }
}
