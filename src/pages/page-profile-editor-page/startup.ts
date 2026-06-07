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

// Initialize
export async function init() {
    // Initialize theme
    await initTheme();
    // Initialize version
    await initVersion();
    // Initialize cyber buttons
    initCyberButtons();
    // Initialize icon replacement
    initIconReplacement();
    // Initialize guide overlays
    initGuideOverlays();
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    state.currentPageId = urlParams.get('pageId') || '';
    state.currentPresetId = urlParams.get('presetId') || null;
    state.isPresetOnlyMode = !state.currentPageId;
    if (!state.isPresetOnlyMode) {
        // Load page data
        state.currentPageData = await StorageService.getPageById(state.currentPageId);
        if (!state.currentPageData) {
            showToast('Page not found', 'error');
            return;
        }
        // Populate page information in sidebar
        (document.getElementById('pageId') as HTMLElement).textContent = state.currentPageData.id;
        (document.getElementById('pageTitle') as HTMLInputElement).value = state.currentPageData.pageTitle;
        (document.getElementById('pageUrl') as HTMLInputElement).value = state.currentPageData.url;
        (document.getElementById('pageDescription') as HTMLTextAreaElement).value = state.currentPageData.description || '';
        const pageMatchIdentifyEl = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
        if (pageMatchIdentifyEl)
            pageMatchIdentifyEl.value = state.currentPageData.matchIdentify;
        // Load presets for this page
        await actions.loadPagePresets();
        // Load saved values for this page
        await actions.loadSavedValues();
        // Setup change tracking for page profile
        actions.setupPageProfileChangeTracking();
    }
    else {
        actions.setupPresetOnlyModeUI();
        await actions.loadPagePresets();
    }
    // Load preset if editing
    if (state.currentPresetId) {
        await actions.loadPreset();
    }
    else {
        // Set selector to "Create New"
        (document.getElementById('presetSelector') as HTMLSelectElement).value = '';
    }
    // Setup event listeners
    actions.setupEventListeners();
}

export function setupPresetOnlyModeUI() {
    // Sidebar shows empty page info and is read-only
    document.querySelectorAll('[data-group="pageInfo"]').forEach(el => el.remove());
    document.querySelectorAll('[data-group="isPresetOnlyMode"]').forEach(el => el.classList.remove('invisible'));
    // Ensure preset tab is active
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const presetTabBtn = document.querySelector('.tab-btn[data-tab="preset-tab"]') as HTMLElement | null;
    if (presetTabBtn)
        presetTabBtn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const presetTabContent = document.getElementById('preset-tab') as HTMLElement | null;
    if (presetTabContent)
        presetTabContent.classList.add('active');
}

// Load presets for current page
export async function loadPagePresets() {
    const presetSelector = document.getElementById('presetSelector') as HTMLSelectElement;
    if (!presetSelector)
        return;
    const presets = state.currentPageData ? await StorageService.getPresetsForPage(state.currentPageData.id)
        : (await StorageService.getData())?.presets ?? [];
    // Clear existing options except "Create New"
    presetSelector.innerHTML = '<option value="">Create New Preset</option>';
    // Add presets as options
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        presetSelector.appendChild(option);
    });
    // Set current selection
    if (state.currentPresetId) {
        presetSelector.value = state.currentPresetId;
    }
    // Update link presets button visibility
    await actions.updateLinkPresetsButtonVisibility();
}

// Update visibility of link presets button based on available unlinked presets
export async function updateLinkPresetsButtonVisibility() {
    const linkPresetsBtn = document.getElementById('linkPresetsBtn');
    if (!linkPresetsBtn || !state.currentPageData)
        return;
    const unlinkedPresets = await StorageService.getUnlinkedPresets(state.currentPageData.id);
    linkPresetsBtn.style.display = unlinkedPresets.length > 0 ? 'block' : 'none';
}

// Load preset for editing
export async function loadPreset() {
    if (!state.currentPresetId)
        return;
    state.currentPreset = await StorageService.getPresetById(state.currentPresetId);
    if (!state.currentPreset)
        return;
    // Update preset selector
    (document.getElementById('presetSelector') as HTMLSelectElement).value = state.currentPresetId;
    // Show preset ID below selector
    const presetIdDisplay = document.getElementById('presetIdDisplay');
    const presetIdValue = document.getElementById('presetIdValue');
    if (presetIdDisplay && presetIdValue) {
        presetIdValue.textContent = state.currentPreset.id;
        presetIdDisplay.style.display = 'block';
    }
    // Update name and description in tab
    (document.getElementById('presetName') as HTMLInputElement).value = state.currentPreset.name;
    (document.getElementById('presetDescription') as HTMLInputElement).value = state.currentPreset.description || '';
    // Load form data
    state.formDataList = [...state.currentPreset.formData].sort((a, b) => a.order - b.order);
    state.originalFormDataList = JSON.parse(JSON.stringify(state.formDataList)); // Deep copy
    state.hasUnsavedPresetChanges = false;
    actions.updatePresetButtons();
    actions.renderFormDataTable();
}

// Load saved values for current page
export async function loadSavedValues() {
    if (!state.currentPageData)
        return;
    state.savedValuesList = await StorageService.getSavedValuesForPage(state.currentPageData.id);
    state.originalSavedValuesList = JSON.parse(JSON.stringify(state.savedValuesList)); // Deep copy
    state.hasUnsavedSavedValuesChanges = false;
    actions.renderSavedValuesTable();
    actions.updateSavedValuesCount();
    actions.updateSavedValuesButtons();
}
