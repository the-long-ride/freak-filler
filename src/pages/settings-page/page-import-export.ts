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

// Export pages to JSON file
export async function exportPages() {
    const data = await StorageService.getData();
    if (!data || data.pages.length === 0) {
        showToast('No pages to export', 'info');
        return;
    }
    await actions.showPageExportSelectionModal(data.pages);
}

// Show page export selection modal
export async function showPageExportSelectionModal(allPages: PageData[]) {
    const modalContent = `
    <div class="export-selection">
      <p>Select pages to export <span class="page-counter">(0 / ${allPages.length})</span></p>
      
      <div class="preset-selection-list">
        <label class="export-option select-all-option">
          <input type="checkbox" id="selectAllPages" checked>
          <span class="checkmark"></span>
          <strong>Select All Pages</strong>
        </label>
        
        <div class="preset-list">
          ${allPages.map(page => `
            <label class="export-option preset-option">
              <input type="checkbox" class="page-checkbox" value="${page.id}" checked>
              <span class="checkmark"></span>
              <div class="preset-card">
                <div class="preset-title">${escapeHtml(page.pageTitle)}</div>
                <div class="preset-card-description">${escapeHtml(page.url)}${page.description ? ` - ${escapeHtml(page.description)}` : ''}</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="modal-actions">
        <button id="cancelPageExportBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="exportSelectedPagesBtn" class="cyber-btn">Export Selected
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Export Pages', modalContent);
    // Update counter function
    const updateCounter = () => {
        const checkedCount = document.querySelectorAll('.page-checkbox:checked').length;
        const totalCount = allPages.length;
        const counterEl = document.querySelector('.page-counter');
        if (counterEl) {
            counterEl.textContent = `(${checkedCount} / ${totalCount})`;
        }
    };
    // Initialize counter
    updateCounter();
    // Handle select all checkbox
    document.getElementById('selectAllPages')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        const checkboxes = document.querySelectorAll('.page-checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(cb => cb.checked = checked);
        updateCounter();
    });
    // Handle individual checkbox changes to update select all state
    document.querySelectorAll('.page-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            const allCheckboxes = document.querySelectorAll('.page-checkbox') as NodeListOf<HTMLInputElement>;
            const selectAllCheckbox = document.getElementById('selectAllPages') as HTMLInputElement;
            const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            const noneChecked = Array.from(allCheckboxes).every(cb => !cb.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = !allChecked && !noneChecked;
            updateCounter();
        });
    });
    // Handle export selected button
    document.getElementById('exportSelectedPagesBtn')?.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.page-checkbox:checked') as NodeListOf<HTMLInputElement>)
            .map(cb => cb.value);
        if (selectedIds.length === 0) {
            showToast('Please select at least one page to export', 'warning');
            return;
        }
        const selectedPages = allPages.filter(page => selectedIds.includes(page.id));
        hideModal();
        await actions.performPageExport(selectedPages);
    });
    // Handle cancel button
    document.getElementById('cancelPageExportBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Perform the actual page export
export async function performPageExport(selectedPages: PageData[]) {
    const exportFile = createExportFile({
        included: { pages: true },
        data: { pages: selectedPages }
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `pages-export-${Date.now()}.json`);
    showToast(`${selectedPages.length} page${selectedPages.length === 1 ? '' : 's'} exported and downloaded`, 'success');
}

// Import pages from JSON file
export async function importPages(file: File) {
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.pages || !Array.isArray(imported.data.pages)) {
            showToast('Invalid import file: pages section not included', 'error');
            return;
        }
        const data = await StorageService.getData();
        if (!data)
            return;
        let addedCount = 0;
        let skippedIdCount = 0;
        let skippedDuplicateCount = 0;
        for (const page of imported.data.pages) {
            // Check if page already exists with same ID
            const existingById = data.pages.find(p => p.id === page.id);
            if (existingById) {
                skippedIdCount++;
                continue;
            }
            // Check if page already exists with same URL and matchIdentify
            const existingByUrl = data.pages.find(p => p.url === page.url && p.matchIdentify === page.matchIdentify);
            if (existingByUrl) {
                skippedDuplicateCount++;
                continue;
            }
            // Add new page with new ID
            const newPage = {
                ...page,
                id: generateGuid(),
                createdAt: getCurrentTimestamp(),
                updatedAt: getCurrentTimestamp()
            };
            data.pages.push(newPage);
            addedCount++;
        }
        await StorageService.setData(data);
        await actions.loadPages();
        let message = `Added ${addedCount} pages`;
        if (skippedIdCount > 0)
            message += `, skipped ${skippedIdCount} with existing IDs`;
        if (skippedDuplicateCount > 0)
            message += `, skipped ${skippedDuplicateCount} duplicates`;
        showToast(message, 'success');
    }
    catch (error) {
        console.error('Import pages error:', error);
        showToast('Failed to import pages. Please check the file format.', 'error');
    }
}
