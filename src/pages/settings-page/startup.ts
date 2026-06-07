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

// Update filling assistant note visibility based on toggle states
export function updateFillingAssistantNoteVisibility() {
    const enableSaveValue = (document.getElementById('enableSaveValue') as HTMLInputElement)?.checked ?? false;
    const enableImportValue = (document.getElementById('enableImportValue') as HTMLInputElement)?.checked ?? false;
    const enableLocatorRetriever = (document.getElementById('enableLocatorRetriever') as HTMLInputElement)?.checked ?? false;
    const enableRegexPattern = (document.getElementById('enableRegexPattern') as HTMLInputElement)?.checked ?? false;
    const enableRandomStringInAssistant = (document.getElementById('enableRandomStringInAssistant') as HTMLInputElement)?.checked ?? false;
    const fillingAssistantNote = document.getElementById('fillingAssistantNote');
    // Show note only when ALL toggles are off
    const allTogglesOff = !enableSaveValue && !enableImportValue &&
        !enableLocatorRetriever && !enableRegexPattern && !enableRandomStringInAssistant;
    if (fillingAssistantNote) {
        fillingAssistantNote.style.display = allTogglesOff ? 'block' : 'none';
    }
}

// Helper function to update a single setting
export async function updateSetting<K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K], message = '') {
    const settings = await StorageService.getSettings();
    if (settings) {
        await StorageService.setSettings({
            ...settings,
            [key]: value
        });
        if (message) {
            showToast(message, 'success');
        }
    }
}

// Initialize
export async function init() {
    await initTheme();
    await initVersion();
    initCyberButtons(); // Initialize static header buttons first
    initIconReplacement();
    // Initialize guide overlays (settings page)
    initGuideOverlays();
    await actions.loadSettings();
    await actions.loadData();
    actions.setupEventListeners();
    // Initialize sort indicators
    actions.updateSortIndicators('regexPatterns');
    actions.updateSortIndicators('locators');
    actions.updateSortIndicators('pages');
    actions.updateSortIndicators('presets');
    actions.updateSortIndicators('lengthConfig');
}

// Load settings
export async function loadSettings() {
    const settings = await StorageService.getSettings();
    state.originalSettings = JSON.parse(JSON.stringify(settings));
    const enableLiveAssistant = document.getElementById('enableLiveAssistant') as HTMLInputElement;
    const enableSaveValue = document.getElementById('enableSaveValue') as HTMLInputElement;
    const enableImportValue = document.getElementById('enableImportValue') as HTMLInputElement;
    const enableLocatorRetriever = document.getElementById('enableLocatorRetriever') as HTMLInputElement;
    const enableRegexPattern = document.getElementById('enableRegexPattern') as HTMLInputElement;
    const enableRandomStringInAssistant = document.getElementById('enableRandomStringInAssistant') as HTMLInputElement;
    const enableRandomStringSectionInPopup = document.getElementById('enableRandomStringSectionInPopup') as HTMLInputElement;
    const randomStringCharset = document.getElementById('randomStringCharset') as HTMLSelectElement;
    const randomStringLength = document.getElementById('randomStringLength') as HTMLInputElement;
    const defaultSaveTarget = document.getElementById('defaultSaveTarget') as HTMLSelectElement;
    if (settings) {
        enableLiveAssistant.checked = settings.enableLiveAssistant ?? false;
        enableSaveValue.checked = settings.enableSaveValue ?? true;
        enableImportValue.checked = settings.enableImportValue ?? true;
        enableLocatorRetriever.checked = settings.enableLocatorRetriever ?? false;
        enableRegexPattern.checked = settings.enableRegexPattern ?? false;
        enableRandomStringInAssistant.checked = settings.enableRandomStringInAssistant ?? false;
        enableRandomStringSectionInPopup.checked = settings.enableRandomStringSectionInPopup ?? DEFAULTS.ENABLE_RANDOM_STRING_SECTION;
        randomStringCharset.value = settings.randomStringCharset ?? 'alphanumeric-special';
        randomStringLength.value = String(settings.randomStringLength ?? DEFAULTS.RANDOM_STRING_LENGTH);
        // Populate and set default save target select
        if (defaultSaveTarget) {
            // Ensure options exist
            if (defaultSaveTarget.options.length === 0) {
                const optSaved = document.createElement('option');
                optSaved.value = 'savedValues';
                optSaved.text = 'Saved Values';
                defaultSaveTarget.add(optSaved);
                const optPreset = document.createElement('option');
                optPreset.value = 'preset';
                optPreset.text = 'Preset';
                defaultSaveTarget.add(optPreset);
            }
            defaultSaveTarget.value = settings.defaultSaveItemTo;
        }
    }
    // Update note visibility based on loaded settings
    actions.updateFillingAssistantNoteVisibility();
}

// Load all data
export async function loadData() {
    const data = await StorageService.getData();
    if (!data)
        return;
    state.originalData = JSON.parse(JSON.stringify(data));
    await actions.loadLocators();
    await actions.loadRegexPatterns();
    await actions.loadLengthConfigurations();
    await actions.loadPages();
    await actions.loadPresets();
}
