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

// Sort presets
export async function sortPresets(column: 'rank' | 'name' | 'description' | 'updated') {
    if (!state.currentPageData)
        return;
    // Get presets for this page
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    // Toggle direction if same column, otherwise default to ascending
    if (state.sortColumn === column) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    else {
        state.sortColumn = column;
        state.sortDirection = 'asc';
    }
    // Sort presets
    const sortedPresets = [...presets];
    sortedPresets.sort((a, b) => {
        let compareA: any;
        let compareB: any;
        switch (column) {
            case 'rank':
                // Use original index for rank (presets array order)
                compareA = presets.indexOf(a);
                compareB = presets.indexOf(b);
                break;
            case 'name':
                compareA = a.name.toLowerCase();
                compareB = b.name.toLowerCase();
                break;
            case 'description':
                compareA = (a.description || '').toLowerCase();
                compareB = (b.description || '').toLowerCase();
                break;
            case 'updated':
                compareA = new Date(a.updatedAt).getTime();
                compareB = new Date(b.updatedAt).getTime();
                break;
        }
        if (compareA < compareB)
            return state.sortDirection === 'asc' ? -1 : 1;
        if (compareA > compareB)
            return state.sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    // Update display
    actions.renderPresetTable(sortedPresets);
    actions.updateSortIndicators();
}

// Update sort indicators
export function updateSortIndicators() {
    document.querySelectorAll('.sortable').forEach(header => {
        const column = (header as HTMLElement).getAttribute('data-sort');
        header.classList.remove('sort-asc', 'sort-desc');
        if (column === state.sortColumn) {
            header.classList.add(state.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

// Load presets into table
export async function loadPresets() {
    if (!state.currentPageData)
        return;
    const tbody = document.getElementById('presetsBody') as HTMLTableSectionElement;
    tbody.innerHTML = '';
    // Get presets for this page
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    if (presets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No presets found. Create your first preset!</td></tr>';
        return;
    }
    actions.renderPresetTable(presets);
}

// Render preset table
export function renderPresetTable(presets: any[]) {
    const tbody = document.getElementById('presetsBody') as HTMLTableSectionElement;
    tbody.innerHTML = '';
    const appendCell = (row: HTMLTableRowElement, text: string) => {
        const cell = document.createElement('td');
        cell.textContent = text;
        row.appendChild(cell);
    };
    const appendActionButton = (actionsCell: HTMLTableCellElement, opts: {
        className: string;
        action?: string;
        icon?: string;
        label?: string;
        presetId: string;
    }) => {
        const button = document.createElement('button');
        button.className = opts.className;
        button.dataset.id = opts.presetId;
        if (opts.action) {
            button.dataset.action = opts.action;
        }
        if (opts.icon) {
            button.dataset.icons = opts.icon;
        }
        if (opts.label) {
            button.textContent = opts.label;
        }
        actionsCell.appendChild(button);
        return button;
    };
    presets.forEach((preset, index) => {
        const row = document.createElement('tr');
        appendCell(row, String(index + 1));
        appendCell(row, preset.name);
        appendCell(row, preset.description || '');
        appendCell(row, actions.formatDate(preset.updatedAt));
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';
        appendActionButton(actionsCell, {
            className: 'action-btn action-btn--apply',
            label: 'Apply',
            presetId: preset.id,
        });
        appendActionButton(actionsCell, {
            className: 'action-btn action-btn--edit',
            action: 'edit',
            icon: 'Modify',
            presetId: preset.id,
        });
        appendActionButton(actionsCell, {
            className: 'action-btn action-btn--delete',
            action: 'delete',
            icon: 'Trash',
            presetId: preset.id,
        });
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
    // Add event listeners scoped to the table body
    tbody.querySelectorAll('.actions .action-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const target = e.currentTarget as HTMLElement;
            const presetId = target.getAttribute('data-id');
            const action = target.getAttribute('data-action');
            if (!presetId)
                return;
            if (action === 'edit') {
                actions.openPresetEditor(presetId);
            }
            else if (action === 'delete') {
                await actions.handleDeletePreset(presetId);
            }
            else {
                // Apply action (default)
                await actions.applyPreset(presetId);
            }
        });
    });
}

// Handle delete/unlink preset
export async function handleDeletePreset(presetId: string) {
    if (!state.currentPageData)
        return;
    // Check how many pages this preset is linked to
    const linkedPageIds = await StorageService.getPageIdsForPreset(presetId);
    if (linkedPageIds.length === 1) {
        // Preset is only linked to current page - confirm permanent deletion
        actions.showConfirmation('This preset is only linked to this page. Delete it permanently?', async () => {
            await StorageService.deletePreset(presetId);
            await actions.loadPageData();
        });
    }
    else {
        // Preset is linked to multiple pages - confirm unlinking
        actions.showConfirmation(`This preset is linked to ${linkedPageIds.length} pages. Unlink it from this page only?`, async () => {
            if (!state.currentPageData)
                return;
            await StorageService.unlinkPresetFromPage(presetId, state.currentPageData.id);
            await actions.loadPageData();
        });
    }
}

// Apply preset to current page
export async function applyPreset(presetId: string) {
    if (!state.currentPageData)
        return;
    const preset = await StorageService.getPresetById(presetId);
    if (!preset)
        return;
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]?.id) {
            actions.showNotification('Could not find active tab');
            return;
        }
        const tabId = tabs[0].id;
        // Try to send message to content script
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'applypreset',
                formData: preset.formData
            });
            window.close();
        }
        catch (error) {
            // Content script not loaded, inject it first
            console.log('Content script not ready, injecting...');
            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            // Inject CSS
            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['content.css']
            });
            // Wait a bit for script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            // Try sending message again
            await chrome.tabs.sendMessage(tabId, {
                action: 'applypreset',
                formData: preset.formData
            });
            window.close();
        }
    }
    catch (error) {
        console.error('Error applying preset:', error);
        actions.showNotification('Failed to apply preset. Make sure you are on a valid web page (not chrome:// or extension pages). Or try refreshing the page.');
    }
}
