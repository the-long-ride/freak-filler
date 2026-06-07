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

// Setup change tracking for page profile
export function setupPageProfileChangeTracking() {
    const pageInputs = ['pageTitle', 'pageUrl', 'pageDescription', 'pageMatchIdentify'];
    pageInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                actions.updatePageProfileButtons();
            });
            element.addEventListener('change', () => {
                actions.updatePageProfileButtons();
            });
        }
    });
    // Ensure buttons reflect current state (hidden if no changes)
    actions.updatePageProfileButtons();
}

// Update page profile save/cancel button visibility
export function updatePageProfileButtons() {
    const hasChanges = actions.checkPageProfileChanges();
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    if (saveBtn)
        saveBtn.style.display = hasChanges ? 'block' : 'none';
    if (cancelBtn)
        cancelBtn.style.display = hasChanges ? 'block' : 'none';
}

// Check if page profile has changes
export function checkPageProfileChanges(): boolean {
    if (!state.currentPageData)
        return false;
    const title = (document.getElementById('pageTitle') as HTMLInputElement).value;
    const url = (document.getElementById('pageUrl') as HTMLInputElement).value;
    const description = (document.getElementById('pageDescription') as HTMLTextAreaElement).value;
    const matchIdentifyEl = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
    const matchIdentify = (matchIdentifyEl?.value ?? 'prefixMatch') as 'exactMatch' | 'prefixMatch';
    return title !== state.currentPageData.pageTitle ||
        url !== state.currentPageData.url ||
        description !== (state.currentPageData.description || '') ||
        matchIdentify !== state.currentPageData.matchIdentify;
}

// Save page profile data
export async function savePageProfile() {
    if (!state.currentPageData)
        return;
    const title = (document.getElementById('pageTitle') as HTMLInputElement).value.trim();
    const url = (document.getElementById('pageUrl') as HTMLInputElement).value.trim();
    const description = (document.getElementById('pageDescription') as HTMLTextAreaElement).value.trim();
    const matchIdentifyEl2 = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
    const matchIdentify2 = (matchIdentifyEl2?.value ?? 'prefixMatch') as 'exactMatch' | 'prefixMatch';
    if (!title || !url) {
        showToast('Title and URL are required', 'warning');
        return;
    }
    state.currentPageData.pageTitle = title;
    state.currentPageData.url = url;
    state.currentPageData.description = description;
    state.currentPageData.matchIdentify = matchIdentify2;
    state.currentPageData.updatedAt = getCurrentTimestamp();
    await StorageService.updatePage(state.currentPageData.id, state.currentPageData);
    actions.updatePageProfileButtons();
    showToast('Page profile saved successfully', 'success');
}

// Reset page profile data
export function resetPageProfile() {
    if (!state.currentPageData)
        return;
    (document.getElementById('pageTitle') as HTMLInputElement).value = state.currentPageData.pageTitle;
    (document.getElementById('pageUrl') as HTMLInputElement).value = state.currentPageData.url;
    (document.getElementById('pageDescription') as HTMLTextAreaElement).value = state.currentPageData.description || '';
    const pageMatchIdentifyEl2 = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
    if (pageMatchIdentifyEl2)
        pageMatchIdentifyEl2.value = state.currentPageData.matchIdentify;
    actions.updatePageProfileButtons();
}

// Save preset data
export async function savePresetData() {
    if (!state.currentPreset)
        return;
    const name = (document.getElementById('presetName') as HTMLInputElement).value.trim();
    const description = (document.getElementById('presetDescription') as HTMLInputElement).value.trim();
    if (!name) {
        showToast('Preset name is required', 'warning');
        return;
    }
    state.currentPreset.name = name;
    state.currentPreset.description = description;
    state.currentPreset.formData = [...state.formDataList];
    state.currentPreset.updatedAt = getCurrentTimestamp();
    await StorageService.updatePreset(state.currentPreset.id, state.currentPreset);
    state.originalFormDataList = JSON.parse(JSON.stringify(state.formDataList));
    state.hasUnsavedPresetChanges = false;
    actions.updatePresetButtons();
    showToast('Preset saved successfully', 'success');
}

