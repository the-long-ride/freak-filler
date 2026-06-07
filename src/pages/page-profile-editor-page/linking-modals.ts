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

export function showLinkPresetsToPageModal() {
    if (!state.currentPageData) {
        showToast('No current page data available', 'error');
        return;
    }
    StorageService.getUnlinkedPresets(state.currentPageData.id).then((unlinkedPresets) => {
        if (unlinkedPresets.length === 0) {
            showToast('No unlinked presets available', 'info');
            return;
        }
        // Build list items using modal-list classes
        const itemsHtml = unlinkedPresets
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(p => {
            const created = new Date(p.createdAt).toLocaleString();
            return `
          <label class="modal-list-item">
            <input type="checkbox" class="link-preset-checkbox" value="${p.id}" />
            <div class="meta">
              <div class="title">${escapeHtml(p.name || '(Untitled)')}</div>
              <div class="subtitle">${escapeHtml(p.description || 'No description')}</div>
              <div class="subtitle">Created: ${created}</div>
            </div>
          </label>
        `;
        }).join('');
        const body = `
      <div class="modal-body">
        <div class="modal-selection-counter">Selected: 0 / ${unlinkedPresets.length}</div>
        <div class="modal-list">${itemsHtml}</div>
        <div class="modal-actions">
          <button id="linkPresetsCancelBtn" class="cyber-btn cyber-btn--secondary">
            Cancel
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[esc]</span>
          </button>
          <button id="linkPresetsConfirmBtn" class="cyber-btn">
            Link Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
        </div>
      </div>
    `;
        showModal('Link presets to current page', body, () => { });
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.link-preset-checkbox:checked').length;
            const totalCount = unlinkedPresets.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.link-preset-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        let actionHandled = false;
        document.getElementById('linkPresetsCancelBtn')?.addEventListener('click', () => {
            if (actionHandled)
                return;
            actionHandled = true;
            hideModal();
        });
        document.getElementById('linkPresetsConfirmBtn')?.addEventListener('click', async () => {
            if (actionHandled)
                return;
            actionHandled = true;
            const selectedPresetIds: string[] = [];
            document.querySelectorAll('.link-preset-checkbox:checked').forEach(cb => selectedPresetIds.push((cb as HTMLInputElement).value));
            if (selectedPresetIds.length === 0) {
                showToast('Please choose at least one preset to link', 'warning');
                return;
            }
            for (const presetId of selectedPresetIds) {
                await StorageService.linkPresetToPage(presetId, state.currentPageData!.id);
            }
            hideModal();
            showToast(`Linked ${selectedPresetIds.length} preset(s) to current page`, 'success');
            // Update button visibility and reload presets
            await actions.updateLinkPresetsButtonVisibility();
            await actions.loadPagePresets();
        });
    }).catch((error) => {
        console.error('Failed to load unlinked presets:', error);
        showToast('Failed to load presets. Please try again.', 'error');
    });
}

export function showLinkPresetToPagesModal() {
    if (!state.currentPresetId) {
        showToast('Please save/select a preset first', 'warning');
        return;
    }
    StorageService.getData().then((data) => {
        const pages = data?.pages ?? [];
        if (pages.length === 0) {
            showToast('No pages available to link', 'info');
            return;
        }
        // Build list items using modal-list classes
        const itemsHtml = pages
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(p => {
            const created = new Date(p.createdAt).toLocaleString();
            return `
          <label class="modal-list-item">
            <input type="checkbox" class="link-page-checkbox" value="${p.id}" />
            <div class="meta">
              <div class="title">${escapeHtml(p.pageTitle || '(Untitled)')}</div>
              <div class="subtitle">${escapeHtml(p.url)}</div>
              <div class="subtitle">Created: ${created}</div>
            </div>
          </label>
        `;
        }).join('');
        const body = `
      <div class="modal-body">
        <div class="modal-selection-counter">Selected: 0 / ${pages.length}</div>
        <div class="modal-list">${itemsHtml}</div>
        <div class="modal-actions">
          <button id="linkPagesCancelBtn" class="cyber-btn cyber-btn--secondary">
            Cancel
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[esc]</span>
          </button>
          <button id="linkPagesConfirmBtn" class="cyber-btn">
            Confirm
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
        </div>
      </div>
    `;
        showModal('Link to exist page(s)', body, () => { });
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.link-page-checkbox:checked').length;
            const totalCount = pages.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.link-page-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        document.getElementById('linkPagesCancelBtn')?.addEventListener('click', () => hideModal());
        document.getElementById('linkPagesConfirmBtn')?.addEventListener('click', async () => {
            const selectedPageIds: string[] = [];
            document.querySelectorAll('.link-page-checkbox:checked').forEach(cb => selectedPageIds.push((cb as HTMLInputElement).value));
            if (selectedPageIds.length === 0) {
                showToast('Please choose at least one page to link', 'warning');
                return;
            }
            for (const pageId of selectedPageIds) {
                await StorageService.linkPresetToPage(state.currentPresetId!, pageId);
            }
            const selectedPages = pages.filter(p => selectedPageIds.includes(p.id));
            let targetPageId = selectedPageIds[0];
            if (selectedPages.length > 1) {
                targetPageId = selectedPages
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].id;
            }
            hideModal();
            window.location.href = `page-profile-editor.html?pageId=${encodeURIComponent(targetPageId)}&presetId=${encodeURIComponent(state.currentPresetId!)}`;
        });
    }).catch((error) => {
        console.error('Failed to load pages:', error);
        showToast('Failed to load pages. Please try again.', 'error');
    });
}
