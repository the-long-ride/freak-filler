import { StorageService } from '../services/storage.service';
import { getTestId, getSelector } from './element-helpers';
import { showNotification } from '../utils/notification';
import { ICON_MAP } from '../constants/svgs';

export let currentInputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null;

export function setCurrentInputElement(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) {
  currentInputElement = element;
}

export async function setupImportSection(
  popup: HTMLElement,
  inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  pageData: any,
  afterClick?: () => void
) : Promise<void> {
  const savedValuesSection = popup.querySelector('.saved-values-section') as HTMLElement;
  const presetValuesSection = popup.querySelector('.preset-values-section') as HTMLElement;
  const noteMessage = popup.querySelector('.import-section .note-message') as HTMLElement;
  const savedValuesGridBody = popup.querySelector('.saved-values-grid .grid-body') as HTMLElement;
  const presetValuesGridBody = popup.querySelector('.preset-values-grid .grid-body') as HTMLElement;

  if (!savedValuesGridBody || !presetValuesGridBody) {
    return;
  }

  const testId = getTestId(inputElement);
  const querySelector = getSelector(inputElement);

  const appendGridRow = (
    container: HTMLElement,
    cells: { text: string; title?: string }[],
    onClick?: () => void
  ) => {
    const row = document.createElement('div');
    row.className = 'grid-row';

    cells.forEach(({ text, title }) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.textContent = text;
      if (title) {
        cell.title = title;
      }
      row.appendChild(cell);
    });

    if (onClick) {
      row.addEventListener('click', onClick);
    }

    container.appendChild(row);
  };

  savedValuesGridBody.innerHTML = '';
  presetValuesGridBody.innerHTML = '';
  
  let hasSavedValues = false;
  let hasPresetValues = false;

  // Populate saved values grid
  if (pageData?.id) {
    const savedValues = await StorageService.getSavedValuesForPage(pageData.id);
    const matchingSavedValues = savedValues
      .filter((sv: any) => 
        (testId && sv.testId === testId) || (querySelector && sv.querySelector === querySelector)
      )
      .sort((a: any, b: any) => (a.label || '').localeCompare(b.label || ''));

    if (matchingSavedValues.length > 0) {
      hasSavedValues = true;
      matchingSavedValues.forEach((sv: any) => {
        const value = String(sv.value ?? '');
        const label = sv.label || 'Saved';
        const displayValue = value.length > 30 ? `${value.substring(0, 30)}...` : value;

        // Build row with three cells: label, value, actions
        const row = document.createElement('div');
        row.className = 'grid-row';

        const cellLabel = document.createElement('div');
        cellLabel.className = 'grid-cell';
        cellLabel.textContent = label;

        const cellValue = document.createElement('div');
        cellValue.className = 'grid-cell';
        cellValue.textContent = displayValue;
        cellValue.title = value;

        const cellActions = document.createElement('div');
        cellActions.className = 'grid-cell';
        cellActions.classList.add('actions');

        const importBtn = document.createElement('button');
        importBtn.type = 'button';
        importBtn.className = 'import-value-btn';
        importBtn.innerHTML = 'APPLY';
        importBtn.title = 'Import this value into the field';

        importBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentInputElement) {
            currentInputElement.value = value;
            currentInputElement.dispatchEvent(new Event('input', { bubbles: true }));
          }
          afterClick?.();
        });

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'delete-saved-value-btn';
        delBtn.innerHTML = 'DEL';
        delBtn.title = 'Delete this saved value';

        delBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            if (!pageData?.url) return;
            await StorageService.deleteSavedFormData(pageData.url, sv.id);
            showNotification('Saved value deleted');

            // Remove the row from the DOM immediately for a snappier UI
            if (row && row.parentElement) {
              row.parentElement.removeChild(row);
            }

            // Refresh the import section to ensure consistent state using local inputElement
            setupImportSection(popup, inputElement, pageData, afterClick);
          } catch (err) {
            console.error('Failed to delete saved value:', err);
            showNotification('Failed to delete saved value');
          }
        });

        cellActions.appendChild(importBtn);
        cellActions.appendChild(delBtn);

        row.appendChild(cellLabel);
        row.appendChild(cellValue);
        row.appendChild(cellActions);

        // Row click still imports value
        // row.addEventListener('click', () => {
        //   if (currentInputElement) {
        //     currentInputElement.value = value;
        //     currentInputElement.dispatchEvent(new Event('input', { bubbles: true }));
        //   }
        //   afterClick?.();
        // });

        savedValuesGridBody.appendChild(row);
      });
    }
  }

  // Populate preset values grid
  if (pageData?.id) {
    const presets = await StorageService.getPresetsForPage(pageData.id);
    const presetValues: any[] = [];
    
    presets.forEach((preset: any) => {
      if (preset.formData?.length > 0) {
        const matchingFields = preset.formData.filter((field: any) => 
          (testId && field.testId === testId) || (querySelector && field.querySelector === querySelector)
        );

        matchingFields.forEach((field: any) => {
          presetValues.push({
            presetName: preset.name,
            fieldTitle: field.title || 'Field',
            value: field.value
          });
        });
      }
    });

    presetValues.sort((a, b) => {
      const presetCompare = a.presetName.localeCompare(b.presetName);
      if (presetCompare !== 0) return presetCompare;
      return a.fieldTitle.localeCompare(b.fieldTitle);
    });

    if (presetValues.length > 0) {
      hasPresetValues = true;
      presetValues.forEach((item) => {
        const value = String(item.value ?? '');
        const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;

        appendGridRow(
          presetValuesGridBody,
          [
            { text: item.presetName },
            { text: item.fieldTitle },
            { text: displayValue, title: value },
          ],
          () => {
            if (currentInputElement) {
              currentInputElement.value = value;
              currentInputElement.dispatchEvent(new Event('input', { bubbles: true }));
            }
            afterClick?.();
          }
        );
      });
    }
  }
  
  savedValuesSection.style.display = hasSavedValues ? 'block' : 'none';
  presetValuesSection.style.display = hasPresetValues ? 'block' : 'none';
  noteMessage.style.display = (!hasSavedValues && !hasPresetValues) ? 'block' : 'none';
}
