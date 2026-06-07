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

// Mark as changed
export function markAsChanged() {
    state.hasUnsavedChanges = true;
    const footer = document.getElementById('settingsFooter');
    if (footer)
        footer.style.display = 'block';
}

// Show/hide locator buttons
export function showLocatorButtons() {
    const saveBtn = document.getElementById('saveLocatorsBtn');
    const cancelBtn = document.getElementById('cancelLocatorsBtn');
    if (saveBtn)
        saveBtn.style.display = 'inline-block';
    if (cancelBtn)
        cancelBtn.style.display = 'inline-block';
}

export function hideLocatorButtons() {
    const saveBtn = document.getElementById('saveLocatorsBtn');
    const cancelBtn = document.getElementById('cancelLocatorsBtn');
    if (saveBtn)
        saveBtn.style.display = 'none';
    if (cancelBtn)
        cancelBtn.style.display = 'none';
}

// Show/hide page buttons
export function showPageButtons() {
    const saveBtn = document.getElementById('savePagesBtn');
    const cancelBtn = document.getElementById('cancelPagesBtn');
    if (saveBtn)
        saveBtn.style.display = 'inline-block';
    if (cancelBtn)
        cancelBtn.style.display = 'inline-block';
}

export function hidePageButtons() {
    const saveBtn = document.getElementById('savePagesBtn');
    const cancelBtn = document.getElementById('cancelPagesBtn');
    if (saveBtn)
        saveBtn.style.display = 'none';
    if (cancelBtn)
        cancelBtn.style.display = 'none';
}

// Show/hide regex patterns buttons
export function showRegexPatternsButtons() {
    const saveBtn = document.getElementById('saveRegexPatternsBtn');
    const cancelBtn = document.getElementById('cancelRegexPatternsBtn');
    if (saveBtn)
        saveBtn.style.display = 'inline-block';
    if (cancelBtn)
        cancelBtn.style.display = 'inline-block';
}

export function hideRegexPatternsButtons() {
    const saveBtn = document.getElementById('saveRegexPatternsBtn');
    const cancelBtn = document.getElementById('cancelRegexPatternsBtn');
    if (saveBtn)
        saveBtn.style.display = 'none';
    if (cancelBtn)
        cancelBtn.style.display = 'none';
}

// Show/hide length config buttons
export function showLengthConfigButtons() {
    const saveBtn = document.getElementById('saveLengthConfigBtn');
    const cancelBtn = document.getElementById('cancelLengthConfigBtn');
    if (saveBtn)
        saveBtn.style.display = 'inline-block';
    if (cancelBtn)
        cancelBtn.style.display = 'inline-block';
}

export function hideLengthConfigButtons() {
    const saveBtn = document.getElementById('saveLengthConfigBtn');
    const cancelBtn = document.getElementById('cancelLengthConfigBtn');
    if (saveBtn)
        saveBtn.style.display = 'none';
    if (cancelBtn)
        cancelBtn.style.display = 'none';
}

// Show/hide preset buttons
export function showPresetButtons() {
    const saveBtn = document.getElementById('savePresetsBtn');
    const cancelBtn = document.getElementById('cancelPresetsBtn');
    if (saveBtn)
        saveBtn.style.display = 'inline-block';
    if (cancelBtn)
        cancelBtn.style.display = 'inline-block';
}

export function hidePresetButtons() {
    const saveBtn = document.getElementById('savePresetsBtn');
    const cancelBtn = document.getElementById('cancelPresetsBtn');
    if (saveBtn)
        saveBtn.style.display = 'none';
    if (cancelBtn)
        cancelBtn.style.display = 'none';
}
