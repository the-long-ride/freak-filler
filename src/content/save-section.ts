import { StorageService } from '../services/storage.service';
import { generateGuid, getCurrentTimestamp } from '../utils/helpers';
import { FormFieldData } from '../types';
import { setupImportSection } from './import-section';
import { FillableElement, getEditableValue, getElementLabel, getFieldTypeForElement, populateIdentifiers } from './element-helpers';
import { showNotification } from '../utils/notification';

export async function setupSaveSection(
  popup: HTMLElement,
  inputElement: FillableElement,
  pageData: any
) {
  const nameInput = popup.querySelector('.name-input') as HTMLInputElement;
  const saveTarget = popup.querySelector('.save-target') as HTMLSelectElement;
  const presetSelectorRow = popup.querySelector('.preset-selector-row') as HTMLElement;
  const presetSelector = popup.querySelector('.preset-selector') as HTMLSelectElement;
  const testIdInput = popup.querySelector('.test-id-input') as HTMLInputElement;
  const selectorInput = popup.querySelector('.selector-input') as HTMLInputElement;
  const saveBtn = popup.querySelector('.save-btn') as HTMLButtonElement;
  // Basic null checks to avoid runtime errors (save-message removed; notifications now use showNotification)
  if (!nameInput || !saveTarget || !presetSelectorRow || !presetSelector || !testIdInput || !selectorInput || !saveBtn) {
    console.warn('Missing save-section DOM elements, aborting setupSaveSection');
    return;
  }

  // Helper to dispatch notification events handled by content.ts
  const dispatchNotification = (text: string) => {
    try {
      document.dispatchEvent(new CustomEvent('formFiller:notify', { detail: { message: text } }));
    } catch (e) {
      console.warn('Failed to dispatch notification event', e);
    }
  };

  // Auto-generate name from field attributes
  nameInput.value = getElementLabel(inputElement);

  // Auto-populate test ID and selector
  populateIdentifiers(inputElement, testIdInput, selectorInput);

  // Populate preset selector
  if (pageData?.id) {
    const presets = await StorageService.getPresetsForPage(pageData.id);
    if (presets.length > 0) {
      presets.forEach((preset: any) => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        presetSelector.appendChild(option);
      });
    }
  }

  // Apply default save target from settings
  try {
    const settings = await StorageService.getSettings();
    if (settings && settings.defaultSaveItemTo) {
      // If there are no presets available, don't default to 'preset'
      const hasPresets = presetSelector.options.length > 0;
      if (settings.defaultSaveItemTo === 'preset' && !hasPresets) {
        saveTarget.value = 'savedValues';
      } else {
        saveTarget.value = settings.defaultSaveItemTo;
      }
    }
  } catch (err) {
    // ignore and keep existing default
    console.warn('Failed to load settings for default save target', err);
  }

  // Toggle preset selector visibility
  const updatePresetRow = () => {
    // If user selected preset but there are no presets, show saved instead
    if (saveTarget.value === 'preset' && presetSelector.options.length === 0) {
      presetSelectorRow.style.display = 'none';
      saveTarget.value = 'savedValues';
      return;
    }
    presetSelectorRow.style.display = saveTarget.value === 'preset' ? 'flex' : 'none';
  };

  // Set initial visibility based on current value (including applied default)
  updatePresetRow();

  saveTarget.addEventListener('change', () => {
    updatePresetRow();
  });

  // Save button handler
  saveBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const value = getEditableValue(inputElement);
    const testId = testIdInput.value.trim();
    const selector = selectorInput.value.trim();
    const currentUrl = window.location.href;

    // clear any previous inline messages (using toast notifications instead)

    if (!name) {
      dispatchNotification('Name cannot be empty');
      return;
    }

    if (!value) {
      dispatchNotification('Please enter a value in the input field first');
      return;
    }

    if (saveTarget.value === 'savedValues') {
      // Get page data to find pageId
      const currentPageData = await StorageService.getCurrentPageData(currentUrl);
      if (!currentPageData) {
        dispatchNotification('Page not found');
        return;
      }

      await StorageService.addSavedValue(currentPageData.id, {
        id: generateGuid(),
        label: name,
        value: value,
        testId: testId,
        querySelector: selector,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      });
      dispatchNotification('Value saved successfully!');
    } else if (saveTarget.value === 'preset') {
      const presetId = presetSelector.value;
      if (!presetId) {
        dispatchNotification('Please select a preset');
        return;
      }

      const preset = await StorageService.getPresetById(presetId);
      if (preset) {
        // Only check for duplicates if both testId AND querySelector match
        const existingField = preset.formData.find((f: any) => 
          testId && selector && f.testId === testId && f.querySelector === selector
        );

        if (existingField) {
          dispatchNotification('A field with this Data test ID and Selector already exists in the preset');
          return;
        }

        // Calculate max order + 1
        const maxOrder = preset.formData.reduce((max: number, item: any) => 
          Math.max(max, item.order || 0), 0);

        const fieldData: FormFieldData = {
          id: generateGuid(),
          type: getFieldTypeForElement(inputElement),
          title: name,
          value: value,
          testId: testId,
          querySelector: selector,
          fillDelay: 0,
          autoBlur: true,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
          order: maxOrder + 1
        };

        preset.formData.push(fieldData);
        await StorageService.updatePreset(presetId, {
          formData: preset.formData
        });
        dispatchNotification('Value saved to preset successfully!');
      }
    }

    await setupImportSection(popup, inputElement, pageData, () => {showNotification('Value imported into the field.');});
  });
}
