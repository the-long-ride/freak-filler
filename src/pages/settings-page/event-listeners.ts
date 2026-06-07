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

// Setup event listeners
export function setupEventListeners() {
    // Filling assistant config - apply immediately
    document.getElementById('enableLiveAssistant')?.addEventListener('change', async () => {
        const checked = (document.getElementById('enableLiveAssistant') as HTMLInputElement).checked;
        await actions.updateSetting('enableLiveAssistant', checked, 'Filling Assistant Popup immediately showing is ' + (checked ? 'enabled' : 'disabled'));
        actions.updateFillingAssistantNoteVisibility();
    });
    document.getElementById('enableSaveValue')?.addEventListener('change', async () => {
        const checked = (document.getElementById('enableSaveValue') as HTMLInputElement).checked;
        await actions.updateSetting('enableSaveValue', checked, 'Save Value section in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
        actions.updateFillingAssistantNoteVisibility();
    });
    document.getElementById('enableImportValue')?.addEventListener('change', async () => {
        const checked = (document.getElementById('enableImportValue') as HTMLInputElement).checked;
        await actions.updateSetting('enableImportValue', checked, 'Import Value section in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
        actions.updateFillingAssistantNoteVisibility();
    });
    document.getElementById('enableLocatorRetriever')?.addEventListener('change', async () => {
        const checked = (document.getElementById('enableLocatorRetriever') as HTMLInputElement).checked;
        await actions.updateSetting('enableLocatorRetriever', checked, 'Locator retriever in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
        actions.updateFillingAssistantNoteVisibility();
    });
    document.getElementById('enableRegexPattern')?.addEventListener('change', async () => {
        const checked = (document.getElementById('enableRegexPattern') as HTMLInputElement).checked;
        await actions.updateSetting('enableRegexPattern', checked, 'Regex pattern import in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
        actions.updateFillingAssistantNoteVisibility();
    });
    document.getElementById('enableRandomStringInAssistant')?.addEventListener('change', async () => {
        const checked = (document.getElementById('enableRandomStringInAssistant') as HTMLInputElement).checked;
        await actions.updateSetting('enableRandomStringInAssistant', checked, 'Random string generator in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
        actions.updateFillingAssistantNoteVisibility();
    });
    document.getElementById('enableRandomStringSectionInPopup')?.addEventListener('change', async () => {
        const checked = (document.getElementById('enableRandomStringSectionInPopup') as HTMLInputElement).checked;
        await actions.updateSetting('enableRandomStringSectionInPopup', checked, 'Random string shortcut to extension popup is ' + (checked ? 'enabled' : 'disabled'));
    });
    document.getElementById('randomStringCharset')?.addEventListener('change', async () => {
        const value = (document.getElementById('randomStringCharset') as HTMLSelectElement).value as RandomStringCharset;
        await actions.updateSetting('randomStringCharset', value, 'Default random string character set updated');
    });
    document.getElementById('randomStringLength')?.addEventListener('change', async () => {
        const value = parseInt((document.getElementById('randomStringLength') as HTMLInputElement).value) || DEFAULTS.RANDOM_STRING_LENGTH;
        await actions.updateSetting('randomStringLength', value, 'Default random string length updated');
    });
    document.getElementById('defaultSaveTarget')?.addEventListener('change', async () => {
        const value = (document.getElementById('defaultSaveTarget') as HTMLSelectElement).value as SaveItemTarget;
        await actions.updateSetting('defaultSaveItemTo', value, 'Default save target updated to has been updated');
    });
    // Prompts guide: initialize prompt text and wire copy/select behavior
    const promptsSelect = document.getElementById('promptsSelect') as HTMLSelectElement | null;
    const promptsTextarea = document.getElementById('promptsTextarea') as HTMLTextAreaElement | null;
    const promptsCopyBtn = document.getElementById('promptsCopyBtn') as HTMLButtonElement | null;
    const promptPageSrc = document.getElementById('prompt-page-src') as HTMLElement | null;
    const promptPresetSrc = document.getElementById('prompt-preset-src') as HTMLElement | null;
    if (promptsSelect && promptsTextarea && promptPageSrc && promptPresetSrc) {
        // Load initial prompt (page)
        const pagePrompt = promptPageSrc.textContent || '';
        const presetPrompt = promptPresetSrc.textContent || '';
        promptsTextarea.value = pagePrompt.trim();
        // Initialize custom select replacement to ensure option styling works across browsers
        try {
            actions.initCustomPromptsSelect(promptsSelect, promptsTextarea, pagePrompt.trim(), presetPrompt.trim());
        }
        catch (err) {
            // Fallback: keep native select behavior
            promptsSelect.addEventListener('change', () => {
                if (promptsSelect.value === 'page') {
                    promptsTextarea.value = pagePrompt.trim();
                }
                else {
                    promptsTextarea.value = presetPrompt.trim();
                }
            });
        }
        promptsCopyBtn?.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(promptsTextarea.value);
                showToast('Prompt copied to clipboard', 'success');
            }
            catch (error) {
                console.error('Copy failed', error);
                showToast('Failed to copy prompt', 'error');
            }
        });
    }
    // Locator save/cancel buttons
    document.getElementById('saveLocatorsBtn')?.addEventListener('click', async () => {
        await actions.saveLocatorChanges();
    });
    document.getElementById('cancelLocatorsBtn')?.addEventListener('click', async () => {
        await actions.loadLocators();
        actions.hideLocatorButtons();
    });
    // Global keyboard shortcuts for modal actions: Enter -> #modalAddBtn, Esc -> #modalCancelBtn
    document.addEventListener('keydown', (e) => {
        // Only act when a modal overlay is visible
        const modalOverlay = document.getElementById('modalOverlay');
        if (!modalOverlay || modalOverlay.style.display === 'none')
            return;
        if (e.key === 'Escape') {
            const cancelBtn = document.getElementById('modalCancelBtn') as HTMLElement | null;
            if (cancelBtn) {
                e.preventDefault();
                cancelBtn.click();
            }
        }
        else if (e.key === 'Enter') {
            // Only trigger Enter when focus is inside an editable element (input, textarea, or contenteditable)
            const active = document.activeElement as HTMLElement | null;
            const isFocusedEditable = !!(active && (['input', 'textarea'].includes(active.tagName.toLowerCase()) || active.getAttribute('contenteditable') === 'true'));
            if (!isFocusedEditable)
                return;
            const addBtn = document.getElementById('modalAddBtn') as HTMLElement | null;
            if (addBtn) {
                e.preventDefault();
                addBtn.click();
            }
        }
    });
    // Pages save/cancel buttons
    document.getElementById('savePagesBtn')?.addEventListener('click', async () => {
        await actions.savePageChanges();
    });
    document.getElementById('cancelPagesBtn')?.addEventListener('click', async () => {
        await actions.loadPages();
        actions.hidePageButtons();
    });
    // Presets save/cancel buttons
    document.getElementById('savePresetsBtn')?.addEventListener('click', async () => {
        await actions.savePresetChanges();
    });
    document.getElementById('cancelPresetsBtn')?.addEventListener('click', async () => {
        await actions.loadPresets();
        actions.hidePresetButtons();
    });
    // Regex patterns save/cancel buttons
    document.getElementById('saveRegexPatternsBtn')?.addEventListener('click', async () => {
        await actions.saveRegexPatternsChanges();
    });
    document.getElementById('cancelRegexPatternsBtn')?.addEventListener('click', async () => {
        // Discard in-memory changes and reload from storage
        state.originalData = null;
        state.hasUnsavedChanges = false;
        await actions.loadRegexPatterns();
        actions.hideRegexPatternsButtons();
    });
    // Length config save/cancel buttons
    document.getElementById('saveLengthConfigBtn')?.addEventListener('click', async () => {
        await actions.saveLengthConfigurationsChanges();
    });
    document.getElementById('cancelLengthConfigBtn')?.addEventListener('click', async () => {
        await actions.loadLengthConfigurations();
        actions.hideLengthConfigButtons();
    });
    // Add regex pattern
    document.getElementById('addRegexPatternBtn')?.addEventListener('click', async () => {
        await actions.showAddRegexPatternModal();
    });
    // Add length configuration
    document.getElementById('addLengthConfigBtn')?.addEventListener('click', async () => {
        await actions.showAddLengthConfigModal();
    });
    // Add page
    document.getElementById('addPageBtn')?.addEventListener('click', async () => {
        await actions.showAddPageModal();
    });
    // Add preset
    document.getElementById('addPresetBtn')?.addEventListener('click', async () => {
        await actions.showAddPresetModal();
    });
    // Export/Import Pages
    document.getElementById('exportPagesBtn')?.addEventListener('click', async () => {
        await actions.exportPages();
    });
    document.getElementById('importPagesBtn')?.addEventListener('click', () => {
        const fileInput = document.getElementById('importPagesFile') as HTMLInputElement;
        fileInput.click();
    });
    document.getElementById('importPagesFile')?.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            await actions.importPages(input.files[0]);
            input.value = '';
        }
    });
    // Export/Import Presets
    document.getElementById('exportPresetsBtn')?.addEventListener('click', async () => {
        await actions.exportPresets();
    });
    document.getElementById('importPresetsBtn')?.addEventListener('click', () => {
        const fileInput = document.getElementById('importPresetsFile') as HTMLInputElement;
        fileInput.click();
    });
    document.getElementById('importPresetsFile')?.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            await actions.importPresets(input.files[0]);
            input.value = '';
        }
    });
    // Export/Import Regex Patterns
    document.getElementById('exportRegexPatternsBtn')?.addEventListener('click', async () => {
        await actions.exportRegexPatterns();
    });
    document.getElementById('importRegexPatternsBtn')?.addEventListener('click', () => {
        const fileInput = document.getElementById('importRegexPatternsFile') as HTMLInputElement;
        fileInput.click();
    });
    document.getElementById('importRegexPatternsFile')?.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            await actions.importRegexPatterns(input.files[0]);
            input.value = '';
        }
    });
    // Export/Import Length Configurations
    document.getElementById('exportLengthConfigBtn')?.addEventListener('click', async () => {
        await actions.exportLengthConfigurations();
    });
    document.getElementById('importLengthConfigBtn')?.addEventListener('click', () => {
        const fileInput = document.getElementById('importLengthConfigFile') as HTMLInputElement;
        fileInput.click();
    });
    document.getElementById('importLengthConfigFile')?.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            await actions.importLengthConfigurations(input.files[0]);
            input.value = '';
        }
    });
    // Export/Import All Settings
    document.getElementById('exportAllBtn')?.addEventListener('click', async () => {
        await actions.exportAllSettings();
    });
    document.getElementById('importAllBtn')?.addEventListener('click', () => {
        const fileInput = document.getElementById('importAllFile') as HTMLInputElement;
        fileInput.click();
    });
    document.getElementById('importAllFile')?.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            await actions.importAllSettings(input.files[0]);
            input.value = '';
        }
    });
    // Section Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = (e.target as HTMLElement).dataset.target;
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    // Account for sticky navigation height
                    const navElement = document.querySelector('.section-nav') as HTMLElement;
                    const navHeight = navElement?.offsetHeight || 0;
                    const offsetTop = targetElement.offsetTop - navHeight - 20; // 20px extra padding
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    // Update filling assistant note visibility
    actions.updateFillingAssistantNoteVisibility();
    // Sortable header event listeners
    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const element = e.target as HTMLElement;
            const column = element.dataset.sort!;
            const grid = element.closest('.data-grid') as HTMLElement;
            const tableId = grid.id.replace('Grid', '');
            actions.handleHeaderClick(tableId, column);
        });
    });
}
