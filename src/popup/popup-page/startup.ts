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

// Initialize popup
export async function init() {
    try {
        // Initialize theme
        await initTheme();
        // Initialize version
        await initVersion();
        // Initialize cyber buttons
        initCyberButtons();
        // Initialize icon replacement
        initIconReplacement();
        // Initialize guide overlays
        initGuideOverlays();
        // Get current tab URL and title
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url) {
            state.currentUrl = tabs[0].url;
            state.currentTabTitle = tabs[0].title || '';
        }
        // Load page data
        await actions.loadPageData();
        // Load settings to check if random string section should be shown
        const settings = await StorageService.getSettings();
        const randomStringSection = document.getElementById('randomStringSection');
        if (randomStringSection && settings?.enableRandomStringSectionInPopup) {
            randomStringSection.style.display = 'block';
            actions.initRandomStringSection(settings);
        }
        // Setup settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('./html/settings.html') });
        });
        // Setup string counter button
        document.getElementById('stringCounterBtn')?.addEventListener('click', () => {
            actions.showStringCounterModal();
        });
        // Header actions: show ability text in .app-version on hover/focus
        const headerActions = document.querySelector('.header-actions');
        const appVersionEl = document.querySelector('.app-version');
        if (headerActions && appVersionEl) {
            const originalText = appVersionEl.textContent || '';
            const buttons = Array.from(headerActions.querySelectorAll('button'));
            let hoverCount = 0;
            let hideTimeout: number | null = null;
            const HIDE_DELAY = 1000; // ms
            buttons.forEach((btn) => {
                const abilityText = (btn.getAttribute('title') || btn.getAttribute('data-tooltip') || btn.textContent || '')
                    + '  ➤ ';
                const show = () => {
                    // Cancel any pending hide
                    if (hideTimeout !== null) {
                        clearTimeout(hideTimeout);
                        hideTimeout = null;
                    }
                    hoverCount++;
                    appVersionEl.textContent = String(abilityText || originalText);
                    appVersionEl.classList.add('highlighted');
                };
                const hide = () => {
                    hoverCount = Math.max(0, hoverCount - 1);
                    // Delay restoring to avoid flicker when moving between buttons
                    if (hoverCount === 0) {
                        hideTimeout = window.setTimeout(() => {
                            appVersionEl.textContent = originalText;
                            appVersionEl.classList.remove('highlighted');
                            hideTimeout = null;
                        }, HIDE_DELAY);
                    }
                };
                btn.addEventListener('mouseenter', show);
                btn.addEventListener('mouseleave', hide);
                btn.addEventListener('focus', show);
                btn.addEventListener('blur', hide);
            });
        }
    }
    catch (error) {
        console.error('Failed to initialize popup:', error);
        // Show error in UI
        document.body.innerHTML = `
      <div style="padding: 20px; color: #ff4466;">
        <h3>Error loading popup</h3>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre style="font-size: 10px; overflow: auto;">${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
    }
}

// Format date to: Jan 01, 25 HH:mm:ss
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
}

// Show notification modal (replaces alert)
export function showNotification(message: string, onClose?: () => void) {
    const bodyContent = `
    <div style="padding: 20px; text-align: center;">
      <p style="margin: 0; color: var(--text-primary); font-size: 14px; line-height: 1.5;">${message}</p>
      <div class="form-actions" style="justify-content: center; margin-top: 20px;">
        <button class="cyber-btn" id="okButton">OK
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Notification', bodyContent, onClose);
    setTimeout(() => {
        document.getElementById('okButton')?.addEventListener('click', () => {
            hideModal();
            onClose?.();
        });
    }, 0);
}

