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

// Show export selection modal for page profile
export async function showExportSelectionModal() {
    if (!state.currentPageData)
        return;
    const page = state.currentPageData;
    const presets = await StorageService.getPresetsForPage(page.id);
    const savedValues = await StorageService.getSavedValuesForPage(page.id);
    const modalContent = `
    <div class="export-selection">
      <p>Select what you want to export for this page profile:</p>
      
      <div class="export-options">
        <label class="export-option">
          <input type="checkbox" id="exportPage" checked>
          <span class="checkmark"></span>
          Page Information (${escapeHtml(page.pageTitle)})
        </label>
        
        <label class="export-option">
          <input type="checkbox" id="exportPresets" checked>
          <span class="checkmark"></span>
          Presets (${presets.length} items)
        </label>
        
        <label class="export-option">
          <input type="checkbox" id="exportSavedValues" checked>
          <span class="checkmark"></span>
          Saved Values (${savedValues.length} items)
        </label>
      </div>
      
      <div class="modal-actions">
        <button id="cancelExportBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="selectAllBtn" class="cyber-btn cyber-btn--secondary">
          Select All
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">all</span>
        </button>
        <button id="exportSelectedBtn" class="cyber-btn">
        Export Selected
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Export Page Profile', modalContent);
    // Handle select all button
    document.getElementById('selectAllBtn')?.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.export-selection input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
        });
    });
    // Handle export selected button
    document.getElementById('exportSelectedBtn')?.addEventListener('click', async () => {
        const exportPage = (document.getElementById('exportPage') as HTMLInputElement).checked;
        const exportPresets = (document.getElementById('exportPresets') as HTMLInputElement).checked;
        const exportSavedValues = (document.getElementById('exportSavedValues') as HTMLInputElement).checked;
        if (!exportPage && !exportPresets && !exportSavedValues) {
            showToast('Please select at least one item to export', 'warning');
            return;
        }
        hideModal();
        await actions.performExport(exportPage, exportPresets, exportSavedValues);
    });
    // Handle cancel button
    document.getElementById('cancelExportBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Show preset export selection modal for current page presets
export async function showPresetExportSelectionModal() {
    if (!state.currentPageData)
        return;
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    if (presets.length === 0) {
        showToast('No presets available for this page', 'info');
        return;
    }
    const modalContent = `
    <div class="export-selection">
      <p>Select presets to export:</p>
      <div class="modal-selection-counter">Selected: ${presets.length} / ${presets.length}</div>
      
      <div class="preset-selection-list">
        <label class="export-option select-all-option">
          <input type="checkbox" id="selectAllPresets" checked>
          <span class="checkmark"></span>
          <strong>Select All Presets</strong>
        </label>
        
        <div class="preset-list">
          ${presets.map(preset => `
            <label class="export-option preset-option">
              <input type="checkbox" class="preset-checkbox" value="${preset.id}" checked>
              <span class="checkmark"></span>
              <div class="preset-card">
                <div class="preset-title">${escapeHtml(preset.name)}</div>
                ${preset.description ? `<div class="preset-card-description">${escapeHtml(preset.description)}</div>` : '<div class="preset-card-description">No description</div>'}
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
        const totalCount = presets.length;
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
        const selectedPresets = presets.filter(preset => selectedIds.includes(preset.id));
        hideModal();
        await actions.performPresetExport(selectedPresets);
    });
    // Handle cancel button
    document.getElementById('cancelPresetExportBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Perform the actual export based on selections
export async function performExport(includePage: boolean, includePresets: boolean, includeSavedValues: boolean) {
    if (!state.currentPageData)
        return;
    const page = state.currentPageData;
    const presets = includePresets ? await StorageService.getPresetsForPage(page.id) : [];
    const savedValues = includeSavedValues ? await StorageService.getSavedValuesForPage(page.id) : [];
    const data = await StorageService.getData();
    const presetIds = new Set(presets.map(p => p.id));
    const presetPageLinks = includePresets ? (data?.presetPageLinks ?? []).filter(link => link.pageId === page.id && presetIds.has(link.presetId)) : [];
    const included: any = {};
    const exportData: any = {};
    if (includePage) {
        included.pages = true;
        exportData.pages = [page];
    }
    if (includePresets) {
        included.presets = true;
        included.presetPageLinks = true;
        exportData.presets = presets;
        exportData.presetPageLinks = presetPageLinks;
    }
    if (includeSavedValues) {
        included.savedValues = true;
        exportData.savedValues = savedValues;
    }
    const exportFile = createExportFile({
        included,
        data: exportData,
    });
    const filename = page.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const selectedItems = [];
    if (includePage)
        selectedItems.push('page');
    if (includePresets)
        selectedItems.push('presets');
    if (includeSavedValues)
        selectedItems.push('saved values');
    downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_page_profile.json`);
    showToast(`Selected ${selectedItems.join(', ')} exported and downloaded`, 'success');
}

// Perform the actual preset export
export async function performPresetExport(selectedPresets: Preset[]) {
    if (!state.currentPageData)
        return;
    const exportFile = createExportFile({
        included: { presets: true },
        data: { presets: selectedPresets }
    });
    const filename = state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_presets.json`);
    showToast(`${selectedPresets.length} preset${selectedPresets.length === 1 ? '' : 's'} exported and downloaded`, 'success');
}