// Reset preset data
export function resetPresetData() {
    state.formDataList = JSON.parse(JSON.stringify(state.originalFormDataList));
    state.hasUnsavedPresetChanges = false;
    actions.updatePresetButtons();
    actions.renderFormDataTable();
}

// Delete current preset
export async function deleteCurrentPreset() {
    if (!state.currentPreset)
        return;
    if (!await showConfirm('Delete Preset', `Delete preset "${state.currentPreset.name}"? This cannot be undone.`)) {
        return;
    }
    await StorageService.deletePreset(state.currentPreset.id);
    // Reset to create new preset mode
    state.currentPresetId = null;
    state.currentPreset = null;
    state.formDataList = [];
    state.originalFormDataList = [];
    state.hasUnsavedPresetChanges = false;
    (document.getElementById('presetSelector') as HTMLSelectElement).value = '';
    (document.getElementById('presetName') as HTMLInputElement).value = '';
    (document.getElementById('presetDescription') as HTMLInputElement).value = '';
    actions.updatePresetButtons();
    actions.renderFormDataTable();
    showToast('Preset deleted successfully', 'success');
}

// Save saved values data
export async function saveSavedValuesData() {
    if (!state.currentPageData)
        return;
    // Update all saved values for this page
    const data = await StorageService.getData();
    if (!data)
        return;
    // Remove old saved values for this page
    data.savedValues = data.savedValues.filter(sv => sv.pageId !== state.currentPageId);
    // Add updated saved values
    data.savedValues.push(...state.savedValuesList);
    await StorageService.setData(data);
    state.originalSavedValuesList = JSON.parse(JSON.stringify(state.savedValuesList));
    state.hasUnsavedSavedValuesChanges = false;
    actions.updateSavedValuesButtons();
    showToast('Saved values saved successfully', 'success');
}

// Reset saved values data
export function resetSavedValuesData() {
    state.savedValuesList = JSON.parse(JSON.stringify(state.originalSavedValuesList));
    state.hasUnsavedSavedValuesChanges = false;
    actions.renderSavedValuesTable();
    actions.updateSavedValuesButtons();
}

// Update preset buttons visibility
export function updatePresetButtons() {
    const hasChanges = state.hasUnsavedPresetChanges || actions.checkPresetInfoChanges();
    const saveBtn = document.getElementById('savePresetBtn');
    const rollbackBtn = document.getElementById('rollbackPresetBtn');
    const deleteBtn = document.getElementById('deletePresetBtn');
    if (saveBtn)
        saveBtn.style.display = hasChanges ? 'inline-block' : 'none';
    if (rollbackBtn)
        rollbackBtn.style.display = hasChanges ? 'inline-block' : 'none';
    if (deleteBtn)
        deleteBtn.style.display = state.currentPreset ? 'inline-block' : 'none';
}

// Check if preset info (name/description) has changes
export function checkPresetInfoChanges(): boolean {
    if (!state.currentPreset)
        return false;
    const name = (document.getElementById('presetName') as HTMLInputElement).value;
    const description = (document.getElementById('presetDescription') as HTMLInputElement).value;
    return name !== state.currentPreset.name || description !== (state.currentPreset.description || '');
}

// Update saved values buttons visibility
export function updateSavedValuesButtons() {
    const hasChanges = state.hasUnsavedSavedValuesChanges || JSON.stringify(state.savedValuesList) !== JSON.stringify(state.originalSavedValuesList);
    const saveBtn = document.getElementById('saveSavedValuesBtn');
    const rollbackBtn = document.getElementById('rollbackSavedValuesBtn');
    if (saveBtn)
        saveBtn.style.display = hasChanges ? 'inline-block' : 'none';
    if (rollbackBtn)
        rollbackBtn.style.display = hasChanges ? 'inline-block' : 'none';
}
