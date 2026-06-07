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

// Generic sorting function
export function sortData<T>(data: T[], column: string, direction: 'asc' | 'desc', extraData?: any): T[] {
    return [...data].sort((a, b) => {
        let aVal: any;
        let bVal: any;
        // Handle computed fields for presets
        if (extraData && column === 'fieldCount') {
            aVal = (a as any).formData?.length || 0;
            bVal = (b as any).formData?.length || 0;
        }
        else if (extraData && column === 'linkedPages') {
            const presetIdA = (a as any).id;
            const presetIdB = (b as any).id;
            aVal = extraData.presetPageLinks.filter((l: any) => l.presetId === presetIdA).length;
            bVal = extraData.presetPageLinks.filter((l: any) => l.presetId === presetIdB).length;
        }
        else {
            aVal = (a as any)[column];
            bVal = (b as any)[column];
        }
        // Handle null/undefined values
        if (aVal == null && bVal == null)
            return 0;
        if (aVal == null)
            return direction === 'asc' ? -1 : 1;
        if (bVal == null)
            return direction === 'asc' ? 1 : -1;
        // Handle string comparison
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            const comparison = aVal.localeCompare(bVal);
            return direction === 'asc' ? comparison : -comparison;
        }
        // Handle number comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        // Handle date comparison
        if (aVal instanceof Date && bVal instanceof Date) {
            return direction === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
        }
        // Convert to string for other types
        const aStr = String(aVal);
        const bStr = String(bVal);
        const comparison = aStr.localeCompare(bStr);
        return direction === 'asc' ? comparison : -comparison;
    });
}

// Update sort indicators for a table
export function updateSortIndicators(tableId: string) {
    const grid = document.getElementById(`${tableId}Grid`);
    if (!grid)
        return;
    const headers = grid.querySelectorAll('.sortable-header');
    headers.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
    });
    const sortState = state.sortStates[tableId];
    if (sortState) {
        const activeHeader = grid.querySelector(`.sortable-header[data-sort="${sortState.column}"]`) as HTMLElement;
        if (activeHeader) {
            activeHeader.classList.add(`sort-${sortState.direction}`);
        }
    }
}

// Handle header click for sorting
export function handleHeaderClick(tableId: string, column: string) {
    const sortState = state.sortStates[tableId];
    if (sortState.column === column) {
        // Toggle direction if same column
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    }
    else {
        // New column, default to ascending
        sortState.column = column;
        sortState.direction = 'asc';
    }
    actions.updateSortIndicators(tableId);
    // Reload the table with new sorting
    switch (tableId) {
        case 'regexPatterns':
            actions.loadRegexPatterns();
            break;
        case 'locators':
            actions.loadLocators();
            break;
        case 'pages':
            actions.loadPages();
            break;
        case 'presets':
            actions.loadPresets();
            break;
        case 'lengthConfig':
            actions.loadLengthConfigurations();
            break;
    }
}
