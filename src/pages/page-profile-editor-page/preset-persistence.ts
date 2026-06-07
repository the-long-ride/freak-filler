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

// Export page data (full page profile including presets and saved values)
export async function exportPageData() {
    if (!state.currentPageData)
        return;
    const page = state.currentPageData;
    const presets = await StorageService.getPresetsForPage(page.id);
    const savedValues = await StorageService.getSavedValuesForPage(page.id);
    const data = await StorageService.getData();
    const presetIds = new Set(presets.map(p => p.id));
    const presetPageLinks = (data?.presetPageLinks ?? []).filter(link => link.pageId === page.id && presetIds.has(link.presetId));
    const exportFile = createExportFile({
        included: {
            pages: true,
            presets: true,
            presetPageLinks: true,
            savedValues: true,
        },
        data: {
            pages: [page],
            presets,
            presetPageLinks,
            savedValues,
        },
    });
    const filename = page.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_page_profile.json`);
    showToast('Page profile exported and downloaded', 'success');
}

// Export preset only to JSON
export function exportPresetOnly() {
    const name = (document.getElementById('presetName') as HTMLInputElement).value || 'preset';
    const description = (document.getElementById('presetDescription') as HTMLInputElement).value;
    const exportedAt = getCurrentTimestamp();
    const preset: Preset = {
        id: `export-${generateGuid()}`,
        name,
        description,
        formData: state.formDataList,
        createdAt: exportedAt,
        updatedAt: exportedAt,
    };
    const exportFile = createExportFile({
        included: { presets: true },
        data: { presets: [preset] },
        exportedAt,
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preset.json`);
    showToast('Preset exported and downloaded', 'success');
}

// Import preset from JSON and create new preset
export async function importPresetFromJson(file: File) {
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.presets || !Array.isArray(imported.data.presets) || imported.data.presets.length === 0) {
            showToast('Invalid import file: presets section not included', 'error');
            return;
        }
        if (!state.currentPageData) {
            showToast('No page data available', 'error');
            return;
        }
        // Get current data to check for duplicates
        const data = await StorageService.getData();
        if (!data)
            return;
        let importedCount = 0;
        let ignoredCount = 0;
        let firstImportedPresetId: string | null = null;
        // Process each preset in the import file
        for (const presetToImport of imported.data.presets) {
            // Check if preset already exists with same ID
            const existingPreset = data.presets.find(p => p.id === presetToImport.id);
            if (existingPreset) {
                // Duplicate found, ignore it
                ignoredCount++;
                continue;
            }
            // Create new preset with imported data (ignore exported ids/timestamps)
            const newPreset = await StorageService.addPreset({
                name: presetToImport.name || 'Imported Preset',
                description: presetToImport.description || '',
                formData: (presetToImport.formData || []).map((field: any, index: number) => ({
                    id: generateGuid(),
                    type: field.type || 'text',
                    title: field.title || '',
                    value: field.value || '',
                    testId: field.testId || '',
                    querySelector: field.querySelector || '',
                    fillDelay: field.fillDelay || 0,
                    autoBlur: field.autoBlur ?? true,
                    createdAt: getCurrentTimestamp(),
                    updatedAt: getCurrentTimestamp(),
                    order: index + 1
                }))
            });
            // Link to current page
            await StorageService.linkPresetToPage(newPreset.id, state.currentPageData.id);
            // Track first imported preset for redirect
            if (!firstImportedPresetId) {
                firstImportedPresetId = newPreset.id;
            }
            importedCount++;
        }
        // Show summary notification
        if (importedCount === 0 && ignoredCount > 0) {
            showToast(`All ${ignoredCount} preset(s) already exist (same IDs). If the duplicated ones are owned by another page, try to link them to there. Finally: Import skipped.`, 'info');
        }
        else if (importedCount > 0 && ignoredCount === 0) {
            showToast(`${importedCount} preset(s) imported successfully.`, 'success');
        }
        else if (importedCount > 0 && ignoredCount > 0) {
            showToast(`${importedCount} preset(s) imported, ${ignoredCount} duplicate(s) ignored. If the duplicated ones are owned by another page, try to link them to there.`, 'success');
        }
        // Reload the page with the first imported preset (or just current page if none imported)
        if (firstImportedPresetId) {
            window.location.href = `page-profile-editor.html?pageId=${state.currentPageData.id}&presetId=${firstImportedPresetId}`;
        }
    }
    catch (error) {
        console.error('Import error:', error);
        showToast('Failed to import preset. Please check the file format.', 'error');
    }
}

// Save preset
export async function savePreset() {
    const name = (document.getElementById('presetName') as HTMLInputElement).value;
    const description = (document.getElementById('presetDescription') as HTMLTextAreaElement).value;
    if (!name) {
        showToast('Preset name is required', 'warning');
        return false;
    }
    // Sort form data by order
    state.formDataList.sort((a, b) => a.order - b.order);
    if (!state.currentPageData) {
        showToast('Page data not found', 'error');
        return false;
    }
    if (state.currentPresetId && state.currentPreset) {
        // Update existing preset
        await StorageService.updatePreset(state.currentPresetId, {
            name,
            description,
            formData: state.formDataList
        });
    }
    else {
        // Create new preset
        const newPreset = await StorageService.addPreset({
            name,
            description,
            formData: state.formDataList
        });
        // Link to current page
        await StorageService.linkPresetToPage(newPreset.id, state.currentPageData.id);
    }
    await actions.loadPagePresets(); // Refresh preset list
    return true;
}

// Save all data (preset + saved values)
export async function saveAllData() {
    // Save preset
    const presetSaved = await actions.savePreset();
    if (!presetSaved)
        return;
    // Save saved values
    await actions.saveSavedValues();
    state.hasUnsavedPresetChanges = false;
    state.hasUnsavedSavedValuesChanges = false;
    actions.updateButtonVisibility();
    showToast('All changes saved successfully!', 'success');
}

// Save saved values
export async function saveSavedValues() {
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
}
