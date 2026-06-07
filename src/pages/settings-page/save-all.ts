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

// Save all changes
export async function saveAllChanges() {
    const data = await StorageService.getData();
    if (!data)
        return;
    let errors: string[] = [];
    let locatorUpdates: Array<{
        oldKey: string;
        newTestId: string;
        newSelector: string;
    }> = [];
    // Validate and collect locator changes
    const locatorsBody = document.getElementById('locatorsTableBody');
    if (locatorsBody) {
        const rows = locatorsBody.querySelectorAll('tr[data-locator-key]');
        rows.forEach(row => {
            const oldKey = (row as HTMLElement).dataset.locatorKey!;
            const [oldTestId, oldSelector] = oldKey.split('|');
            const newTestId = (row.querySelector('.locator-testid') as HTMLInputElement).value.trim();
            const newSelector = (row.querySelector('.locator-selector') as HTMLInputElement).value.trim();
            // If changed, add to update list
            if (oldTestId !== newTestId || oldSelector !== newSelector) {
                locatorUpdates.push({ oldKey, newTestId, newSelector });
            }
        });
    }
    // Validate and save pages
    const pagesBody = document.getElementById('pagesTableBody');
    if (pagesBody) {
        const rows = pagesBody.querySelectorAll('tr[data-page-id]');
        const urlMap = new Map<string, string>();
        rows.forEach(row => {
            const pageId = (row as HTMLElement).dataset.pageId!;
            const title = (row.querySelector('.page-title') as HTMLInputElement).value.trim();
            const url = (row.querySelector('.page-url') as HTMLInputElement).value.trim();
            const description = (row.querySelector('.page-description') as HTMLTextAreaElement).value.trim();
            const owner = (row.querySelector('.page-owner') as HTMLInputElement).value.trim();
            const matchIdentify = (row.querySelector('.page-match') as HTMLSelectElement).value as 'exactMatch' | 'prefixMatch';
            // Validate
            if (!title) {
                errors.push(`Page ${pageId}: Title is required`);
            }
            if (!url) {
                errors.push(`Page ${pageId}: URL is required`);
            }
            // Check duplicates
            const key = `${url}|${matchIdentify}`;
            if (urlMap.has(key) && urlMap.get(key) !== pageId) {
                errors.push(`Duplicate page with URL "${url}" and same match type`);
            }
            urlMap.set(key, pageId);
            // Update page
            const page = data.pages.find(p => p.id === pageId);
            if (page) {
                page.pageTitle = title;
                page.url = url;
                page.description = description;
                page.owner = owner;
                page.matchIdentify = matchIdentify;
                page.updatedAt = getCurrentTimestamp();
            }
        });
    }
    // Validate and save presets
    const presetsBody = document.getElementById('presetsTableBody');
    if (presetsBody) {
        const rows = presetsBody.querySelectorAll('tr[data-preset-id]');
        const nameMap = new Set<string>();
        rows.forEach(row => {
            const presetId = (row as HTMLElement).dataset.presetId!;
            const name = (row.querySelector('.preset-card-name') as HTMLInputElement).value.trim();
            const description = (row.querySelector('.preset-card-description') as HTMLTextAreaElement).value.trim();
            // Validate
            if (!name) {
                errors.push(`Preset ${presetId}: Name is required`);
            }
            // Check duplicates
            const preset = data.presets.find(p => p.id === presetId);
            if (preset) {
                const otherPresetWithSameName = data.presets.find(p => p.id !== presetId && p.name === name);
                if (otherPresetWithSameName) {
                    errors.push(`Duplicate preset name: "${name}"`);
                }
                // Update preset
                preset.name = name;
                preset.description = description;
                preset.updatedAt = getCurrentTimestamp();
            }
        });
    }
    if (errors.length > 0) {
        showToast(errors.join('\n'), 'error');
        return;
    }
    // Apply locator updates to all presets and saved values
    if (locatorUpdates.length > 0) {
        locatorUpdates.forEach(update => {
            const [oldTestId, oldSelector] = update.oldKey.split('|');
            // Update in all presets
            data.presets.forEach(preset => {
                preset.formData.forEach(field => {
                    if (field.testId === oldTestId && field.querySelector === oldSelector) {
                        field.testId = update.newTestId;
                        field.querySelector = update.newSelector;
                        field.updatedAt = getCurrentTimestamp();
                    }
                });
            });
            // Update in saved values
            data.savedValues.forEach(sv => {
                if (sv.testId === oldTestId && sv.querySelector === oldSelector) {
                    sv.testId = update.newTestId;
                    sv.querySelector = update.newSelector;
                    sv.updatedAt = getCurrentTimestamp();
                }
            });
        });
    }
    // Save data
    await StorageService.setData(data);
    // Save settings
    const enableLiveAssistant = (document.getElementById('enableLiveAssistant') as HTMLInputElement).checked;
    const enableSaveValue = (document.getElementById('enableSaveValue') as HTMLInputElement).checked;
    const enableImportValue = (document.getElementById('enableImportValue') as HTMLInputElement).checked;
    const enableLocatorRetriever = (document.getElementById('enableLocatorRetriever') as HTMLInputElement).checked;
    const enableRegexPattern = (document.getElementById('enableRegexPattern') as HTMLInputElement).checked;
    const currentSettings = await StorageService.getSettings();
    if (!currentSettings)
        return;
    await StorageService.setSettings({
        ...currentSettings,
        enableLiveAssistant,
        enableSaveValue,
        enableImportValue,
        enableLocatorRetriever,
        enableRegexPattern,
        defaultSaveItemTo: currentSettings.defaultSaveItemTo ?? 'savedValues',
        enableRandomStringSectionInPopup: currentSettings.enableRandomStringSectionInPopup ?? true,
        randomStringCharset: currentSettings.randomStringCharset ?? 'alphanumeric',
        randomStringLength: currentSettings.randomStringLength ?? DEFAULTS.RANDOM_STRING_LENGTH
    });
    state.hasUnsavedChanges = false;
    const footer = document.getElementById('settingsFooter');
    if (footer)
        footer.style.display = 'none';
    showToast('All changes saved successfully!', 'success');
}
