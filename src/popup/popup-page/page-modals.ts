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

// Handle import file
export async function handleImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0)
        return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target?.result as string;
            const importedData = parseExtensionExportJson(content);
            const data = await StorageService.getData();
            if (!data)
                return;
            const duplicates: string[] = [];
            let pageSkipped = false;
            let presetsSkipped = 0;
            let savedValuesSkipped = 0;
            if (!importedData.included.pages || importedData.data.pages.length === 0) {
                actions.showNotification('Failed to import: pages section not included in file.');
                return;
            }
            const pageData = importedData.data.pages[0];
            // Check if page already exists (by currentUrl + matchIdentify)
            const existingPage = data.pages.find(p => p.url === state.currentUrl && p.matchIdentify === (pageData.matchIdentify ?? 'prefixMatch'));
            let targetPageId: string;
            if (existingPage) {
                duplicates.push(`Page: ${pageData.pageTitle}`);
                targetPageId = existingPage.id;
                pageSkipped = true;
            }
            else {
                // Import the page data
                const newPage = await StorageService.addPage({
                    pageTitle: pageData.pageTitle || 'Imported Page',
                    url: state.currentUrl,
                    description: pageData.description || '',
                    owner: pageData.owner || '',
                    matchIdentify: pageData.matchIdentify ?? 'prefixMatch'
                });
                targetPageId = newPage.id;
            }
            // Import presets
            if (importedData.included.presets && Array.isArray(importedData.data.presets)) {
                for (const preset of importedData.data.presets) {
                    const existingPreset = data.presets.find(p => (preset.id && p.id === preset.id) || p.name === preset.name);
                    if (existingPreset) {
                        duplicates.push(`Preset: ${preset.name}`);
                        presetsSkipped++;
                        // Link existing preset to page if not already linked
                        const linkExists = data.presetPageLinks.some(l => l.presetId === existingPreset.id && l.pageId === targetPageId);
                        if (!linkExists) {
                            await StorageService.linkPresetToPage(existingPreset.id, targetPageId);
                        }
                    }
                    else {
                        const newPreset = await StorageService.addPreset({
                            name: preset.name || 'Imported Preset',
                            description: preset.description || '',
                            formData: preset.formData || []
                        });
                        await StorageService.linkPresetToPage(newPreset.id, targetPageId);
                    }
                }
            }
            // Import saved values
            if (importedData.included.savedValues && Array.isArray(importedData.data.savedValues)) {
                const refreshedData = await StorageService.getData();
                if (refreshedData) {
                    for (const savedValue of importedData.data.savedValues) {
                        const existingSavedValue = refreshedData.savedValues.find(sv => sv.pageId === targetPageId
                            && sv.testId === savedValue.testId
                            && sv.querySelector === savedValue.querySelector);
                        if (existingSavedValue) {
                            duplicates.push(`Saved Value: ${savedValue.label}`);
                            savedValuesSkipped++;
                        }
                        else {
                            refreshedData.savedValues.push({
                                ...savedValue,
                                id: generateGuid(),
                                pageId: targetPageId,
                                createdAt: getCurrentTimestamp(),
                                updatedAt: getCurrentTimestamp()
                            });
                        }
                    }
                    await StorageService.setData(refreshedData);
                }
            }
            let message = 'Page profile imported successfully!';
            if (duplicates.length > 0) {
                message += `<br><br>Duplicates skipped (${duplicates.length}):<br>` + duplicates.slice(0, 10).join('<br>');
                if (duplicates.length > 10) {
                    message += `<br>... and ${duplicates.length - 10} more`;
                }
            }
            actions.showNotification(message, async () => {
                await actions.loadPageData();
            });
        }
        catch (error) {
            console.error('Import error:', error);
            actions.showNotification('Failed to import page profile. Please check the file format.');
        }
    };
    reader.readAsText(file);
    input.value = ''; // Reset input
}

