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

// Scan form data on current page
export async function scanFormData() {
    if (!state.currentPageData)
        return;
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        const tabId = tab?.id;
        if (!tabId || !tab.url) {
            actions.showNotification('Could not find active tab');
            return;
        }
        // Check if tab is a valid web page
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
            actions.showNotification('Cannot scan form fields on browser internal pages');
            return;
        }
        let response;
        try {
            // Try to send message to content script
            response = await chrome.tabs.sendMessage(tabId, { action: 'scanFormFields' });
        }
        catch (error) {
            // Content script not loaded, inject it first
            console.log('Content script not loaded, injecting...');
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['content.js']
                });
                // Wait a bit for script to initialize
                await new Promise(resolve => setTimeout(resolve, 100));
                // Retry sending message
                response = await chrome.tabs.sendMessage(tabId, { action: 'scanFormFields' });
            }
            catch (injectError) {
                console.error('Failed to inject content script:', injectError);
                actions.showNotification('Failed to scan form fields. Please refresh the page and try again.');
                return;
            }
        }
        if (response && response.fields && response.fields.length > 0) {
            // Show confirmation modal with scanned fields
            actions.showScannedFieldsModal(response.fields);
        }
        else {
            actions.showNotification('No form fields found on this page');
        }
    }
    catch (error) {
        console.error('Error scanning form fields:', error);
        actions.showNotification('Failed to scan form fields. Make sure you are on a valid web page.');
    }
}

// Show scanned fields modal
export function showScannedFieldsModal(fields: any[]) {
    const now = new Date();
    const timestamp = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const defaultName = `Auto-scanned Preset ${timestamp}`;
    const bodyContent = `
    <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 14px;">
      Found <strong style="color: var(--primary-color);">${fields.length}</strong> form field(s) on this page.
    </p>
    <div class="form-group">
      <label for="presetName">Preset Name *</label>
      <input type="text" id="presetName" placeholder="Enter preset name" value="${defaultName}" />
    </div>
    <div class="form-group">
      <label for="presetDescription">Description</label>
      <textarea id="presetDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-actions">
    <button id="cancelScannedFieldsBtn" class="cyber-btn cyber-btn--secondary">Cancel
      <span class="cyber-btn__glitch"></span>
      <span class="cyber-btn__label">[esc]</span>
    </button>
    <button id="saveScannedFieldsBtn" class="cyber-btn">Save as Preset
      <span class="cyber-btn__glitch"></span>
      <span class="cyber-btn__label">[enter]</span>
    </button>
    </div>
  `;
    showModal('Scanned Form Fields', bodyContent);
    document.getElementById('saveScannedFieldsBtn')?.addEventListener('click', async () => {
        const presetName = (document.getElementById('presetName') as HTMLInputElement).value.trim();
        const presetDescription = (document.getElementById('presetDescription') as HTMLTextAreaElement).value.trim();
        if (!presetName) {
            actions.showNotification('Preset name is required');
            return;
        }
        // Create form data from all scanned fields
        const formData: FormFieldData[] = fields.map((field, index) => ({
            id: field.id || `field_${Date.now()}_${index}`,
            type: field.type as FormFieldData['type'],
            title: field.title || '',
            value: field.value === null || field.value === undefined ? null : field.value,
            testId: field.testId || '',
            querySelector: field.querySelector || '',
            fillDelay: 0,
            autoBlur: true,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: index + 1
        }));
        // Create new preset
        const newPreset = await StorageService.addPreset({
            name: presetName,
            description: presetDescription || `Auto-scanned from page on ${new Date().toLocaleDateString()}`,
            formData
        });
        // Link preset to current page
        if (state.currentPageData) {
            await StorageService.linkPresetToPage(newPreset.id, state.currentPageData.id);
        }
        hideModal();
        actions.showNotification(`Preset "${presetName}" created with ${fields.length} field(s)!`, async () => {
            await actions.loadPageData();
        });
    });
    document.getElementById('cancelScannedFieldsBtn')?.addEventListener('click', () => {
        hideModal();
    });
}

// Open preset editor
export function openPresetEditor(presetId?: string) {
    const basePath = 'html/page-profile-editor.html';
    const pageIdParam = `pageId=${encodeURIComponent(state.currentPageData!.id)}`;
    const url = presetId
        ? `${basePath}?${pageIdParam}&presetId=${encodeURIComponent(presetId)}`
        : `${basePath}?${pageIdParam}`;
    chrome.tabs.create({ url: chrome.runtime.getURL(url) });
}

// Show link preset modal
export async function showLinkPresetModal() {
    if (!state.currentPageData)
        return;
    const data = await StorageService.getData();
    if (!data)
        return;
    // Get all presets
    const allPresets = data.presets;
    // Get current page's linked presets
    const currentPresetIds = data.presetPageLinks
        .filter(link => link.pageId === state.currentPageData!.id)
        .map(link => link.presetId);
    // Filter out already linked presets
    const availablePresets = allPresets.filter(p => !currentPresetIds.includes(p.id));
    if (availablePresets.length === 0) {
        actions.showNotification('No available presets to link. All presets are already linked to this page.');
        return;
    }
    const bodyContent = `
    <p>Select preset(s) to link to this page:</p>
    <div class="modal-selection-counter">Selected: 0 / ${availablePresets.length}</div>
    <div class="preset-list">
      ${availablePresets.map(preset => `
        <label class="preset-item" data-id="${preset.id}">
          <input type="checkbox" class="preset-checkbox" value="${preset.id}" />
          <div class="preset-content">
            <div class="preset-card-name">${preset.name}</div>
            <div class="preset-card-description">${preset.description || 'No description'}</div>
          </div>
        </label>
      `).join('')}
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
      <button id="linkPresetCancelBtn" class="cyber-btn cyber-btn--secondary">
        Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="linkPresetConfirmBtn" class="cyber-btn">
        Confirm
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Link Existing Preset', bodyContent);
    // Add handlers after modal is shown
    setTimeout(() => {
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.preset-checkbox:checked').length;
            const totalCount = availablePresets.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.preset-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        document.getElementById('linkPresetCancelBtn')?.addEventListener('click', () => {
            hideModal();
        });
        document.getElementById('linkPresetConfirmBtn')?.addEventListener('click', async () => {
            const selectedPresetIds: string[] = [];
            document.querySelectorAll('.preset-checkbox:checked').forEach(cb => {
                selectedPresetIds.push((cb as HTMLInputElement).value);
            });
            if (selectedPresetIds.length === 0) {
                actions.showNotification('Please select at least one preset to link.');
                return;
            }
            // Link all selected presets
            for (const presetId of selectedPresetIds) {
                await StorageService.linkPresetToPage(presetId, state.currentPageData!.id);
            }
            hideModal();
            const message = selectedPresetIds.length === 1
                ? 'Preset linked successfully!'
                : `${selectedPresetIds.length} presets linked successfully!`;
            actions.showNotification(message, async () => {
                await actions.loadPageData();
            });
        });
    }, 0);
}
