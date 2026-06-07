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

// Save locator changes
export async function saveLocatorChanges() {
    const data = await StorageService.getData();
    if (!data)
        return;
    let locatorUpdates: Array<{
        oldKey: string;
        newTestId: string;
        newSelector: string;
    }> = [];
    // Collect locator changes
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
        await StorageService.setData(data);
        showToast(`Updated ${locatorUpdates.length} locator(s)`, 'success');
        actions.hideLocatorButtons();
    }
}

// Save regex patterns changes
export async function saveRegexPatternsChanges() {
    // Persist in-memory changes if present, otherwise read from storage
    const data = state.originalData ?? await StorageService.getData();
    if (!data)
        return;
    let errors: string[] = [];
    // Collect regex pattern changes
    const regexPatternsBody = document.getElementById('regexPatternsTableBody');
    if (regexPatternsBody) {
        const rows = regexPatternsBody.querySelectorAll('.data-grid-row');
        rows.forEach((row, index) => {
            const name = (row.querySelector('.regex-pattern-name') as HTMLInputElement).value.trim();
            const regex = (row.querySelector('.regex-pattern-regex') as HTMLInputElement).value.trim();
            // Validate
            if (!name) {
                errors.push(`Pattern ${index + 1}: Name is required`);
            }
            if (!regex) {
                errors.push(`Pattern ${index + 1}: Regex is required`);
            }
            // Update data
            if (data.regexPatterns[index]) {
                data.regexPatterns[index].name = name;
                data.regexPatterns[index].regex = regex;
            }
        });
    }
    if (errors.length > 0) {
        showToast(`Validation errors:\n${errors.join('\n')}`, 'error');
        return;
    }
    await StorageService.setData(data);
    showToast('Regex patterns updated successfully', 'success');
    // Clear in-memory changes tracking after save
    state.originalData = null;
    state.hasUnsavedChanges = false;
    actions.hideRegexPatternsButtons();
}

// Save length configurations changes
export async function saveLengthConfigurationsChanges() {
    const data = await StorageService.getData();
    if (!data)
        return;
    let errors: string[] = [];
    // Collect length configuration changes
    const lengthConfigBody = document.getElementById('lengthConfigTableBody');
    if (lengthConfigBody) {
        const rows = lengthConfigBody.querySelectorAll('.data-grid-row');
        rows.forEach((row, index) => {
            const name = (row.querySelector('.length-config-name') as HTMLInputElement).value.trim();
            const description = (row.querySelector('.length-config-description') as HTMLInputElement).value.trim();
            const locator = (row.querySelector('.length-config-locator') as HTMLInputElement).value.trim();
            const maxLength = parseInt((row.querySelector('.length-config-max-length') as HTMLInputElement).value);
            // Validate
            if (!name) {
                errors.push(`Configuration ${index + 1}: Name is required`);
            }
            if (!locator) {
                errors.push(`Configuration ${index + 1}: Locator is required`);
            }
            if (isNaN(maxLength) || maxLength < 1) {
                errors.push(`Configuration ${index + 1}: Max length must be a positive number`);
            }
            // Update data
            if (data.lengthConfigurations[index]) {
                data.lengthConfigurations[index].name = name;
                data.lengthConfigurations[index].description = description;
                data.lengthConfigurations[index].locator = locator;
                data.lengthConfigurations[index].maxLength = maxLength;
            }
        });
    }
    if (errors.length > 0) {
        showToast(`Validation errors:\n${errors.join('\n')}`, 'error');
        return;
    }
    await StorageService.setData(data);
    showToast('Length configurations updated successfully', 'success');
    actions.hideLengthConfigButtons();
}

// Handle delete regex pattern
export async function handleDeleteRegexPattern(indexStr: string) {
    const index = parseInt(indexStr);
    const data = await StorageService.getData();
    if (!data || !data.regexPatterns[index])
        return;
    const pattern = data.regexPatterns[index];
    const confirmed = await showConfirm('Delete Regex Pattern', `Delete "${pattern.name}"? This cannot be undone.`);
    if (!confirmed)
        return;
    // Remove pattern
    data.regexPatterns.splice(index, 1);
    await StorageService.setData(data);
    await actions.loadRegexPatterns();
    showToast('Regex pattern deleted successfully', 'success');
}

// Handle delete length configuration
export async function handleDeleteLengthConfig(indexStr: string) {
    const index = parseInt(indexStr);
    const data = await StorageService.getData();
    if (!data || !data.lengthConfigurations[index])
        return;
    const config = data.lengthConfigurations[index];
    const confirmed = await showConfirm('Delete Length Configuration', `Delete "${config.name}"? This cannot be undone.`);
    if (!confirmed)
        return;
    // Remove configuration
    data.lengthConfigurations.splice(index, 1);
    await StorageService.setData(data);
    await actions.loadLengthConfigurations();
    showToast('Length configuration deleted successfully', 'success');
}

// Save page changes
export async function savePageChanges() {
    const data = await StorageService.getData();
    if (!data)
        return;
    let errors: string[] = [];
    const urlMap = new Map<string, string>();
    // Validate and save pages
    const pagesBody = document.getElementById('pagesTableBody');
    if (pagesBody) {
        const rows = pagesBody.querySelectorAll('.data-grid-row');
        // Build a map of original keys for all pages
        const originalKeyMap = new Map<string, string>();
        data.pages.forEach(page => {
            const key = `${page.url}|${page.matchIdentify}`;
            originalKeyMap.set(page.id, key);
        });
        rows.forEach(row => {
            const pageId = (row as HTMLElement).dataset.pageId!;
            const title = (row.querySelector('.page-title') as HTMLInputElement).value.trim();
            const url = (row.querySelector('.page-url') as HTMLInputElement).value.trim();
            const description = (row.querySelector('.page-description') as HTMLTextAreaElement).value.trim();
            const owner = (row.querySelector('.page-owner') as HTMLInputElement).value.trim();
            const matchIdentifyElement = row.querySelector('.page-match') as HTMLSelectElement;
            const matchIdentify = (matchIdentifyElement?.value || 'prefixMatch') as 'exactMatch' | 'prefixMatch';
            // Validate
            if (!title) {
                errors.push(`Page ${pageId}: Title is required`);
            }
            if (!url) {
                errors.push(`Page ${pageId}: URL is required`);
            }
            // Remove the old key for this page (if any) before checking for duplicates
            const oldKey = originalKeyMap.get(pageId);
            if (oldKey && urlMap.get(oldKey) === pageId) {
                urlMap.delete(oldKey);
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
    if (errors.length > 0) {
        showToast(errors.join('\n'), 'error');
        return;
    }
    await StorageService.setData(data);
    await actions.loadPages();
    showToast('Pages saved successfully', 'success');
    actions.hidePageButtons();
}

// Save preset changes
export async function savePresetChanges() {
    const data = await StorageService.getData();
    if (!data)
        return;
    let errors: string[] = [];
    const nameMap = new Set<string>();
    // Validate and save presets
    const presetsBody = document.getElementById('presetsTableBody');
    if (presetsBody) {
        const rows = presetsBody.querySelectorAll('.data-grid-row');
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
    await StorageService.setData(data);
    await actions.loadPresets();
    showToast('Presets saved successfully', 'success');
    actions.hidePresetButtons();
}