// Show confirmation modal (replaces confirm)
export function showConfirmation(message: string, onConfirm: () => void, onCancel?: () => void) {
    const bodyContent = `
    <div style="padding: 20px; text-align: center;">
      <p style="margin: 0; color: var(--text-primary); font-size: 14px; line-height: 1.5;">${message}</p>
    </div>
    <div class="form-actions" style="margin-top: 20px; justify-content: center; gap: 12px;">
      <button id="confirmNoBtn" class="cyber-btn cyber-btn--secondary">No
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">no</span>
      </button>
      <button id="confirmYesBtn" class="cyber-btn">Yes
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">yes</span>
      </button>
    </div>
  `;
    showModal('Confirmation', bodyContent, onCancel);
    setTimeout(() => {
        let actionHandled = false;
        document.getElementById('confirmYesBtn')?.addEventListener('click', () => {
            if (actionHandled)
                return;
            actionHandled = true;
            hideModal();
            onConfirm();
        });
        document.getElementById('confirmNoBtn')?.addEventListener('click', () => {
            if (actionHandled)
                return;
            actionHandled = true;
            hideModal();
            if (onCancel)
                onCancel();
        });
    }, 0);
}

// Load settings
export async function loadSettings() {
    const settings = await StorageService.getSettings();
    const enableSaveValueCheckbox = document.getElementById('enableSaveValue') as HTMLInputElement | null;
    const enableImportValueCheckbox = document.getElementById('enableImportValue') as HTMLInputElement | null;
    const enableLiveAssistantCheckbox = document.getElementById('enableLiveAssistant') as HTMLInputElement | null;
    if (settings && enableSaveValueCheckbox) {
        enableSaveValueCheckbox.checked = settings.enableSaveValue;
    }
    if (settings && enableImportValueCheckbox) {
        enableImportValueCheckbox.checked = settings.enableImportValue;
    }
    if (settings && enableLiveAssistantCheckbox) {
        enableLiveAssistantCheckbox.checked = settings.enableLiveAssistant;
    }
    // Update dependent toggles state
    actions.updateDependentToggles();
    if (enableSaveValueCheckbox) {
        enableSaveValueCheckbox.addEventListener('change', async () => {
            const currentSettings = await StorageService.getSettings();
            if (!currentSettings)
                return;
            await StorageService.setSettings({
                ...currentSettings,
                enableSaveValue: enableSaveValueCheckbox.checked
            });
        });
    }
    if (enableImportValueCheckbox) {
        enableImportValueCheckbox.addEventListener('change', async () => {
            const currentSettings = await StorageService.getSettings();
            if (!currentSettings)
                return;
            await StorageService.setSettings({
                ...currentSettings,
                enableImportValue: enableImportValueCheckbox.checked
            });
        });
    }
    if (enableLiveAssistantCheckbox) {
        enableLiveAssistantCheckbox.addEventListener('change', async () => {
            const currentSettings = await StorageService.getSettings();
            if (!currentSettings)
                return;
            await StorageService.setSettings({
                ...currentSettings,
                enableLiveAssistant: enableLiveAssistantCheckbox.checked
            });
            actions.updateDependentToggles();
        });
    }
}

// Update dependent toggles based on enableLiveAssistant state
export function updateDependentToggles() {
    const enableLiveAssistantCheckbox = document.getElementById('enableLiveAssistant') as HTMLInputElement | null;
    const enableSaveValueCheckbox = document.getElementById('enableSaveValue') as HTMLInputElement | null;
    const enableImportValueCheckbox = document.getElementById('enableImportValue') as HTMLInputElement | null;
    const isLiveAssistantEnabled = enableLiveAssistantCheckbox?.checked ?? false;
    // Disable save/import toggles when live assistant is OFF
    if (enableSaveValueCheckbox) {
        enableSaveValueCheckbox.disabled = !isLiveAssistantEnabled;
        enableSaveValueCheckbox.parentElement?.classList.toggle('disabled', !isLiveAssistantEnabled);
    }
    if (enableImportValueCheckbox) {
        enableImportValueCheckbox.disabled = !isLiveAssistantEnabled;
        enableImportValueCheckbox.parentElement?.classList.toggle('disabled', !isLiveAssistantEnabled);
    }
}
