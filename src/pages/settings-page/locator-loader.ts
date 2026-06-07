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

// Load locators
export async function loadLocators() {
    const data = await StorageService.getData();
    if (!data)
        return;
    const tbody = document.getElementById('locatorsTableBody');
    if (!tbody)
        return;
    // Collect all locators from presets and saved values
    const locatorMap = new Map<string, {
        testId: string;
        querySelector: string;
        count: number;
    }>();
    // From presets
    data.presets.forEach(preset => {
        preset.formData.forEach(field => {
            const key = `${field.testId}|${field.querySelector}`;
            const existing = locatorMap.get(key);
            if (existing) {
                existing.count++;
            }
            else {
                locatorMap.set(key, {
                    testId: field.testId,
                    querySelector: field.querySelector,
                    count: 1
                });
            }
        });
    });
    // From saved values
    data.savedValues.forEach(sv => {
        const key = `${sv.testId}|${sv.querySelector}`;
        const existing = locatorMap.get(key);
        if (existing) {
            existing.count++;
        }
        else {
            locatorMap.set(key, {
                testId: sv.testId,
                querySelector: sv.querySelector,
                count: 1
            });
        }
    });
    // Convert to array for sorting
    const locatorArray = Array.from(locatorMap.entries()).map(([key, locator]) => ({
        key,
        ...locator
    }));
    // Sort the locators
    const sortedLocators = actions.sortData(locatorArray, state.sortStates.locators.column, state.sortStates.locators.direction);
    // Update record count
    const countElement = document.getElementById('locatorsCount');
    if (countElement) {
        const count = locatorMap.size;
        countElement.textContent = buildQuantityString(count);
    }
    if (locatorMap.size === 0) {
        tbody.innerHTML = '<div class="no-data">No locators found</div>';
        return;
    }
    tbody.innerHTML = '';
    sortedLocators.forEach((locator) => {
        const row = document.createElement('div');
        row.className = 'data-grid-row';
        row.dataset.locatorKey = locator.key;
        row.innerHTML = `
      <div>
        <input type="text" class="locator-testid" value="${escapeHtml(locator.testId || '')}" />
      </div>
      <div>
        <input type="text" class="locator-selector" value="${escapeHtml(locator.querySelector || '')}" />
      </div>
      <div>${locator.count}</div>
    `;
        tbody.appendChild(row);
    });
    // Add change listeners to show save/cancel buttons
    tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => actions.showLocatorButtons());
    });
}
