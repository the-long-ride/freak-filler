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

// Load pages
export async function loadPages() {
    const data = await StorageService.getData();
    if (!data)
        return;
    const tbody = document.getElementById('pagesTableBody');
    if (!tbody)
        return;
    // Sort the pages
    const sortedPages = actions.sortData(data.pages, state.sortStates.pages.column, state.sortStates.pages.direction);
    // Update record count
    const countElement = document.getElementById('pagesCount');
    if (countElement) {
        const count = data.pages.length;
        countElement.textContent = buildQuantityString(count);
    }
    if (data.pages.length === 0) {
        tbody.innerHTML = '<div class="no-data">No pages found</div>';
        return;
    }
    tbody.innerHTML = '';
    sortedPages.forEach(page => {
        const row = document.createElement('div');
        row.className = 'data-grid-row';
        row.dataset.pageId = page.id;
        // Get latest preset for this page
        const pagePresetLinks = data.presetPageLinks.filter(l => l.pageId === page.id);
        const pagePresets = data.presets.filter(p => pagePresetLinks.some(l => l.presetId === p.id));
        const latestPreset = pagePresets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        row.innerHTML = `
      <div><input type="text" class="page-title" value="${escapeHtml(page.pageTitle)}" /></div>
      <div><input type="text" class="page-url" value="${escapeHtml(page.url)}" /></div>
      <div><textarea class="page-description" rows="1">${escapeHtml(page.description || '')}</textarea></div>
      <div><input type="text" class="page-owner" value="${escapeHtml(page.owner || '')}" /></div>
      <div>
        <select class="page-match match-select">
          <option value="prefixMatch" ${page.matchIdentify === 'prefixMatch' ? 'selected' : ''}>Prefix</option>
          <option value="exactMatch" ${page.matchIdentify === 'exactMatch' ? 'selected' : ''}>Exact</option>
        </select>
      </div>
      <div>${new Date(page.updatedAt).toLocaleString()}</div>
      <div class="table-actions">
        <button class="action-btn action-btn--apply" data-action="open" data-id="${page.id}" data-preset-id="${latestPreset?.id || ''}">Open
        </button>
        <button class="action-btn action-btn--edit" data-action="duplicate" data-id="${page.id}" data-icons="Copy"></button>
        <button class="action-btn action-btn--delete" data-action="delete" data-id="${page.id}" data-icons="Trash"></button>
      </div>
    `;
        tbody.appendChild(row);
    });
    // Initialize cyber buttons after dynamic content is rendered
    initCyberButtons();
    // Add change listeners
    tbody.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', () => actions.showPageButtons());
    });
    // Add action listeners
    tbody.querySelectorAll('[data-action="open"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = (btn as HTMLElement).dataset.id!;
            const presetId = (btn as HTMLElement).dataset.presetId || '';
            const url = presetId
                ? `page-profile-editor.html?pageId=${encodeURIComponent(pageId)}&presetId=${encodeURIComponent(presetId)}`
                : `page-profile-editor.html?pageId=${encodeURIComponent(pageId)}`;
            // Open editor in the same tab instead of a new tab
            window.location.href = url;
        });
    });
    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => actions.handleDeletePage((btn as HTMLElement).dataset.id!));
    });
    tbody.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
        btn.addEventListener('click', () => actions.handleDuplicatePage((btn as HTMLElement).dataset.id!));
    });
}

// Handle delete page
export async function handleDeletePage(pageId: string) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const page = data.pages.find(p => p.id === pageId);
    if (!page)
        return;
    const confirmed = await showConfirm('Delete Page', `Delete "${page.pageTitle}"? This will also remove all associated presets links and saved values.`);
    if (!confirmed)
        return;
    // Remove page
    data.pages = data.pages.filter(p => p.id !== pageId);
    // Remove preset links
    data.presetPageLinks = data.presetPageLinks.filter(l => l.pageId !== pageId);
    // Remove saved values
    data.savedValues = data.savedValues.filter(sv => sv.pageId !== pageId);
    await StorageService.setData(data);
    await actions.loadPages();
    showToast('Page deleted successfully', 'success');
}

// Handle duplicate page
export async function handleDuplicatePage(pageId: string) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const page = data.pages.find(p => p.id === pageId);
    if (!page)
        return;
    const newPage = await StorageService.addPage({
        pageTitle: `${page.pageTitle} (Copy)`,
        url: 'You have to set URL',
        description: page.description || '',
        owner: page.owner || '',
        matchIdentify: page.matchIdentify
    });
    // Don't clone preset links - new page starts empty
    await actions.loadPages();
    showToast('Page duplicated successfully', 'success');
}

