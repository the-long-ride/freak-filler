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

// Setup event listeners
export function setupEventListeners() {
    // Preset selector change
    document.getElementById('presetSelector')?.addEventListener('change', async (e) => {
        const select = e.target as HTMLSelectElement;
        const newPresetId = select.value;
        if (newPresetId === state.currentPresetId)
            return;
        // Warn if there are unsaved preset changes (saved-values edits shouldn't block switching presets)
        if (state.hasUnsavedPresetChanges) {
            if (!await showConfirm('Unsaved Changes', 'You have unsaved preset changes. Do you want to discard them and switch preset?')) {
                select.value = state.currentPresetId || '';
                return;
            }
        }
        if (state.currentPageData) {
            if (newPresetId) {
                // Switch to existing preset
                window.location.href = `page-profile-editor.html?pageId=${state.currentPageId}&presetId=${newPresetId}`;
            }
            else {
                // Create new preset
                window.location.href = `page-profile-editor.html?pageId=${state.currentPageId}`;
            }
            return;
        }
        // Preset-only mode navigation
        if (newPresetId) {
            window.location.href = `page-profile-editor.html?presetId=${newPresetId}`;
        }
        else {
            window.location.href = 'page-profile-editor.html';
        }
    });
    // Preset name/description change tracking
    document.getElementById('presetName')?.addEventListener('input', () => {
        actions.updatePresetButtons();
    });
    document.getElementById('presetDescription')?.addEventListener('input', () => {
        actions.updatePresetButtons();
    });
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = (e.target as HTMLElement).closest('.tab-btn')?.getAttribute('data-tab');
            if (targetTab)
                actions.switchTab(targetTab);
        });
    });
    if (state.currentPageData) {
        // Add saved value button
        document.getElementById('addSavedValueBtn')?.addEventListener('click', () => {
            actions.addSavedValueRow();
            // Scroll saved values container to bottom after row rendered
            setTimeout(() => {
                const tbody = document.getElementById('savedValuesBody');
                if (!tbody)
                    return;
                // Find nearest table container
                const container = tbody.closest('.table-container') as HTMLElement | null;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
                else {
                    // fallback: scroll the table itself
                    const table = document.getElementById('savedValuesTable');
                    if (table)
                        table.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 50);
        });
        // Export/import saved values
        document.getElementById('exportSavedValuesBtn')?.addEventListener('click', async () => {
            await actions.exportSavedValues();
        });
        // Sidebar Link Presets button (link presets to current page)
        document.getElementById('linkPresetsBtn')?.addEventListener('click', () => {
            actions.showLinkPresetsToPageModal();
        });
        document.getElementById('importSavedValuesBtn')?.addEventListener('click', () => {
            const fileInput = document.getElementById('importSavedValuesFile') as HTMLInputElement;
            fileInput.click();
        });
        document.getElementById('importSavedValuesFile')?.addEventListener('change', async (e) => {
            const input = e.target as HTMLInputElement;
            if (input.files && input.files[0]) {
                await actions.importSavedValues(input.files[0]);
                input.value = '';
            }
        });
    }
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.close();
    });
    document.getElementById('addFormDataBtn')?.addEventListener('click', () => {
        actions.addFormDataRow();
    });
    // Preset tab buttons
    document.getElementById('savePresetBtn')?.addEventListener('click', async () => {
        await actions.savePresetData();
    });
    document.getElementById('rollbackPresetBtn')?.addEventListener('click', async () => {
        if (await showConfirm('Rollback Changes', 'Are you sure? Unsaved changes will be lost.')) {
            actions.resetPresetData();
        }
    });
    document.getElementById('deletePresetBtn')?.addEventListener('click', async () => {
        await actions.deleteCurrentPreset();
        // Reload current page to reset state
        if (state.currentPageData) {
            window.location.href = `page-profile-editor.html?pageId=${state.currentPageData.id}`;
        }
        else {
            window.location.href = `./html/settings.html`;
        }
    });
    // Saved values tab buttons
    if (state.currentPageData) {
        document.getElementById('saveSavedValuesBtn')?.addEventListener('click', async () => {
            await actions.saveSavedValuesData();
        });
        document.getElementById('rollbackSavedValuesBtn')?.addEventListener('click', async () => {
            if (await showConfirm('Rollback Changes', 'Are you sure? Unsaved changes will be lost.')) {
                actions.resetSavedValuesData();
                // Ensure buttons hide after rollback
                actions.updateSavedValuesButtons();
            }
        });
        document.getElementById('saveBtn')?.addEventListener('click', async () => {
            await actions.savePageProfile();
        });
        document.getElementById('cancelBtn')?.addEventListener('click', async () => {
            if (await showConfirm('Cancel Changes', 'Are you sure? Unsaved changes will be lost.')) {
                actions.resetPageProfile();
            }
        });
        document.getElementById('exportBtn')?.addEventListener('click', async () => {
            await actions.exportPageData();
        });
    }
    // New preset import/export buttons
    document.getElementById('exportPresetJsonBtn')?.addEventListener('click', async () => {
        await actions.showPresetExportSelectionModal();
    });
    document.getElementById('importPresetJsonBtn')?.addEventListener('click', () => {
        const fileInput = document.getElementById('importPresetFile') as HTMLInputElement;
        fileInput.click();
    });
    document.getElementById('importPresetFile')?.addEventListener('change', async (e) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            await actions.importPresetFromJson(input.files[0]);
            input.value = ''; // Reset file input
        }
    });
    document.getElementById('linkPresetToPagesBtn')?.addEventListener('click', () => {
        actions.showLinkPresetToPagesModal();
    });
    // Settings button (open settings page in new tab)
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        try {
            chrome.tabs.create({ url: chrome.runtime.getURL('./html/settings.html') });
        }
        catch (e) {
            // Fallback for contexts where chrome.tabs might not be available
            window.open('./html/settings.html', '_blank');
        }
    });
}
