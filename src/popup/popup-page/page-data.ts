import { StorageService } from '../../services/storage.service';
import { FormFieldData, PageData } from '../../types';
import { generateGuid, getCurrentTimestamp, generateRandomString, getCharacterSet } from '../../utils/helpers';
import { downloadFile, initTheme, initVersion } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initIconReplacement } from '../../utils/icon-replacer';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { showModal, hideModal } from '../../utils/modal-utils';
import { initGuideOverlays } from '../../utils/guide-overlay';
import { actions, state } from './context';

// Load page data
export async function loadPageData() {
    state.currentPageData = await StorageService.getCurrentPageData(state.currentUrl);
    const pageSection = document.getElementById('pageSection') as HTMLElement;
    const noPageContent = document.getElementById('noPageContent') as HTMLElement;
    const hasPageContent = document.getElementById('hasPageContent') as HTMLElement;
    const mainContent = document.getElementById('mainContent') as HTMLElement;
    if (!state.currentPageData) {
        pageSection.querySelector('.section-title')?.setAttribute('style', 'display: none;');
        noPageContent.style.display = 'block';
        hasPageContent.style.display = 'none';
        mainContent.innerHTML = '';
        mainContent.style.display = 'none';
        actions.setupNoPageActions();
    }
    else {
        pageSection.querySelector('.section-title')?.setAttribute('style', 'display: block;');
        noPageContent.style.display = 'none';
        hasPageContent.style.display = 'block';
        mainContent.style.display = 'block';
        // Update page info display
        actions.updatePageInfoDisplay();
        // Show page management (presets)
        actions.showPageManagement(mainContent);
    }
}

// Setup actions for when no page data exists
export function setupNoPageActions() {
    // Create New Profile button
    document.getElementById('createNewPageBtn')?.addEventListener('click', () => {
        actions.showCreatePageModal();
    });
    // Clone from Existing button
    document.getElementById('cloneFromExistingBtn')?.addEventListener('click', () => {
        actions.showClonePageModal();
    });
    // Import Page Profile button
    document.getElementById('importPageProfileBtn')?.addEventListener('click', () => {
        const importInput = document.getElementById('importPageFile') as HTMLInputElement;
        importInput.click();
    });
    // Setup import file handler
    const importInput = document.getElementById('importPageFile') as HTMLInputElement;
    importInput.addEventListener('change', actions.handleImportFile);
}

// Update page info display
export function updatePageInfoDisplay() {
    if (!state.currentPageData)
        return;
    const pageTitleEl = document.getElementById('pageTitle');
    const pageUrlEl = document.getElementById('pageUrl');
    const urlIdentifyEl = document.getElementById('urlIdentify');
    const pageDescEl = document.getElementById('pageDescription');
    if (pageTitleEl)
        pageTitleEl.textContent = state.currentPageData.pageTitle;
    if (pageUrlEl)
        pageUrlEl.textContent = state.currentPageData.url;
    if (urlIdentifyEl)
        urlIdentifyEl.textContent = state.currentPageData.matchIdentify === 'exactMatch' ? 'exact match' : 'prefix match';
    if (pageDescEl)
        pageDescEl.textContent = state.currentPageData.description || '-';
    // Setup page action buttons
    actions.setupPageActionButtons();
}

// Setup page action buttons
export function setupPageActionButtons() {
    document.getElementById('editPageBtn')?.addEventListener('click', () => {
        if (!state.currentPageData)
            return;
        // Open page-profile-editor directly
        window.open(`page-profile-editor.html?pageId=${encodeURIComponent(state.currentPageData.id)}`, '_blank');
    });
    // Scan form data functionality is now in preset section as scanFormDataBtnPreset
    document.getElementById('exportPageBtn')?.addEventListener('click', async () => {
        if (!state.currentPageData)
            return;
        const data = await StorageService.getData();
        if (!data)
            return;
        // Get presets for this page
        const presets = await StorageService.getPresetsForPage(state.currentPageData!.id);
        // Get saved values for this page
        const savedValues = data.savedValues.filter(sv => sv.pageId === state.currentPageData!.id);
        const presetIds = new Set(presets.map(p => p.id));
        const presetPageLinks = data.presetPageLinks.filter(l => l.pageId === state.currentPageData!.id && presetIds.has(l.presetId));
        const exportFile = createExportFile({
            included: {
                pages: true,
                presets: true,
                presetPageLinks: true,
                savedValues: true,
            },
            data: {
                pages: [state.currentPageData],
                presets,
                presetPageLinks,
                savedValues,
            },
        });
        downloadFile(JSON.stringify(exportFile, null, 2), `form-filler-${state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_')}.json`);
        try {
            const fileName = `form-filler-${state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
            actions.showNotification(`Exported page data to ${fileName}`);
        }
        catch (error) {
            console.error('Failed to show export notification:', error);
        }
    });
}
