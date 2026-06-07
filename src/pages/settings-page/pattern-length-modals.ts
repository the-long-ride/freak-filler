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

// Show Add Regex Pattern Modal
export async function showAddRegexPatternModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    if (!modalOverlay || !modalTitle || !modalBody)
        return;
    modalTitle.textContent = 'Add New Regex Pattern';
    modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Pattern Name <span style="color: var(--error);">*</span></label>
        <input type="text" id="newRegexPatternName" class="modal-input" placeholder="Enter pattern name" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Regex Pattern <span style="color: var(--error);">*</span></label>
        <input type="text" id="newRegexPatternRegex" class="modal-input" placeholder="Enter regex pattern" style="width: 100%;" />
      </div>
      <div class="modal-actions">
        <button id="modalCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="modalAddBtn" class="cyber-btn">Add Pattern
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
        const name = (document.getElementById('newRegexPatternName') as HTMLInputElement).value.trim();
        const regex = (document.getElementById('newRegexPatternRegex') as HTMLInputElement).value.trim();
        if (!name) {
            showToast('Pattern name is required', 'error');
            return;
        }
        if (!regex) {
            showToast('Regex pattern is required', 'error');
            return;
        }
        try {
            const data = await StorageService.getData();
            if (!data)
                return;
            data.regexPatterns.push({
                name,
                regex,
                order: data.regexPatterns.length + 1
            });
            await StorageService.setData(data);
            await actions.loadRegexPatterns();
            cleanup();
            showToast('Regex pattern added successfully!', 'success');
        }
        catch (error) {
            console.error('Error adding regex pattern:', error);
            showToast('Failed to add regex pattern. Please try again.', 'error');
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
        (document.getElementById('newRegexPatternName') as HTMLInputElement)?.focus();
    }, 100);
}

// Show Add Length Configuration Modal
export async function showAddLengthConfigModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    if (!modalOverlay || !modalTitle || !modalBody)
        return;
    modalTitle.textContent = 'Add New Length Configuration';
    modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Configuration Name <span style="color: var(--error);">*</span></label>
        <input type="text" id="newLengthConfigName" class="modal-input" placeholder="Enter configuration name" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description</label>
        <input type="text" id="newLengthConfigDescription" class="modal-input" placeholder="Optional description" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Locator <span style="color: var(--error);">*</span></label>
        <input type="text" id="newLengthConfigLocator" class="modal-input" placeholder="CSS selector or test ID" style="width: 100%;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Max Length <span style="color: var(--error);">*</span></label>
        <input type="number" id="newLengthConfigMaxLength" class="modal-input" placeholder="Maximum character length" min="1" max="99999" style="width: 100%;" />
      </div>
      <div class="modal-actions">
        <button id="modalCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="modalAddBtn" class="cyber-btn">Add Configuration
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
        const name = (document.getElementById('newLengthConfigName') as HTMLInputElement).value.trim();
        const description = (document.getElementById('newLengthConfigDescription') as HTMLInputElement).value.trim();
        const locator = (document.getElementById('newLengthConfigLocator') as HTMLInputElement).value.trim();
        const maxLength = parseInt((document.getElementById('newLengthConfigMaxLength') as HTMLInputElement).value);
        if (!name) {
            showToast('Configuration name is required', 'error');
            return;
        }
        if (!locator) {
            showToast('Locator is required', 'error');
            return;
        }
        if (isNaN(maxLength) || maxLength < 1) {
            showToast('Max length must be a positive number', 'error');
            return;
        }
        try {
            const data = await StorageService.getData();
            if (!data)
                return;
            data.lengthConfigurations.push({ name, description, locator, maxLength });
            await StorageService.setData(data);
            await actions.loadLengthConfigurations();
            cleanup();
            showToast('Length configuration added successfully!', 'success');
        }
        catch (error) {
            console.error('Error adding length configuration:', error);
            showToast('Failed to add length configuration. Please try again.', 'error');
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
        (document.getElementById('newLengthConfigName') as HTMLInputElement)?.focus();
    }, 100);
}