// Load presets
export async function loadPresets() {
    const data = await StorageService.getData();
    if (!data)
        return;
    const tbody = document.getElementById('presetsTableBody');
    if (!tbody)
        return;
    // Sort the presets
    const sortedPresets = actions.sortData(data.presets, state.sortStates.presets.column, state.sortStates.presets.direction, data);
    // Update record count
    const countElement = document.getElementById('presetsCount');
    if (countElement) {
        const count = data.presets.length;
        countElement.textContent = buildQuantityString(count);
    }
    if (data.presets.length === 0) {
        tbody.innerHTML = '<div class="no-data">No presets found</div>';
        return;
    }
    tbody.innerHTML = '';
    sortedPresets.forEach(preset => {
        const linkedPages = data.presetPageLinks.filter(l => l.presetId === preset.id);
        // Get latest modified page for this preset
        const presetPages = data.pages.filter(p => linkedPages.some(l => l.pageId === p.id));
        const latestPage = presetPages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
        const row = document.createElement('div');
        row.className = 'data-grid-row';
        row.dataset.presetId = preset.id;
        row.innerHTML = `
      <div><input type="text" class="preset-card-name" value="${escapeHtml(preset.name)}" /></div>
      <div><textarea class="preset-card-description" rows="1">${escapeHtml(preset.description || '')}</textarea></div>
      <div>${preset.formData.length}</div>
      <div>${linkedPages.length}</div>
      <div>${new Date(preset.updatedAt).toLocaleString()}</div>
      <div class="table-actions">
        <button class="action-btn action-btn--apply" data-action="edit" data-id="${preset.id}" data-page-id="${latestPage?.id || ''}" data-icons="Modify">Edit
        </button>
        <button class="action-btn action-btn--edit" data-action="clone" data-id="${preset.id}" data-icons="Copy"></button>
        <button class="action-btn action-btn--delete" data-action="delete" data-id="${preset.id}" data-icons="Trash"></button>
      </div>
    `;
        tbody.appendChild(row);
    });
    // Initialize cyber buttons after dynamic content is rendered
    initCyberButtons();
    // Add change listeners
    tbody.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => actions.showPresetButtons());
    });
    // Add action listeners
    tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const presetId = (btn as HTMLElement).dataset.id!;
            try {
                const data = await StorageService.getData();
                if (!data) {
                    showToast('Failed to load data', 'error');
                    return;
                }
                const links = data.presetPageLinks.filter(l => l.presetId === presetId);
                let url: string;
                if (!links || links.length === 0) {
                    // No links -> Preset-only mode (POM)
                    url = `page-profile-editor.html?presetId=${encodeURIComponent(presetId)}`;
                }
                else {
                    // If one link -> open that page with preset. If multiple -> use first record in presetPageLinks
                    const targetPageId = links[0].pageId;
                    url = `page-profile-editor.html?pageId=${encodeURIComponent(targetPageId)}&presetId=${encodeURIComponent(presetId)}`;
                }
                // Open editor in the same tab instead of a new tab
                window.location.href = url;
            }
            catch (err) {
                console.error('Failed to open preset editor:', err);
                showToast('Failed to open preset editor. Please try again.', 'error');
            }
        });
    });
    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => actions.handleDeletePreset((btn as HTMLElement).dataset.id!));
    });
    tbody.querySelectorAll('[data-action="clone"]').forEach(btn => {
        btn.addEventListener('click', () => actions.handleClonePreset((btn as HTMLElement).dataset.id!));
    });
}

// Handle delete preset
export async function handleDeletePreset(presetId: string) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const preset = data.presets.find(p => p.id === presetId);
    if (!preset)
        return;
    const confirmed = await showConfirm('Delete Preset', `Permanently delete "${preset.name}"? This cannot be undone.`);
    if (!confirmed)
        return;
    // Remove preset
    data.presets = data.presets.filter(p => p.id !== presetId);
    // Remove preset links
    data.presetPageLinks = data.presetPageLinks.filter(l => l.presetId !== presetId);
    await StorageService.setData(data);
    await actions.loadPresets();
    showToast('Preset deleted successfully', 'success');
}

// Handle clone preset
export async function handleClonePreset(presetId: string) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const preset = data.presets.find(p => p.id === presetId);
    if (!preset)
        return;
    const newPreset = await StorageService.addPreset({
        name: `${preset.name} (Copy)`,
        description: preset.description || '',
        formData: JSON.parse(JSON.stringify(preset.formData))
    });
    await actions.loadPresets();
    showToast('Preset cloned successfully', 'success');
}
