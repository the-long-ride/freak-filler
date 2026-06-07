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

// Regex Pattern Drag & Drop Handlers
export function handleRegexPatternDragStart(e: DragEvent) {
    // Prevent drag if user is focused on an input element
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
        e.preventDefault();
        return;
    }
    state.draggedRegexPatternRow = e.currentTarget as HTMLElement;
    state.draggedRegexPatternRow.classList.add('dragging');
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', state.draggedRegexPatternRow.innerHTML);
    }
    console.log('Drag started:', state.draggedRegexPatternRow.dataset.patternName);
}

export function handleRegexPatternDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    const target = e.currentTarget as HTMLElement;
    // Remove drag-over class from all rows first
    document.querySelectorAll('#regexPatternsTableBody .data-grid-row').forEach(row => {
        row.classList.remove('drag-over');
    });
    // Add drag-over class to current target if it's not the dragged row
    if (state.draggedRegexPatternRow && target !== state.draggedRegexPatternRow) {
        target.classList.add('drag-over');
        console.log('Dragging over:', target.dataset.patternName);
    }
}

export async function handleRegexPatternDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
    if (!state.draggedRegexPatternRow || target === state.draggedRegexPatternRow) {
        console.log('Drop ignored - same row or no dragged row');
        return;
    }
    // Get pattern names from data attributes
    const draggedName = state.draggedRegexPatternRow.dataset.patternName;
    const targetName = target.dataset.patternName;
    console.log('Drop event - dragged:', draggedName, 'target:', targetName);
    if (!draggedName || !targetName) {
        console.warn('Missing pattern names for drag & drop');
        return;
    }
    // Perform reorder in-memory (originalData). Create in-memory copy if needed.
    try {
        if (!state.originalData) {
            const stored = await StorageService.getData();
            if (!stored) {
                console.error('No data found for reorder');
                return;
            }
            state.originalData = JSON.parse(JSON.stringify(stored));
        }
        const draggedIndex = state.originalData!.regexPatterns.findIndex((p: any) => p.name === draggedName);
        const targetIndex = state.originalData!.regexPatterns.findIndex((p: any) => p.name === targetName);
        console.log('Reordering - draggedIndex:', draggedIndex, 'targetIndex:', targetIndex);
        if (draggedIndex === -1 || targetIndex === -1) {
            console.warn('Could not find patterns to reorder:', { draggedIndex, targetIndex });
            return;
        }
        // Reorder array in memory
        const [removed] = state.originalData!.regexPatterns.splice(draggedIndex, 1);
        state.originalData!.regexPatterns.splice(targetIndex, 0, removed);
        // Update order values
        state.originalData!.regexPatterns.forEach((pattern: any, index: number) => {
            pattern.order = index + 1;
        });
        console.log('New order (in-memory):', state.originalData!.regexPatterns.map((p: any) => ({ name: p.name, order: p.order })));
        // Mark as unsaved and reload UI from in-memory data
        state.hasUnsavedChanges = true;
        await actions.loadRegexPatterns();
        actions.showRegexPatternsButtons();
        console.log('Reorder complete (in-memory)');
    }
    catch (error) {
        console.error('Failed to reorder regex patterns:', error);
        showToast('Failed to reorder patterns. Please try again.', 'error');
    }
}

export function handleRegexPatternDragEnd(e: DragEvent) {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
    document.querySelectorAll('#regexPatternsTableBody .drag-over').forEach(el => el.classList.remove('drag-over'));
    console.log('Drag ended');
    state.draggedRegexPatternRow = null;
}

export function handleRegexPatternDragLeave(e: DragEvent) {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
}
