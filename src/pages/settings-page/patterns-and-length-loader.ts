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

// Load regex patterns
export async function loadRegexPatterns() {
    // Use in-memory originalData when available so UI shows unsaved changes.
    let data: any = null;
    if (state.originalData) {
        data = state.originalData;
    }
    else {
        const stored = await StorageService.getData();
        if (!stored)
            return;
        // Work on a copy in memory so user can cancel/save later
        state.originalData = JSON.parse(JSON.stringify(stored));
        data = state.originalData;
    }
    const tbody = document.getElementById('regexPatternsTableBody');
    if (!tbody)
        return;
    // Ensure all patterns have order property (migration) on the in-memory copy
    data.regexPatterns.forEach((pattern: any, index: number) => {
        if (pattern.order === undefined) {
            pattern.order = index + 1;
        }
    });
    // Sort by order property
    const sortedPatterns = [...data.regexPatterns].sort((a: any, b: any) => a.order - b.order);
    // Update record count
    const countElement = document.getElementById('regexPatternsCount');
    if (countElement) {
        const count = data.regexPatterns.length;
        countElement.textContent = buildQuantityString(count);
    }
    if (data.regexPatterns.length === 0) {
        tbody.innerHTML = '<div class="no-data">No regex patterns found</div>';
        return;
    }
    tbody.innerHTML = '';
    sortedPatterns.forEach((pattern, index) => {
        const row = document.createElement('div');
        row.className = 'data-grid-row';
        row.draggable = true;
        row.dataset.regexPatternIndex = index.toString();
        row.dataset.patternName = pattern.name;
        row.innerHTML = `
      <div class="drag-handle" title="Drag to reorder">
        <span>⋮⋮</span>
      </div>
      <div>
        <input type="text" class="regex-pattern-name" value="${escapeHtml(pattern.name)}" />
      </div>
      <div>
        <input type="text" class="regex-pattern-regex" value="${escapeHtml(pattern.regex)}" />
      </div>
      <div class="table-actions">
        <button class="action-btn action-btn--delete" data-action="delete" data-index="${index}" data-icons="Trash"></button>
      </div>
    `;
        // Add drag & drop event listeners
        row.addEventListener('dragstart', actions.handleRegexPatternDragStart);
        row.addEventListener('dragover', actions.handleRegexPatternDragOver);
        row.addEventListener('drop', actions.handleRegexPatternDrop);
        row.addEventListener('dragend', actions.handleRegexPatternDragEnd);
        row.addEventListener('dragleave', actions.handleRegexPatternDragLeave);
        tbody.appendChild(row);
    });
    // Initialize cyber buttons after dynamic content is rendered
    initCyberButtons();
    // Add change listeners to show save/cancel buttons
    tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => actions.showRegexPatternsButtons());
    });
    // Add action listeners
    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => actions.handleDeleteRegexPattern((btn as HTMLElement).dataset.index!));
    });
}

// Load length configurations
export async function loadLengthConfigurations() {
    const data = await StorageService.getData();
    if (!data)
        return;
    const tbody = document.getElementById('lengthConfigTableBody');
    if (!tbody)
        return;
    // Sort the length configurations
    const sortedConfigs = actions.sortData(data.lengthConfigurations, state.sortStates.lengthConfig.column, state.sortStates.lengthConfig.direction);
    // Update record count
    const countElement = document.getElementById('lengthConfigCount');
    if (countElement) {
        const count = data.lengthConfigurations.length;
        countElement.textContent = buildQuantityString(count);
    }
    if (data.lengthConfigurations.length === 0) {
        tbody.innerHTML = '<div class="no-data">No length configurations found</div>';
        return;
    }
    tbody.innerHTML = '';
    sortedConfigs.forEach((config, index) => {
        const row = document.createElement('div');
        row.className = 'data-grid-row';
        row.dataset.lengthConfigIndex = index.toString();
        row.innerHTML = `
      <div>
        <input type="text" class="length-config-name" value="${escapeHtml(config.name)}" />
      </div>
      <div>
        <input type="text" class="length-config-description" value="${escapeHtml(config.description)}" />
      </div>
      <div>
        <input type="text" class="length-config-locator" value="${escapeHtml(config.locator)}" />
      </div>
      <div>
        <input type="number" class="length-config-max-length" value="${config.maxLength}" min="1" max="99999" />
      </div>
      <div class="table-actions">
        <button class="action-btn action-btn--delete" data-action="delete" data-index="${index}" data-icons="Trash"></button>
      </div>
    `;
        tbody.appendChild(row);
    });
    // Initialize cyber buttons after dynamic content is rendered
    initCyberButtons();
    // Add change listeners to show save/cancel buttons
    tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => actions.showLengthConfigButtons());
    });
    // Add action listeners
    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => actions.handleDeleteLengthConfig((btn as HTMLElement).dataset.index!));
    });
}
