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

// Show Add Page Modal
export async function showAddPageModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    if (!modalOverlay || !modalTitle || !modalBody)
        return;
    modalTitle.textContent = 'Add New Page';
    modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Page Title <span style="color: var(--error);">*</span></label>
        <input type="text" id="newPageTitle" class="modal-input" placeholder="Enter page title" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">URL <span style="color: var(--error);">*</span></label>
        <input type="text" id="newPageUrl" class="modal-input" placeholder="https://example.com" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description</label>
        <textarea id="newPageDescription" class="modal-input" placeholder="Optional description" rows="3" style="width: 100%; resize: vertical;"></textarea>
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Owner</label>
        <input type="text" id="newPageOwner" class="modal-input" placeholder="Optional owner name" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">URL Match Type</label>
        <select id="newPageMatchIdentify" class="match-select" style="width: 100%;">
          <option value="prefixMatch">Prefix Match</option>
          <option value="exactMatch">Exact Match</option>
        </select>
      </div>
      <div class="modal-actions">
        <button id="modalCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="modalAddBtn" class="cyber-btn">Add Page
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    modalOverlay.style.display = 'flex';
    // Initialize cyber buttons after modal content is rendered
    initCyberButtons();
    const handleAdd = async () => {
        const title = (document.getElementById('newPageTitle') as HTMLInputElement).value.trim();
        const url = (document.getElementById('newPageUrl') as HTMLInputElement).value.trim();
        const description = (document.getElementById('newPageDescription') as HTMLTextAreaElement).value.trim();
        const owner = (document.getElementById('newPageOwner') as HTMLInputElement).value.trim();
        const matchIdentify = (document.getElementById('newPageMatchIdentify') as HTMLSelectElement).value as 'exactMatch' | 'prefixMatch';
        if (!title) {
            showToast('Page title is required', 'error');
            return;
        }
        if (!url) {
            showToast('URL is required', 'error');
            return;
        }
        try {
            const newPage: PageData = {
                id: `page_${Date.now()}`,
                pageTitle: title,
                url: url,
                description: description,
                owner: owner,
                matchIdentify: matchIdentify,
                createdAt: getCurrentTimestamp(),
                updatedAt: getCurrentTimestamp()
            };
            await StorageService.addPage(newPage);
            await actions.loadPages();
            cleanup();
            showToast('Page added successfully!', 'success');
        }
        catch (error) {
            console.error('Error adding page:', error);
            showToast('Failed to add page. Please try again.', 'error');
        }
    };
    const handleCancel = () => {
        cleanup();
    };
    const cleanup = () => {
        modalOverlay.style.display = 'none';
        document.getElementById('modalAddBtn')?.removeEventListener('click', handleAdd);
        document.getElementById('modalCancelBtn')?.removeEventListener('click', handleCancel);
        document.getElementById('modalClose')?.removeEventListener('click', handleCancel);
    };
    document.getElementById('modalAddBtn')?.addEventListener('click', handleAdd);
    document.getElementById('modalCancelBtn')?.addEventListener('click', handleCancel);
    document.getElementById('modalClose')?.addEventListener('click', handleCancel);
    // Focus on first input
    setTimeout(() => {
        (document.getElementById('newPageTitle') as HTMLInputElement)?.focus();
    }, 100);
}

// Show Add Preset Modal
export async function showAddPresetModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    if (!modalOverlay || !modalTitle || !modalBody)
        return;
    modalTitle.textContent = 'Add New Preset';
    modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Preset Name <span style="color: var(--error);">*</span></label>
        <input type="text" id="newPresetName" class="modal-input" placeholder="Enter preset name" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description</label>
        <textarea id="newPresetDescription" class="modal-input" placeholder="Optional description" rows="3" style="width: 100%; resize: vertical;"></textarea>
      </div>
      <div class="modal-actions">
        <button id="modalCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="modalAddBtn" class="cyber-btn">Add Preset
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    modalOverlay.style.display = 'flex';
    // Initialize cyber buttons after modal content is rendered
    initCyberButtons();
    const handleAdd = async () => {
        const name = (document.getElementById('newPresetName') as HTMLInputElement).value.trim();
        const description = (document.getElementById('newPresetDescription') as HTMLTextAreaElement).value.trim();
        if (!name) {
            showToast('Preset name is required', 'error');
            return;
        }
        try {
            const newPreset: Preset = {
                id: `preset_${Date.now()}`,
                name: name,
                description: description,
                formData: [],
                createdAt: getCurrentTimestamp(),
                updatedAt: getCurrentTimestamp()
            };
            await StorageService.addPreset(newPreset);
            await actions.loadPresets();
            cleanup();
            showToast('Preset added successfully! You can now edit it to add form fields.', 'success');
        }
        catch (error) {
            console.error('Error adding preset:', error);
            showToast('Failed to add preset. Please try again.', 'error');
        }
    };
    const handleCancel = () => {
        cleanup();
    };
    const cleanup = () => {
        modalOverlay.style.display = 'none';
        document.getElementById('modalAddBtn')?.removeEventListener('click', handleAdd);
        document.getElementById('modalCancelBtn')?.removeEventListener('click', handleCancel);
        document.getElementById('modalClose')?.removeEventListener('click', handleCancel);
    };
    document.getElementById('modalAddBtn')?.addEventListener('click', handleAdd);
    document.getElementById('modalCancelBtn')?.addEventListener('click', handleCancel);
    document.getElementById('modalClose')?.addEventListener('click', handleCancel);
    // Focus on first input
    setTimeout(() => {
        (document.getElementById('newPresetName') as HTMLInputElement)?.focus();
    }, 100);
}