// Show create page modal
export function showCreatePageModal() {
    const bodyContent = `
    <div class="form-group">
      <label for="newPageTitle">Page Title *</label>
      <input type="text" id="newPageTitle" value="${state.currentTabTitle}" required />
    </div>
    <div class="form-group">
      <label for="newPageUrl">URL *</label>
      <input type="text" id="newPageUrl" value="${state.currentUrl}" required />
    </div>
    <div class="form-group">
      <label for="newMatchIdentify">URL Match Type</label>
      <select id="newMatchIdentify" class="match-select">
      <option value="prefixMatch" selected>Prefix Match</option>
      <option value="exactMatch">Exact Match</option>
      </select>
    </div>
    <div class="form-group">
      <label for="newPageDescription">Description</label>
      <textarea id="newPageDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-group">
      <label for="newPageOwner">Owner</label>
      <input type="text" id="newPageOwner" placeholder="Optional owner name" />
    </div>
    <div class="form-actions">
      <button id="cancelNewPageBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="saveNewPageBtn" class="cyber-btn">Create Profile
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Create New Page Profile', bodyContent);
    document.getElementById('saveNewPageBtn')?.addEventListener('click', async () => {
        const pageTitle = (document.getElementById('newPageTitle') as HTMLInputElement).value;
        const pageUrl = (document.getElementById('newPageUrl') as HTMLInputElement).value;
        const pageDescription = (document.getElementById('newPageDescription') as HTMLTextAreaElement).value;
        const pageOwner = (document.getElementById('newPageOwner') as HTMLInputElement).value;
        const matchIdentify = (document.getElementById('newMatchIdentify') as HTMLSelectElement).value as 'exactMatch' | 'prefixMatch';
        if (!pageTitle || !pageUrl) {
            actions.showNotification('Page title and URL are required');
            return;
        }
        await StorageService.addPage({
            pageTitle,
            url: pageUrl,
            description: pageDescription,
            owner: pageOwner,
            matchIdentify
        });
        hideModal();
        await actions.loadPageData();
    });
    document.getElementById('cancelNewPageBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Show clone page modal
export async function showClonePageModal() {
    const data = await StorageService.getData();
    const pages = data?.pages || [];
    if (pages.length === 0) {
        actions.showNotification('No existing pages to clone from. Please create a new page first.');
        return;
    }
    const bodyContent = `
    <div class="form-group">
      <label for="sourcePageSelect">Select source page to clone:</label>
      <select id="sourcePageSelect">
        <option value="">-- Select a page --</option>
        ${pages.map(page => `<option value="${page.id}">${page.pageTitle} (${page.url})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="clonePageTitle">New Page Title *</label>
      <input type="text" id="clonePageTitle" placeholder="Enter a name for this page" value="${state.currentTabTitle}" required />
    </div>
    <div class="form-group">
      <label for="clonePageUrl">URL *</label>
      <input type="text" id="clonePageUrl" value="${state.currentUrl}" required />
    </div>
    <div class="form-group">
      <label for="cloneMatchIdentify">URL Match Type</label>
      <select id="cloneMatchIdentify" class="match-select">
        <option value="prefixMatch" selected>Prefix Match</option>
        <option value="exactMatch">Exact Match</option>
      </select>
    </div>
    <div class="form-group">
      <label for="clonePageDescription">Description</label>
      <textarea id="clonePageDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-group">
      <label for="clonePageOwner">Owner</label>
      <input type="text" id="clonePageOwner" placeholder="Optional owner name" />
    </div>
    <div class="form-actions">
      <button id="cancelCloneBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="confirmCloneBtn" class="cyber-btn">Clone Profile
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Clone from Existing Page', bodyContent);
    document.getElementById('confirmCloneBtn')?.addEventListener('click', async () => {
        const sourcePageId = (document.getElementById('sourcePageSelect') as HTMLSelectElement).value;
        const newTitle = (document.getElementById('clonePageTitle') as HTMLInputElement).value;
        const newUrl = (document.getElementById('clonePageUrl') as HTMLInputElement).value;
        const newDescription = (document.getElementById('clonePageDescription') as HTMLTextAreaElement).value;
        const newOwner = (document.getElementById('clonePageOwner') as HTMLInputElement).value;
        const matchIdentify = (document.getElementById('cloneMatchIdentify') as HTMLSelectElement).value as 'exactMatch' | 'prefixMatch';
        if (!sourcePageId) {
            actions.showNotification('Please select a source page');
            return;
        }
        if (!newTitle || !newUrl) {
            actions.showNotification('Page title and URL are required');
            return;
        }
        const sourcePage = pages.find(p => p.id === sourcePageId);
        if (!sourcePage) {
            actions.showNotification('Source page not found');
            return;
        }
        // Create new page with new settings
        const newPage = await StorageService.addPage({
            pageTitle: newTitle,
            url: newUrl,
            description: newDescription || sourcePage.description || '',
            owner: newOwner || sourcePage.owner || '',
            matchIdentify: matchIdentify
        });
        // Clone presets if any
        const sourcePresets = await StorageService.getPresetsForPage(sourcePage.id);
        if (sourcePresets && sourcePresets.length > 0) {
            for (const preset of sourcePresets) {
                // Create new preset and link to new page
                const newPreset = await StorageService.addPreset({
                    name: preset.name,
                    description: preset.description || '',
                    formData: preset.formData || []
                });
                await StorageService.linkPresetToPage(newPreset.id, newPage.id);
            }
        }
        hideModal();
        actions.showNotification('Page profile cloned successfully!', async () => {
            await actions.loadPageData();
        });
    });
    document.getElementById('cancelCloneBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Show page management
export async function showPageManagement(container: HTMLElement) {
    // Check if there are unlinked presets available
    const unlinkedPresets = await StorageService.getUnlinkedPresets(state.currentPageData?.id || '');
    const hasUnlinkedPresets = unlinkedPresets.length > 0;
    container.innerHTML = `
    ${state.currentPageData ? `
    <div class="presets-section">
    <div class="section-header">
        <h3>
        Presets
        </h3>
        <div class="section-header-actions">
          <button id="scanFormDataBtnPreset" class="cyber-btn cyber-btn--small" title="Scan form fields on current page" data-icons="ScanForm">Scan Page
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">scan</span>
          </button>
          <button id="createPresetBtn" class="cyber-btn cyber-btn--small" data-icons="Plus">Create Preset
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">new</span>
          </button>
          ${hasUnlinkedPresets ? `<button id="linkPresetBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small" title="Link this page with exists preset from other page">Link Preset
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">link</span>
          </button>` : ''}
          <button id="exportPresetsBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small">Export Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">json</span>
          </button>
          <button id="importPresetsBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small">Import Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">load</span>
          </button>
          <button class="guide-trigger-btn" data-guide="presets-guide" title="Show guide for Presets" data-icons="Info"></button>
        </div>
      </div>
      <div class="table-container compact-presets">
        <table class="presets-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="rank">#</th>
              <th class="sortable" data-sort="name">Preset Name</th>
              <th class="sortable" data-sort="description">Description</th>
              <th class="sortable" data-sort="updated">Last Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="presetsBody">
            <!-- Presets will be loaded here -->
          </tbody>
        </table>
      </div>
    </div>
    <input type="file" id="importPresetsFile" accept=".json" style="display: none;" />
    ` : ''}
  `;
    // Re-initialize guide overlays for dynamically added buttons
    initGuideOverlays();
    // Initialize cyber buttons after content is rendered
    initCyberButtons();
    if (state.currentPageData) {
        actions.loadPresets();
        document.getElementById('createPresetBtn')?.addEventListener('click', () => {
            actions.openPresetEditor();
        });
        document.getElementById('linkPresetBtn')?.addEventListener('click', () => {
            actions.showLinkPresetModal();
        });
        document.getElementById('exportPresetsBtn')?.addEventListener('click', async () => {
            await actions.showExportPresetsModal();
        });
        document.getElementById('importPresetsBtn')?.addEventListener('click', () => {
            const fileInput = document.getElementById('importPresetsFile') as HTMLInputElement;
            fileInput.click();
        });
        document.getElementById('importPresetsFile')?.addEventListener('change', async (e) => {
            const input = e.target as HTMLInputElement;
            if (input.files && input.files[0]) {
                await actions.importPresetsData(input.files[0]);
                input.value = ''; // Reset input
            }
        });
        // Scan form data button in preset section
        document.getElementById('scanFormDataBtnPreset')?.addEventListener('click', async () => {
            await actions.scanFormData();
        });
        // Add sort listeners
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                const column = (e.target as HTMLElement).getAttribute('data-sort') as 'rank' | 'name' | 'description' | 'updated';
                if (column) {
                    actions.sortPresets(column);
                }
            });
        });
    }
}
