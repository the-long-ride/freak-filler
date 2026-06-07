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

/**
 * Create a custom-styled select to replace native promptsSelect for consistent styling.
 * Keeps the original select element in sync (but hidden) so form logic remains compatible.
 */
export function initCustomPromptsSelect(nativeSelect: HTMLSelectElement, textarea: HTMLTextAreaElement, pagePrompt: string, presetPrompt: string) {
    // Build custom select wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `<span class="custom-select__label">${nativeSelect.options[nativeSelect.selectedIndex]?.text || ''}</span><span class="custom-select__arrow"></span>`;
    const optionsList = document.createElement('div');
    optionsList.className = 'custom-select__options';
    optionsList.setAttribute('role', 'listbox');
    // Populate options from native select
    Array.from(nativeSelect.options).forEach((opt) => {
        const item = document.createElement('div');
        item.className = 'custom-select__option';
        item.setAttribute('data-value', opt.value);
        item.textContent = opt.text;
        if (opt.selected)
            item.setAttribute('aria-selected', 'true');
        optionsList.appendChild(item);
    });
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsList);
    // Insert wrapper after native select
    nativeSelect.parentNode?.insertBefore(wrapper, nativeSelect.nextSibling || null);
    // Hide native select visually but keep it in DOM for forms
    nativeSelect.classList.add('native-select-hidden');
    const updateTextarea = (value: string) => {
        if (value === 'page')
            textarea.value = pagePrompt;
        else
            textarea.value = presetPrompt;
    };
    // Toggle open/close
    const closeOptions = () => {
        wrapper.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    };
    const openOptions = () => {
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
    };
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrapper.classList.contains('open'))
            closeOptions();
        else
            openOptions();
    });
    // Option click
    optionsList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const option = target.closest('.custom-select__option') as HTMLElement | null;
        if (!option)
            return;
        const val = option.getAttribute('data-value') || '';
        // Update native select
        nativeSelect.value = val;
        // Update selected visuals
        optionsList.querySelectorAll('.custom-select__option').forEach(el => el.removeAttribute('aria-selected'));
        option.setAttribute('aria-selected', 'true');
        // Update trigger label
        const label = wrapper.querySelector('.custom-select__label') as HTMLElement;
        if (label)
            label.textContent = option.textContent || '';
        // Update textarea accordingly
        updateTextarea(val);
        // Close
        closeOptions();
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target as Node)) {
            closeOptions();
        }
    });
    // Keyboard support
    wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Escape')
            closeOptions();
    });
    // Initialize textarea based on current value
    updateTextarea(nativeSelect.value);
}
