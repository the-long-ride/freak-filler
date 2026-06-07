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

// Export regex patterns to JSON file
export async function exportRegexPatterns() {
    const data = await StorageService.getData();
    if (!data || data.regexPatterns.length === 0) {
        showToast('No regex patterns to export', 'info');
        return;
    }
    const exportFile = createExportFile({
        included: { regexPatterns: true },
        data: { regexPatterns: data.regexPatterns }
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `regex-patterns-export-${Date.now()}.json`);
    showToast('Regex patterns exported and downloaded', 'success');
}

// Import regex patterns from JSON file
export async function importRegexPatterns(file: File) {
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.regexPatterns || !Array.isArray(imported.data.regexPatterns)) {
            showToast('Invalid import file: regex patterns section not included', 'error');
            return;
        }
        const data = await StorageService.getData();
        if (!data)
            return;
        let addedCount = 0;
        let skippedIdCount = 0;
        let skippedDuplicateCount = 0;
        for (const pattern of imported.data.regexPatterns) {
            // Check if pattern already exists with same name
            const existingByName = data.regexPatterns.find(p => p.name === pattern.name);
            if (existingByName) {
                skippedDuplicateCount++;
                continue;
            }
            // Add new pattern
            data.regexPatterns.push({ ...pattern });
            addedCount++;
        }
        await StorageService.setData(data);
        await actions.loadRegexPatterns();
        let message = `Added ${addedCount} regex patterns`;
        if (skippedIdCount > 0)
            message += `, skipped ${skippedIdCount} with existing IDs`;
        if (skippedDuplicateCount > 0)
            message += `, skipped ${skippedDuplicateCount} duplicates`;
        showToast(message, 'success');
    }
    catch (error) {
        console.error('Import regex patterns error:', error);
        showToast('Failed to import regex patterns. Please check the file format.', 'error');
    }
}

// Export length configurations to JSON file
export async function exportLengthConfigurations() {
    const data = await StorageService.getData();
    if (!data || data.lengthConfigurations.length === 0) {
        showToast('No length configurations to export', 'info');
        return;
    }
    const exportFile = createExportFile({
        included: { lengthConfigurations: true },
        data: { lengthConfigurations: data.lengthConfigurations }
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `length-configurations-export-${Date.now()}.json`);
    showToast('Length configurations exported and downloaded', 'success');
}

// Import length configurations from JSON file
export async function importLengthConfigurations(file: File) {
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.lengthConfigurations || !Array.isArray(imported.data.lengthConfigurations)) {
            showToast('Invalid import file: length configurations section not included', 'error');
            return;
        }
        const data = await StorageService.getData();
        if (!data)
            return;
        let addedCount = 0;
        let skippedDuplicateCount = 0;
        for (const config of imported.data.lengthConfigurations) {
            // Check if configuration already exists with same name
            const existingByName = data.lengthConfigurations.find(c => c.name === config.name);
            if (existingByName) {
                skippedDuplicateCount++;
                continue;
            }
            // Add new configuration
            data.lengthConfigurations.push({ ...config });
            addedCount++;
        }
        await StorageService.setData(data);
        await actions.loadLengthConfigurations();
        let message = `Added ${addedCount} length configurations`;
        if (skippedDuplicateCount > 0)
            message += `, skipped ${skippedDuplicateCount} duplicates`;
        showToast(message, 'success');
    }
    catch (error) {
        console.error('Import length configurations error:', error);
        showToast('Failed to import length configurations. Please check the file format.', 'error');
    }
}

// Export all settings data
export async function exportAllSettings() {
    const data = await StorageService.getData();
    if (!data) {
        showToast('Failed to load data', 'error');
        return;
    }
    const settings = await StorageService.getSettings();
    const exportFile = createExportFile({
        included: {
            settings: true,
            pages: true,
            presets: true,
            presetPageLinks: true,
            savedValues: true,
            regexPatterns: true,
            lengthConfigurations: true,
        },
        settings: settings,
        data: data,
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `form-filler-backup-${Date.now()}.json`);
    showToast('All settings exported successfully', 'success');
}

// Import all settings data
export async function importAllSettings(file: File) {
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        const includesAll = imported.included.settings
            && imported.included.pages
            && imported.included.presets
            && imported.included.presetPageLinks
            && imported.included.savedValues
            && imported.included.regexPatterns
            && imported.included.lengthConfigurations;
        if (!includesAll) {
            showToast('Invalid backup file: must include settings + all data sections', 'error');
            return;
        }
        // Confirm with user before overwriting
        const confirmed = confirm('This will replace ALL current data including pages, presets, saved values, regex patterns, and length configurations. Continue?');
        if (!confirmed) {
            return;
        }
        // Import settings + data
        await StorageService.setSettings(imported.settings);
        await StorageService.setData(imported.data);
        // Reload the page to reflect changes
        showToast('All settings imported successfully. Page will reload.', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    catch (error) {
        console.error('Import all settings error:', error);
        showToast('Failed to import settings. Please check the file format.', 'error');
    }
}
