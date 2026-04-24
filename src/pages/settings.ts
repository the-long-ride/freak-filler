import { StorageService } from '../services/storage.service';
import { PageData, Preset, FormFieldData, RootData, ExtensionSettings, SaveItemTarget, RandomStringCharset } from '../types';
import { escapeHtml, initTheme, initVersion } from '../utils/common';
import { getCurrentTimestamp, generateGuid, buildQuantityString } from '../utils/helpers';
import { showConfirm, showToast, showModal, hideModal } from '../utils/modal-utils';
import { downloadFile } from '../utils/common';
import { createExportFile, parseExtensionExportJson } from '../utils/export-format';
import { initIconReplacement } from '../utils/icon-replacer';
import { initCyberButtons } from '../utils/cyber-btn-init';
import { initGuideOverlays } from '../utils/guide-overlay';
import { DEFAULTS } from '../constants/appConstants';

let hasUnsavedChanges = false;
let originalData: RootData | null = null;
let originalSettings: any = null;
let draggedRegexPatternRow: HTMLElement | null = null;

// Sorting state for data grids
interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

const sortStates: { [key: string]: SortState } = {
  regexPatterns: { column: 'name', direction: 'asc' },
  locators: { column: 'testId', direction: 'asc' },
  pages: { column: 'pageTitle', direction: 'asc' },
  presets: { column: 'name', direction: 'asc' },
  lengthConfig: { column: 'name', direction: 'asc' }
};

// Update filling assistant note visibility based on toggle states
function updateFillingAssistantNoteVisibility() {
  const enableSaveValue = (document.getElementById('enableSaveValue') as HTMLInputElement)?.checked ?? false;
  const enableImportValue = (document.getElementById('enableImportValue') as HTMLInputElement)?.checked ?? false;
  const enableLocatorRetriever = (document.getElementById('enableLocatorRetriever') as HTMLInputElement)?.checked ?? false;
  const enableRegexPattern = (document.getElementById('enableRegexPattern') as HTMLInputElement)?.checked ?? false;
  const enableRandomStringInAssistant = (document.getElementById('enableRandomStringInAssistant') as HTMLInputElement)?.checked ?? false;

  const fillingAssistantNote = document.getElementById('fillingAssistantNote');

  // Show note only when ALL toggles are off
  const allTogglesOff = !enableSaveValue && !enableImportValue &&
    !enableLocatorRetriever && !enableRegexPattern && !enableRandomStringInAssistant;

  if (fillingAssistantNote) {
    fillingAssistantNote.style.display = allTogglesOff ? 'block' : 'none';
  }
}

// Generic sorting function
function sortData<T>(data: T[], column: string, direction: 'asc' | 'desc', extraData?: any): T[] {
  return [...data].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    // Handle computed fields for presets
    if (extraData && column === 'fieldCount') {
      aVal = (a as any).formData?.length || 0;
      bVal = (b as any).formData?.length || 0;
    } else if (extraData && column === 'linkedPages') {
      const presetIdA = (a as any).id;
      const presetIdB = (b as any).id;
      aVal = extraData.presetPageLinks.filter((l: any) => l.presetId === presetIdA).length;
      bVal = extraData.presetPageLinks.filter((l: any) => l.presetId === presetIdB).length;
    } else {
      aVal = (a as any)[column];
      bVal = (b as any)[column];
    }

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? -1 : 1;
    if (bVal == null) return direction === 'asc' ? 1 : -1;

    // Handle string comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const comparison = aVal.localeCompare(bVal);
      return direction === 'asc' ? comparison : -comparison;
    }

    // Handle number comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle date comparison
    if (aVal instanceof Date && bVal instanceof Date) {
      return direction === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
    }

    // Convert to string for other types
    const aStr = String(aVal);
    const bStr = String(bVal);
    const comparison = aStr.localeCompare(bStr);
    return direction === 'asc' ? comparison : -comparison;
  });
}

// Update sort indicators for a table
function updateSortIndicators(tableId: string) {
  const grid = document.getElementById(`${tableId}Grid`);
  if (!grid) return;

  const headers = grid.querySelectorAll('.sortable-header');
  headers.forEach(header => {
    header.classList.remove('sort-asc', 'sort-desc');
  });

  const sortState = sortStates[tableId];
  if (sortState) {
    const activeHeader = grid.querySelector(`.sortable-header[data-sort="${sortState.column}"]`) as HTMLElement;
    if (activeHeader) {
      activeHeader.classList.add(`sort-${sortState.direction}`);
    }
  }
}

// Handle header click for sorting
function handleHeaderClick(tableId: string, column: string) {
  const sortState = sortStates[tableId];
  if (sortState.column === column) {
    // Toggle direction if same column
    sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to ascending
    sortState.column = column;
    sortState.direction = 'asc';
  }

  updateSortIndicators(tableId);

  // Reload the table with new sorting
  switch (tableId) {
    case 'regexPatterns':
      loadRegexPatterns();
      break;
    case 'locators':
      loadLocators();
      break;
    case 'pages':
      loadPages();
      break;
    case 'presets':
      loadPresets();
      break;
    case 'lengthConfig':
      loadLengthConfigurations();
      break;
  }
}

// Helper function to update a single setting
async function updateSetting<K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K], message = '') {
  const settings = await StorageService.getSettings();
  if (settings) {
    await StorageService.setSettings({
      ...settings,
      [key]: value
    });
    if (message) {
      showToast(message, 'success');
    }
  }
}

// Initialize
async function init() {
  await initTheme();
  await initVersion();
  initCyberButtons(); // Initialize static header buttons first
  initIconReplacement();
  // Initialize guide overlays (settings page)
  initGuideOverlays();
  await loadSettings();
  await loadData();
  setupEventListeners();

  // Initialize sort indicators
  updateSortIndicators('regexPatterns');
  updateSortIndicators('locators');
  updateSortIndicators('pages');
  updateSortIndicators('presets');
  updateSortIndicators('lengthConfig');
}

// Load settings
async function loadSettings() {
  const settings = await StorageService.getSettings();
  originalSettings = JSON.parse(JSON.stringify(settings));

  const enableLiveAssistant = document.getElementById('enableLiveAssistant') as HTMLInputElement;
  const enableSaveValue = document.getElementById('enableSaveValue') as HTMLInputElement;
  const enableImportValue = document.getElementById('enableImportValue') as HTMLInputElement;
  const enableLocatorRetriever = document.getElementById('enableLocatorRetriever') as HTMLInputElement;
  const enableRegexPattern = document.getElementById('enableRegexPattern') as HTMLInputElement;
  const enableRandomStringInAssistant = document.getElementById('enableRandomStringInAssistant') as HTMLInputElement;
  const enableRandomStringSectionInPopup = document.getElementById('enableRandomStringSectionInPopup') as HTMLInputElement;
  const randomStringCharset = document.getElementById('randomStringCharset') as HTMLSelectElement;
  const randomStringLength = document.getElementById('randomStringLength') as HTMLInputElement;
  const defaultSaveTarget = document.getElementById('defaultSaveTarget') as HTMLSelectElement;

  if (settings) {
    enableLiveAssistant.checked = settings.enableLiveAssistant ?? false;
    enableSaveValue.checked = settings.enableSaveValue ?? true;
    enableImportValue.checked = settings.enableImportValue ?? true;
    enableLocatorRetriever.checked = settings.enableLocatorRetriever ?? false;
    enableRegexPattern.checked = settings.enableRegexPattern ?? false;
    enableRandomStringInAssistant.checked = settings.enableRandomStringInAssistant ?? false;
    enableRandomStringSectionInPopup.checked = settings.enableRandomStringSectionInPopup ?? DEFAULTS.ENABLE_RANDOM_STRING_SECTION;
    randomStringCharset.value = settings.randomStringCharset ?? 'alphanumeric-special';
    randomStringLength.value = String(settings.randomStringLength ?? DEFAULTS.RANDOM_STRING_LENGTH);
    // Populate and set default save target select
    if (defaultSaveTarget) {
      // Ensure options exist
      if (defaultSaveTarget.options.length === 0) {
        const optSaved = document.createElement('option');
        optSaved.value = 'savedValues';
        optSaved.text = 'Saved Values';
        defaultSaveTarget.add(optSaved);

        const optPreset = document.createElement('option');
        optPreset.value = 'preset';
        optPreset.text = 'Preset';
        defaultSaveTarget.add(optPreset);
      }

      defaultSaveTarget.value = settings.defaultSaveItemTo;
    }
  }

  // Update note visibility based on loaded settings
  updateFillingAssistantNoteVisibility();
}

// Load all data
async function loadData() {
  const data = await StorageService.getData();
  if (!data) return;

  originalData = JSON.parse(JSON.stringify(data));

  await loadLocators();
  await loadRegexPatterns();
  await loadLengthConfigurations();
  await loadPages();
  await loadPresets();
}

// Load locators
async function loadLocators() {
  const data = await StorageService.getData();
  if (!data) return;

  const tbody = document.getElementById('locatorsTableBody');
  if (!tbody) return;

  // Collect all locators from presets and saved values
  const locatorMap = new Map<string, { testId: string; querySelector: string; count: number }>();

  // From presets
  data.presets.forEach(preset => {
    preset.formData.forEach(field => {
      const key = `${field.testId}|${field.querySelector}`;
      const existing = locatorMap.get(key);
      if (existing) {
        existing.count++;
      } else {
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
    } else {
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
  const sortedLocators = sortData(locatorArray, sortStates.locators.column, sortStates.locators.direction);

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
    input.addEventListener('input', () => showLocatorButtons());
  });
}

// Load regex patterns
async function loadRegexPatterns() {
  // Use in-memory originalData when available so UI shows unsaved changes.
  let data: any = null;
  if (originalData) {
    data = originalData;
  } else {
    const stored = await StorageService.getData();
    if (!stored) return;
    // Work on a copy in memory so user can cancel/save later
    originalData = JSON.parse(JSON.stringify(stored));
    data = originalData;
  }

  const tbody = document.getElementById('regexPatternsTableBody');
  if (!tbody) return;

  // Ensure all patterns have order property (migration) on the in-memory copy
  data.regexPatterns.forEach((pattern: any, index: number) => {
    if (pattern.order === undefined) {
      pattern.order = index + 1;
    }
  });

  // Sort by order property
  const sortedPatterns = [...data.regexPatterns].sort((a: any, b: any) => a.order - b.order);

  // Update record count
  const countElement = document.getElementById('regexPatternsCount');
  if (countElement) {
    const count = data.regexPatterns.length;
    countElement.textContent = buildQuantityString(count);
  }

  if (data.regexPatterns.length === 0) {
    tbody.innerHTML = '<div class="no-data">No regex patterns found</div>';
    return;
  }

  tbody.innerHTML = '';
  sortedPatterns.forEach((pattern, index) => {
    const row = document.createElement('div');
    row.className = 'data-grid-row';
    row.draggable = true;
    row.dataset.regexPatternIndex = index.toString();
    row.dataset.patternName = pattern.name;
    row.innerHTML = `
      <div class="drag-handle" title="Drag to reorder">
        <span>⋮⋮</span>
      </div>
      <div>
        <input type="text" class="regex-pattern-name" value="${escapeHtml(pattern.name)}" />
      </div>
      <div>
        <input type="text" class="regex-pattern-regex" value="${escapeHtml(pattern.regex)}" />
      </div>
      <div class="table-actions">
        <button class="action-btn action-btn--delete" data-action="delete" data-index="${index}" data-icons="Trash"></button>
      </div>
    `;
    
    // Add drag & drop event listeners
    row.addEventListener('dragstart', handleRegexPatternDragStart);
    row.addEventListener('dragover', handleRegexPatternDragOver);
    row.addEventListener('drop', handleRegexPatternDrop);
    row.addEventListener('dragend', handleRegexPatternDragEnd);
    row.addEventListener('dragleave', handleRegexPatternDragLeave);
    
    tbody.appendChild(row);
  });

  // Initialize cyber buttons after dynamic content is rendered
  initCyberButtons();

  // Add change listeners to show save/cancel buttons
  tbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => showRegexPatternsButtons());
  });

  // Add action listeners
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteRegexPattern((btn as HTMLElement).dataset.index!));
  });
}

// Load length configurations
async function loadLengthConfigurations() {
  const data = await StorageService.getData();
  if (!data) return;

  const tbody = document.getElementById('lengthConfigTableBody');
  if (!tbody) return;

  // Sort the length configurations
  const sortedConfigs = sortData(data.lengthConfigurations, sortStates.lengthConfig.column, sortStates.lengthConfig.direction);

  // Update record count
  const countElement = document.getElementById('lengthConfigCount');
  if (countElement) {
    const count = data.lengthConfigurations.length;
    countElement.textContent = buildQuantityString(count);
  }

  if (data.lengthConfigurations.length === 0) {
    tbody.innerHTML = '<div class="no-data">No length configurations found</div>';
    return;
  }

  tbody.innerHTML = '';
  sortedConfigs.forEach((config, index) => {
    const row = document.createElement('div');
    row.className = 'data-grid-row';
    row.dataset.lengthConfigIndex = index.toString();
    row.innerHTML = `
      <div>
        <input type="text" class="length-config-name" value="${escapeHtml(config.name)}" />
      </div>
      <div>
        <input type="text" class="length-config-description" value="${escapeHtml(config.description)}" />
      </div>
      <div>
        <input type="text" class="length-config-locator" value="${escapeHtml(config.locator)}" />
      </div>
      <div>
        <input type="number" class="length-config-max-length" value="${config.maxLength}" min="1" max="99999" />
      </div>
      <div class="table-actions">
        <button class="action-btn action-btn--delete" data-action="delete" data-index="${index}" data-icons="Trash"></button>
      </div>
    `;
    tbody.appendChild(row);
  });

  // Initialize cyber buttons after dynamic content is rendered
  initCyberButtons();

  // Add change listeners to show save/cancel buttons
  tbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => showLengthConfigButtons());
  });

  // Add action listeners
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteLengthConfig((btn as HTMLElement).dataset.index!));
  });
}

// Load pages
async function loadPages() {
  const data = await StorageService.getData();
  if (!data) return;

  const tbody = document.getElementById('pagesTableBody');
  if (!tbody) return;

  // Sort the pages
  const sortedPages = sortData(data.pages, sortStates.pages.column, sortStates.pages.direction);

  // Update record count
  const countElement = document.getElementById('pagesCount');
  if (countElement) {
    const count = data.pages.length;
    countElement.textContent = buildQuantityString(count);
  }

  if (data.pages.length === 0) {
    tbody.innerHTML = '<div class="no-data">No pages found</div>';
    return;
  }

  tbody.innerHTML = '';
  sortedPages.forEach(page => {
    const row = document.createElement('div');
    row.className = 'data-grid-row';
    row.dataset.pageId = page.id;

    // Get latest preset for this page
    const pagePresetLinks = data.presetPageLinks.filter(l => l.pageId === page.id);
    const pagePresets = data.presets.filter(p => pagePresetLinks.some(l => l.presetId === p.id));
    const latestPreset = pagePresets.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    row.innerHTML = `
      <div><input type="text" class="page-title" value="${escapeHtml(page.pageTitle)}" /></div>
      <div><input type="text" class="page-url" value="${escapeHtml(page.url)}" /></div>
      <div><textarea class="page-description" rows="1">${escapeHtml(page.description || '')}</textarea></div>
      <div><input type="text" class="page-owner" value="${escapeHtml(page.owner || '')}" /></div>
      <div>
        <select class="page-match match-select">
          <option value="prefixMatch" ${page.matchIdentify === 'prefixMatch' ? 'selected' : ''}>Prefix</option>
          <option value="exactMatch" ${page.matchIdentify === 'exactMatch' ? 'selected' : ''}>Exact</option>
        </select>
      </div>
      <div>${new Date(page.updatedAt).toLocaleString()}</div>
      <div class="table-actions">
        <button class="action-btn action-btn--apply" data-action="open" data-id="${page.id}" data-preset-id="${latestPreset?.id || ''}">Open
        </button>
        <button class="action-btn action-btn--edit" data-action="duplicate" data-id="${page.id}" data-icons="Copy"></button>
        <button class="action-btn action-btn--delete" data-action="delete" data-id="${page.id}" data-icons="Trash"></button>
      </div>
    `;
    tbody.appendChild(row);
  });

  // Initialize cyber buttons after dynamic content is rendered
  initCyberButtons();

  // Add change listeners
  tbody.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => showPageButtons());
  });

  // Add action listeners
  tbody.querySelectorAll('[data-action="open"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pageId = (btn as HTMLElement).dataset.id!;
      const presetId = (btn as HTMLElement).dataset.presetId || '';
      const url = presetId
        ? `page-profile-editor.html?pageId=${encodeURIComponent(pageId)}&presetId=${encodeURIComponent(presetId)}`
        : `page-profile-editor.html?pageId=${encodeURIComponent(pageId)}`;
      // Open editor in the same tab instead of a new tab
      window.location.href = url;
    });
  });
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => handleDeletePage((btn as HTMLElement).dataset.id!));
  });
  tbody.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
    btn.addEventListener('click', () => handleDuplicatePage((btn as HTMLElement).dataset.id!));
  });
}

// Handle delete page
async function handleDeletePage(pageId: string) {
  const data = await StorageService.getData();
  if (!data) return;

  const page = data.pages.find(p => p.id === pageId);
  if (!page) return;

  const confirmed = await showConfirm(
    'Delete Page',
    `Delete "${page.pageTitle}"? This will also remove all associated presets links and saved values.`
  );

  if (!confirmed) return;

  // Remove page
  data.pages = data.pages.filter(p => p.id !== pageId);

  // Remove preset links
  data.presetPageLinks = data.presetPageLinks.filter(l => l.pageId !== pageId);

  // Remove saved values
  data.savedValues = data.savedValues.filter(sv => sv.pageId !== pageId);

  await StorageService.setData(data);
  await loadPages();
  showToast('Page deleted successfully', 'success');
}

// Handle duplicate page
async function handleDuplicatePage(pageId: string) {
  const data = await StorageService.getData();
  if (!data) return;

  const page = data.pages.find(p => p.id === pageId);
  if (!page) return;

  const newPage = await StorageService.addPage({
    pageTitle: `${page.pageTitle} (Copy)`,
    url: 'You have to set URL',
    description: page.description || '',
    owner: page.owner || '',
    matchIdentify: page.matchIdentify
  });

  // Don't clone preset links - new page starts empty

  await loadPages();
  showToast('Page duplicated successfully', 'success');
}

// Load presets
async function loadPresets() {
  const data = await StorageService.getData();
  if (!data) return;

  const tbody = document.getElementById('presetsTableBody');
  if (!tbody) return;

  // Sort the presets
  const sortedPresets = sortData(data.presets, sortStates.presets.column, sortStates.presets.direction, data);

  // Update record count
  const countElement = document.getElementById('presetsCount');
  if (countElement) {
    const count = data.presets.length;
    countElement.textContent = buildQuantityString(count);
  }

  if (data.presets.length === 0) {
    tbody.innerHTML = '<div class="no-data">No presets found</div>';
    return;
  }

  tbody.innerHTML = '';
  sortedPresets.forEach(preset => {
    const linkedPages = data.presetPageLinks.filter(l => l.presetId === preset.id);

    // Get latest modified page for this preset
    const presetPages = data.pages.filter(p => linkedPages.some(l => l.pageId === p.id));
    const latestPage = presetPages.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    const row = document.createElement('div');
    row.className = 'data-grid-row';
    row.dataset.presetId = preset.id;
    row.innerHTML = `
      <div><input type="text" class="preset-card-name" value="${escapeHtml(preset.name)}" /></div>
      <div><textarea class="preset-card-description" rows="1">${escapeHtml(preset.description || '')}</textarea></div>
      <div>${preset.formData.length}</div>
      <div>${linkedPages.length}</div>
      <div>${new Date(preset.updatedAt).toLocaleString()}</div>
      <div class="table-actions">
        <button class="action-btn action-btn--apply" data-action="edit" data-id="${preset.id}" data-page-id="${latestPage?.id || ''}" data-icons="Modify">Edit
        </button>
        <button class="action-btn action-btn--edit" data-action="clone" data-id="${preset.id}" data-icons="Copy"></button>
        <button class="action-btn action-btn--delete" data-action="delete" data-id="${preset.id}" data-icons="Trash"></button>
      </div>
    `;
    tbody.appendChild(row);
  });

  // Initialize cyber buttons after dynamic content is rendered
  initCyberButtons();

  // Add change listeners
  tbody.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => showPresetButtons());
  });

  // Add action listeners
  tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const presetId = (btn as HTMLElement).dataset.id!;
      try {
        const data = await StorageService.getData();
        if (!data) {
          showToast('Failed to load data', 'error');
          return;
        }

        const links = data.presetPageLinks.filter(l => l.presetId === presetId);

        let url: string;
        if (!links || links.length === 0) {
          // No links -> Preset-only mode (POM)
          url = `page-profile-editor.html?presetId=${encodeURIComponent(presetId)}`;
        } else {
          // If one link -> open that page with preset. If multiple -> use first record in presetPageLinks
          const targetPageId = links[0].pageId;
          url = `page-profile-editor.html?pageId=${encodeURIComponent(targetPageId)}&presetId=${encodeURIComponent(presetId)}`;
        }

        // Open editor in the same tab instead of a new tab
        window.location.href = url;
      } catch (err) {
        console.error('Failed to open preset editor:', err);
        showToast('Failed to open preset editor. Please try again.', 'error');
      }
    });
  });
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => handleDeletePreset((btn as HTMLElement).dataset.id!));
  });
  tbody.querySelectorAll('[data-action="clone"]').forEach(btn => {
    btn.addEventListener('click', () => handleClonePreset((btn as HTMLElement).dataset.id!));
  });
}

// Handle delete preset
async function handleDeletePreset(presetId: string) {
  const data = await StorageService.getData();
  if (!data) return;

  const preset = data.presets.find(p => p.id === presetId);
  if (!preset) return;

  const confirmed = await showConfirm(
    'Delete Preset',
    `Permanently delete "${preset.name}"? This cannot be undone.`
  );

  if (!confirmed) return;

  // Remove preset
  data.presets = data.presets.filter(p => p.id !== presetId);

  // Remove preset links
  data.presetPageLinks = data.presetPageLinks.filter(l => l.presetId !== presetId);

  await StorageService.setData(data);
  await loadPresets();
  showToast('Preset deleted successfully', 'success');
}

// Handle clone preset
async function handleClonePreset(presetId: string) {
  const data = await StorageService.getData();
  if (!data) return;

  const preset = data.presets.find(p => p.id === presetId);
  if (!preset) return;

  const newPreset = await StorageService.addPreset({
    name: `${preset.name} (Copy)`,
    description: preset.description || '',
    formData: JSON.parse(JSON.stringify(preset.formData))
  });

  await loadPresets();
  showToast('Preset cloned successfully', 'success');
}

// Mark as changed
function markAsChanged() {
  hasUnsavedChanges = true;
  const footer = document.getElementById('settingsFooter');
  if (footer) footer.style.display = 'block';
}

// Show/hide locator buttons
function showLocatorButtons() {
  const saveBtn = document.getElementById('saveLocatorsBtn');
  const cancelBtn = document.getElementById('cancelLocatorsBtn');
  if (saveBtn) saveBtn.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function hideLocatorButtons() {
  const saveBtn = document.getElementById('saveLocatorsBtn');
  const cancelBtn = document.getElementById('cancelLocatorsBtn');
  if (saveBtn) saveBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Show/hide page buttons
function showPageButtons() {
  const saveBtn = document.getElementById('savePagesBtn');
  const cancelBtn = document.getElementById('cancelPagesBtn');
  if (saveBtn) saveBtn.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function hidePageButtons() {
  const saveBtn = document.getElementById('savePagesBtn');
  const cancelBtn = document.getElementById('cancelPagesBtn');
  if (saveBtn) saveBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Show/hide regex patterns buttons
function showRegexPatternsButtons() {
  const saveBtn = document.getElementById('saveRegexPatternsBtn');
  const cancelBtn = document.getElementById('cancelRegexPatternsBtn');
  if (saveBtn) saveBtn.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function hideRegexPatternsButtons() {
  const saveBtn = document.getElementById('saveRegexPatternsBtn');
  const cancelBtn = document.getElementById('cancelRegexPatternsBtn');
  if (saveBtn) saveBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Show/hide length config buttons
function showLengthConfigButtons() {
  const saveBtn = document.getElementById('saveLengthConfigBtn');
  const cancelBtn = document.getElementById('cancelLengthConfigBtn');
  if (saveBtn) saveBtn.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function hideLengthConfigButtons() {
  const saveBtn = document.getElementById('saveLengthConfigBtn');
  const cancelBtn = document.getElementById('cancelLengthConfigBtn');
  if (saveBtn) saveBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Show/hide preset buttons
function showPresetButtons() {
  const saveBtn = document.getElementById('savePresetsBtn');
  const cancelBtn = document.getElementById('cancelPresetsBtn');
  if (saveBtn) saveBtn.style.display = 'inline-block';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function hidePresetButtons() {
  const saveBtn = document.getElementById('savePresetsBtn');
  const cancelBtn = document.getElementById('cancelPresetsBtn');
  if (saveBtn) saveBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Save locator changes
async function saveLocatorChanges() {
  const data = await StorageService.getData();
  if (!data) return;

  let locatorUpdates: Array<{ oldKey: string, newTestId: string, newSelector: string }> = [];

  // Collect locator changes
  const locatorsBody = document.getElementById('locatorsTableBody');
  if (locatorsBody) {
    const rows = locatorsBody.querySelectorAll('tr[data-locator-key]');

    rows.forEach(row => {
      const oldKey = (row as HTMLElement).dataset.locatorKey!;
      const [oldTestId, oldSelector] = oldKey.split('|');
      const newTestId = (row.querySelector('.locator-testid') as HTMLInputElement).value.trim();
      const newSelector = (row.querySelector('.locator-selector') as HTMLInputElement).value.trim();

      // If changed, add to update list
      if (oldTestId !== newTestId || oldSelector !== newSelector) {
        locatorUpdates.push({ oldKey, newTestId, newSelector });
      }
    });
  }

  // Apply locator updates to all presets and saved values
  if (locatorUpdates.length > 0) {
    locatorUpdates.forEach(update => {
      const [oldTestId, oldSelector] = update.oldKey.split('|');

      // Update in all presets
      data.presets.forEach(preset => {
        preset.formData.forEach(field => {
          if (field.testId === oldTestId && field.querySelector === oldSelector) {
            field.testId = update.newTestId;
            field.querySelector = update.newSelector;
            field.updatedAt = getCurrentTimestamp();
          }
        });
      });

      // Update in saved values
      data.savedValues.forEach(sv => {
        if (sv.testId === oldTestId && sv.querySelector === oldSelector) {
          sv.testId = update.newTestId;
          sv.querySelector = update.newSelector;
          sv.updatedAt = getCurrentTimestamp();
        }
      });
    });

    await StorageService.setData(data);
    showToast(`Updated ${locatorUpdates.length} locator(s)`, 'success');
    hideLocatorButtons();
  }
}

// Save regex patterns changes
async function saveRegexPatternsChanges() {
  // Persist in-memory changes if present, otherwise read from storage
  const data = originalData ?? await StorageService.getData();
  if (!data) return;

  let errors: string[] = [];

  // Collect regex pattern changes
  const regexPatternsBody = document.getElementById('regexPatternsTableBody');
  if (regexPatternsBody) {
    const rows = regexPatternsBody.querySelectorAll('.data-grid-row');

    rows.forEach((row, index) => {
      const name = (row.querySelector('.regex-pattern-name') as HTMLInputElement).value.trim();
      const regex = (row.querySelector('.regex-pattern-regex') as HTMLInputElement).value.trim();

      // Validate
      if (!name) {
        errors.push(`Pattern ${index + 1}: Name is required`);
      }
      if (!regex) {
        errors.push(`Pattern ${index + 1}: Regex is required`);
      }

      // Update data
      if (data.regexPatterns[index]) {
        data.regexPatterns[index].name = name;
        data.regexPatterns[index].regex = regex;
      }
    });
  }

  if (errors.length > 0) {
    showToast(`Validation errors:\n${errors.join('\n')}`, 'error');
    return;
  }

  await StorageService.setData(data);
  showToast('Regex patterns updated successfully', 'success');
  // Clear in-memory changes tracking after save
  originalData = null;
  hasUnsavedChanges = false;
  hideRegexPatternsButtons();
}

// Save length configurations changes
async function saveLengthConfigurationsChanges() {
  const data = await StorageService.getData();
  if (!data) return;

  let errors: string[] = [];

  // Collect length configuration changes
  const lengthConfigBody = document.getElementById('lengthConfigTableBody');
  if (lengthConfigBody) {
    const rows = lengthConfigBody.querySelectorAll('.data-grid-row');

    rows.forEach((row, index) => {
      const name = (row.querySelector('.length-config-name') as HTMLInputElement).value.trim();
      const description = (row.querySelector('.length-config-description') as HTMLInputElement).value.trim();
      const locator = (row.querySelector('.length-config-locator') as HTMLInputElement).value.trim();
      const maxLength = parseInt((row.querySelector('.length-config-max-length') as HTMLInputElement).value);

      // Validate
      if (!name) {
        errors.push(`Configuration ${index + 1}: Name is required`);
      }
      if (!locator) {
        errors.push(`Configuration ${index + 1}: Locator is required`);
      }
      if (isNaN(maxLength) || maxLength < 1) {
        errors.push(`Configuration ${index + 1}: Max length must be a positive number`);
      }

      // Update data
      if (data.lengthConfigurations[index]) {
        data.lengthConfigurations[index].name = name;
        data.lengthConfigurations[index].description = description;
        data.lengthConfigurations[index].locator = locator;
        data.lengthConfigurations[index].maxLength = maxLength;
      }
    });
  }

  if (errors.length > 0) {
    showToast(`Validation errors:\n${errors.join('\n')}`, 'error');
    return;
  }

  await StorageService.setData(data);
  showToast('Length configurations updated successfully', 'success');
  hideLengthConfigButtons();
}

// Handle delete regex pattern
async function handleDeleteRegexPattern(indexStr: string) {
  const index = parseInt(indexStr);
  const data = await StorageService.getData();
  if (!data || !data.regexPatterns[index]) return;

  const pattern = data.regexPatterns[index];
  const confirmed = await showConfirm(
    'Delete Regex Pattern',
    `Delete "${pattern.name}"? This cannot be undone.`
  );

  if (!confirmed) return;

  // Remove pattern
  data.regexPatterns.splice(index, 1);

  await StorageService.setData(data);
  await loadRegexPatterns();
  showToast('Regex pattern deleted successfully', 'success');
}

// Handle delete length configuration
async function handleDeleteLengthConfig(indexStr: string) {
  const index = parseInt(indexStr);
  const data = await StorageService.getData();
  if (!data || !data.lengthConfigurations[index]) return;

  const config = data.lengthConfigurations[index];
  const confirmed = await showConfirm(
    'Delete Length Configuration',
    `Delete "${config.name}"? This cannot be undone.`
  );

  if (!confirmed) return;

  // Remove configuration
  data.lengthConfigurations.splice(index, 1);

  await StorageService.setData(data);
  await loadLengthConfigurations();
  showToast('Length configuration deleted successfully', 'success');
}

// Save page changes
async function savePageChanges() {
  const data = await StorageService.getData();
  if (!data) return;

  let errors: string[] = [];
  const urlMap = new Map<string, string>();

  // Validate and save pages
  const pagesBody = document.getElementById('pagesTableBody');
  if (pagesBody) {
    const rows = pagesBody.querySelectorAll('.data-grid-row');

    // Build a map of original keys for all pages
    const originalKeyMap = new Map<string, string>();
    data.pages.forEach(page => {
      const key = `${page.url}|${page.matchIdentify}`;
      originalKeyMap.set(page.id, key);
    });

    rows.forEach(row => {
      const pageId = (row as HTMLElement).dataset.pageId!;
      const title = (row.querySelector('.page-title') as HTMLInputElement).value.trim();
      const url = (row.querySelector('.page-url') as HTMLInputElement).value.trim();
      const description = (row.querySelector('.page-description') as HTMLTextAreaElement).value.trim();
      const owner = (row.querySelector('.page-owner') as HTMLInputElement).value.trim();
      const matchIdentifyElement = row.querySelector('.page-match') as HTMLSelectElement;
      const matchIdentify = (matchIdentifyElement?.value || 'prefixMatch') as 'exactMatch' | 'prefixMatch';

      // Validate
      if (!title) {
        errors.push(`Page ${pageId}: Title is required`);
      }
      if (!url) {
        errors.push(`Page ${pageId}: URL is required`);
      }

      // Remove the old key for this page (if any) before checking for duplicates
      const oldKey = originalKeyMap.get(pageId);
      if (oldKey && urlMap.get(oldKey) === pageId) {
        urlMap.delete(oldKey);
      }

      // Check duplicates
      const key = `${url}|${matchIdentify}`;
      if (urlMap.has(key) && urlMap.get(key) !== pageId) {
        errors.push(`Duplicate page with URL "${url}" and same match type`);
      }
      urlMap.set(key, pageId);

      // Update page
      const page = data.pages.find(p => p.id === pageId);
      if (page) {
        page.pageTitle = title;
        page.url = url;
        page.description = description;
        page.owner = owner;
        page.matchIdentify = matchIdentify;
        page.updatedAt = getCurrentTimestamp();
      }
    });
  }

  if (errors.length > 0) {
    showToast(errors.join('\n'), 'error');
    return;
  }

  await StorageService.setData(data);
  await loadPages();
  showToast('Pages saved successfully', 'success');
  hidePageButtons();
}

// Save preset changes
async function savePresetChanges() {
  const data = await StorageService.getData();
  if (!data) return;

  let errors: string[] = [];
  const nameMap = new Set<string>();

  // Validate and save presets
  const presetsBody = document.getElementById('presetsTableBody');
  if (presetsBody) {
    const rows = presetsBody.querySelectorAll('.data-grid-row');

    rows.forEach(row => {
      const presetId = (row as HTMLElement).dataset.presetId!;
      const name = (row.querySelector('.preset-card-name') as HTMLInputElement).value.trim();
      const description = (row.querySelector('.preset-card-description') as HTMLTextAreaElement).value.trim();

      // Validate
      if (!name) {
        errors.push(`Preset ${presetId}: Name is required`);
      }

      // Check duplicates
      const preset = data.presets.find(p => p.id === presetId);
      if (preset) {
        const otherPresetWithSameName = data.presets.find(p => p.id !== presetId && p.name === name);
        if (otherPresetWithSameName) {
          errors.push(`Duplicate preset name: "${name}"`);
        }

        // Update preset
        preset.name = name;
        preset.description = description;
        preset.updatedAt = getCurrentTimestamp();
      }
    });
  }

  if (errors.length > 0) {
    showToast(errors.join('\n'), 'error');
    return;
  }

  await StorageService.setData(data);
  await loadPresets();
  showToast('Presets saved successfully', 'success');
  hidePresetButtons();
}

// Export pages to JSON file
async function exportPages() {
  const data = await StorageService.getData();
  if (!data || data.pages.length === 0) {
    showToast('No pages to export', 'info');
    return;
  }

  await showPageExportSelectionModal(data.pages);
}

// Show page export selection modal
async function showPageExportSelectionModal(allPages: PageData[]) {
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
    await performPageExport(selectedPages);
  });

  // Handle cancel button
  document.getElementById('cancelPageExportBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Perform the actual page export
async function performPageExport(selectedPages: PageData[]) {
  const exportFile = createExportFile({
    included: { pages: true },
    data: { pages: selectedPages }
  });

  downloadFile(JSON.stringify(exportFile, null, 2), `pages-export-${Date.now()}.json`);
  showToast(`${selectedPages.length} page${selectedPages.length === 1 ? '' : 's'} exported and downloaded`, 'success');
}

// Import pages from JSON file
async function importPages(file: File) {
  try {
    const text = await file.text();
    const imported = parseExtensionExportJson(text);

    if (!imported.included.pages || !Array.isArray(imported.data.pages)) {
      showToast('Invalid import file: pages section not included', 'error');
      return;
    }

    const data = await StorageService.getData();
    if (!data) return;

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
      const existingByUrl = data.pages.find(p =>
        p.url === page.url && p.matchIdentify === page.matchIdentify
      );

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
    await loadPages();
    
    let message = `Added ${addedCount} pages`;
    if (skippedIdCount > 0) message += `, skipped ${skippedIdCount} with existing IDs`;
    if (skippedDuplicateCount > 0) message += `, skipped ${skippedDuplicateCount} duplicates`;
    showToast(message, 'success');
  } catch (error) {
    console.error('Import pages error:', error);
    showToast('Failed to import pages. Please check the file format.', 'error');
  }
}

// Export presets to JSON file
async function exportPresets() {
  const data = await StorageService.getData();
  if (!data || data.presets.length === 0) {
    showToast('No presets to export', 'info');
    return;
  }

  await showPresetExportSelectionModal(data.presets);
}

// Show preset export selection modal
async function showPresetExportSelectionModal(allPresets: Preset[]) {
  const modalContent = `
    <div class="export-selection">
      <p>Select presets to export:</p>
      <div class="modal-selection-counter">Selected: ${allPresets.length} / ${allPresets.length}</div>
      
      <div class="preset-selection-list">
        <label class="export-option select-all-option">
          <input type="checkbox" id="selectAllPresets" checked>
          <span class="checkmark"></span>
          <strong>Select All Presets</strong>
        </label>
        
        <div class="preset-list">
          ${allPresets.map(preset => `
            <label class="export-option preset-option">
              <input type="checkbox" class="preset-checkbox" value="${preset.id}" checked>
              <span class="checkmark"></span>
              <div class="preset-card">
                <div class="preset-title">${escapeHtml(preset.name)}</div>
                <div class="preset-card-description">${preset.description ? escapeHtml(preset.description) : 'No description'}</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="modal-actions">
        <button id="cancelPresetExportBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="exportSelectedPresetsBtn" class="cyber-btn">
        Export Selected
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;

  showModal('Export Presets', modalContent);

  // Update counter function
  const updateCounter = () => {
    const checkedCount = document.querySelectorAll('.preset-checkbox:checked').length;
    const totalCount = allPresets.length;
    const counterEl = document.querySelector('.modal-selection-counter');
    if (counterEl) {
      counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
    }
  };

  // Handle select all checkbox
  document.getElementById('selectAllPresets')?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    const checkboxes = document.querySelectorAll('.preset-checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = checked);
    updateCounter();
  });

  // Handle individual checkbox changes to update select all state
  document.querySelectorAll('.preset-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const allCheckboxes = document.querySelectorAll('.preset-checkbox') as NodeListOf<HTMLInputElement>;
      const selectAllCheckbox = document.getElementById('selectAllPresets') as HTMLInputElement;
      const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
      const noneChecked = Array.from(allCheckboxes).every(cb => !cb.checked);
      
      selectAllCheckbox.checked = allChecked;
      selectAllCheckbox.indeterminate = !allChecked && !noneChecked;
      updateCounter();
    });
  });

  // Handle export selected button
  document.getElementById('exportSelectedPresetsBtn')?.addEventListener('click', async () => {
    const selectedIds = Array.from(document.querySelectorAll('.preset-checkbox:checked') as NodeListOf<HTMLInputElement>)
      .map(cb => cb.value);

    if (selectedIds.length === 0) {
      showToast('Please select at least one preset to export', 'warning');
      return;
    }

    const selectedPresets = allPresets.filter(preset => selectedIds.includes(preset.id));

    hideModal();
    await performPresetExport(selectedPresets);
  });

  // Handle cancel button
  document.getElementById('cancelPresetExportBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Perform the actual preset export
async function performPresetExport(selectedPresets: Preset[]) {
  const exportFile = createExportFile({
    included: { presets: true },
    data: { presets: selectedPresets }
  });

  downloadFile(JSON.stringify(exportFile, null, 2), `presets-export-${Date.now()}.json`);
  showToast(`${selectedPresets.length} preset${selectedPresets.length === 1 ? '' : 's'} exported and downloaded`, 'success');
}

// Import presets from JSON file
async function importPresets(file: File) {
  try {
    const text = await file.text();
    const imported = parseExtensionExportJson(text);

    if (!imported.included.presets || !Array.isArray(imported.data.presets)) {
      showToast('Invalid import file: presets section not included', 'error');
      return;
    }

    const data = await StorageService.getData();
    if (!data) return;

    let addedCount = 0;
    let skippedIdCount = 0;
    let skippedDuplicateCount = 0;

    for (const preset of imported.data.presets) {
      // Check if preset already exists with same ID
      const existingById = data.presets.find(p => p.id === preset.id);
      if (existingById) {
        skippedIdCount++;
        continue;
      }

      // Check if preset already exists with same name
      const existingByName = data.presets.find(p => p.name === preset.name);
      if (existingByName) {
        skippedDuplicateCount++;
        continue;
      }

      // Add new preset with new ID
      const newPreset = {
        ...preset,
        id: generateGuid(),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      };

      data.presets.push(newPreset);
      addedCount++;
    }

    await StorageService.setData(data);
    await loadPresets();
    
    let message = `Added ${addedCount} presets`;
    if (skippedIdCount > 0) message += `, skipped ${skippedIdCount} with existing IDs`;
    if (skippedDuplicateCount > 0) message += `, skipped ${skippedDuplicateCount} duplicates`;
    showToast(message, 'success');
  } catch (error) {
    console.error('Import presets error:', error);
    showToast('Failed to import presets. Please check the file format.', 'error');
  }
}

// Export regex patterns to JSON file
async function exportRegexPatterns() {
  const data = await StorageService.getData();
  if (!data || data.regexPatterns.length === 0) {
    showToast('No regex patterns to export', 'info');
    return;
  }

  const exportFile = createExportFile({
    included: { regexPatterns: true },
    data: { regexPatterns: data.regexPatterns }
  });

  downloadFile(JSON.stringify(exportFile, null, 2), `regex-patterns-export-${Date.now()}.json`);
  showToast('Regex patterns exported and downloaded', 'success');
}

// Import regex patterns from JSON file
async function importRegexPatterns(file: File) {
  try {
    const text = await file.text();
    const imported = parseExtensionExportJson(text);

    if (!imported.included.regexPatterns || !Array.isArray(imported.data.regexPatterns)) {
      showToast('Invalid import file: regex patterns section not included', 'error');
      return;
    }

    const data = await StorageService.getData();
    if (!data) return;

    let addedCount = 0;
    let skippedIdCount = 0;
    let skippedDuplicateCount = 0;

    for (const pattern of imported.data.regexPatterns) {
      // Check if pattern already exists with same name
      const existingByName = data.regexPatterns.find(p => p.name === pattern.name);
      if (existingByName) {
        skippedDuplicateCount++;
        continue;
      }

      // Add new pattern
      data.regexPatterns.push({ ...pattern });
      addedCount++;
    }

    await StorageService.setData(data);
    await loadRegexPatterns();
    
    let message = `Added ${addedCount} regex patterns`;
    if (skippedIdCount > 0) message += `, skipped ${skippedIdCount} with existing IDs`;
    if (skippedDuplicateCount > 0) message += `, skipped ${skippedDuplicateCount} duplicates`;
    showToast(message, 'success');
  } catch (error) {
    console.error('Import regex patterns error:', error);
    showToast('Failed to import regex patterns. Please check the file format.', 'error');
  }
}

// Export length configurations to JSON file
async function exportLengthConfigurations() {
  const data = await StorageService.getData();
  if (!data || data.lengthConfigurations.length === 0) {
    showToast('No length configurations to export', 'info');
    return;
  }

  const exportFile = createExportFile({
    included: { lengthConfigurations: true },
    data: { lengthConfigurations: data.lengthConfigurations }
  });

  downloadFile(JSON.stringify(exportFile, null, 2), `length-configurations-export-${Date.now()}.json`);
  showToast('Length configurations exported and downloaded', 'success');
}

// Import length configurations from JSON file
async function importLengthConfigurations(file: File) {
  try {
    const text = await file.text();
    const imported = parseExtensionExportJson(text);

    if (!imported.included.lengthConfigurations || !Array.isArray(imported.data.lengthConfigurations)) {
      showToast('Invalid import file: length configurations section not included', 'error');
      return;
    }

    const data = await StorageService.getData();
    if (!data) return;

    let addedCount = 0;
    let skippedDuplicateCount = 0;

    for (const config of imported.data.lengthConfigurations) {
      // Check if configuration already exists with same name
      const existingByName = data.lengthConfigurations.find(c => c.name === config.name);
      if (existingByName) {
        skippedDuplicateCount++;
        continue;
      }

      // Add new configuration
      data.lengthConfigurations.push({ ...config });
      addedCount++;
    }

    await StorageService.setData(data);
    await loadLengthConfigurations();
    
    let message = `Added ${addedCount} length configurations`;
    if (skippedDuplicateCount > 0) message += `, skipped ${skippedDuplicateCount} duplicates`;
    showToast(message, 'success');
  } catch (error) {
    console.error('Import length configurations error:', error);
    showToast('Failed to import length configurations. Please check the file format.', 'error');
  }
}

// Export all settings data
async function exportAllSettings() {
  const data = await StorageService.getData();
  if (!data) {
    showToast('Failed to load data', 'error');
    return;
  }

  const settings = await StorageService.getSettings();

  const exportFile = createExportFile({
    included: {
      settings: true,
      pages: true,
      presets: true,
      presetPageLinks: true,
      savedValues: true,
      regexPatterns: true,
      lengthConfigurations: true,
    },
    settings: settings,
    data: data,
  });

  downloadFile(JSON.stringify(exportFile, null, 2), `form-filler-backup-${Date.now()}.json`);

  showToast('All settings exported successfully', 'success');
}

// Import all settings data
async function importAllSettings(file: File) {
  try {
    const text = await file.text();
    const imported = parseExtensionExportJson(text);

    const includesAll = imported.included.settings
      && imported.included.pages
      && imported.included.presets
      && imported.included.presetPageLinks
      && imported.included.savedValues
      && imported.included.regexPatterns
      && imported.included.lengthConfigurations;

    if (!includesAll) {
      showToast('Invalid backup file: must include settings + all data sections', 'error');
      return;
    }

    // Confirm with user before overwriting
    const confirmed = confirm(
      'This will replace ALL current data including pages, presets, saved values, regex patterns, and length configurations. Continue?'
    );

    if (!confirmed) {
      return;
    }

    // Import settings + data
    await StorageService.setSettings(imported.settings);
    await StorageService.setData(imported.data);

    // Reload the page to reflect changes
    showToast('All settings imported successfully. Page will reload.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error('Import all settings error:', error);
    showToast('Failed to import settings. Please check the file format.', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {

  // Filling assistant config - apply immediately
  document.getElementById('enableLiveAssistant')?.addEventListener('change', async () => {
    const checked = (document.getElementById('enableLiveAssistant') as HTMLInputElement).checked;
    await updateSetting('enableLiveAssistant', checked, 'Filling Assistant Popup immediately showing is ' + (checked ? 'enabled' : 'disabled'));
    updateFillingAssistantNoteVisibility();
  });

  document.getElementById('enableSaveValue')?.addEventListener('change', async () => {
    const checked = (document.getElementById('enableSaveValue') as HTMLInputElement).checked;
    await updateSetting('enableSaveValue', checked, 'Save Value section in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
    updateFillingAssistantNoteVisibility();
  });

  document.getElementById('enableImportValue')?.addEventListener('change', async () => {
    const checked = (document.getElementById('enableImportValue') as HTMLInputElement).checked;
    await updateSetting('enableImportValue', checked, 'Import Value section in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
    updateFillingAssistantNoteVisibility();
  });

  document.getElementById('enableLocatorRetriever')?.addEventListener('change', async () => {
    const checked = (document.getElementById('enableLocatorRetriever') as HTMLInputElement).checked;
    await updateSetting('enableLocatorRetriever', checked, 'Locator retriever in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
    updateFillingAssistantNoteVisibility();
  });

  document.getElementById('enableRegexPattern')?.addEventListener('change', async () => {
    const checked = (document.getElementById('enableRegexPattern') as HTMLInputElement).checked;
    await updateSetting('enableRegexPattern', checked, 'Regex pattern import in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
    updateFillingAssistantNoteVisibility();
  });

  document.getElementById('enableRandomStringInAssistant')?.addEventListener('change', async () => {
    const checked = (document.getElementById('enableRandomStringInAssistant') as HTMLInputElement).checked;
    await updateSetting('enableRandomStringInAssistant', checked, 'Random string generator in Filling Assistant Popup is ' + (checked ? 'enabled' : 'disabled'));
    updateFillingAssistantNoteVisibility();
  });

  document.getElementById('enableRandomStringSectionInPopup')?.addEventListener('change', async () => {
    const checked = (document.getElementById('enableRandomStringSectionInPopup') as HTMLInputElement).checked;
    await updateSetting('enableRandomStringSectionInPopup', checked, 'Random string shortcut to extension popup is ' + (checked ? 'enabled' : 'disabled'));
  });

  document.getElementById('randomStringCharset')?.addEventListener('change', async () => {
    const value = (document.getElementById('randomStringCharset') as HTMLSelectElement).value as RandomStringCharset;
    await updateSetting('randomStringCharset', value, 'Default random string character set updated');
  });

  document.getElementById('randomStringLength')?.addEventListener('change', async () => {
    const value = parseInt((document.getElementById('randomStringLength') as HTMLInputElement).value) || DEFAULTS.RANDOM_STRING_LENGTH;
    await updateSetting('randomStringLength', value, 'Default random string length updated');
  });

  document.getElementById('defaultSaveTarget')?.addEventListener('change', async () => {
    const value = (document.getElementById('defaultSaveTarget') as HTMLSelectElement).value as SaveItemTarget;
    await updateSetting('defaultSaveItemTo', value, 'Default save target updated to has been updated');
  });

  // Prompts guide: initialize prompt text and wire copy/select behavior
  const promptsSelect = document.getElementById('promptsSelect') as HTMLSelectElement | null;
  const promptsTextarea = document.getElementById('promptsTextarea') as HTMLTextAreaElement | null;
  const promptsCopyBtn = document.getElementById('promptsCopyBtn') as HTMLButtonElement | null;
  const promptPageSrc = document.getElementById('prompt-page-src') as HTMLElement | null;
  const promptPresetSrc = document.getElementById('prompt-preset-src') as HTMLElement | null;

  if (promptsSelect && promptsTextarea && promptPageSrc && promptPresetSrc) {
    // Load initial prompt (page)
    const pagePrompt = promptPageSrc.textContent || '';
    const presetPrompt = promptPresetSrc.textContent || '';
    promptsTextarea.value = pagePrompt.trim();

    // Initialize custom select replacement to ensure option styling works across browsers
    try {
      initCustomPromptsSelect(promptsSelect, promptsTextarea, pagePrompt.trim(), presetPrompt.trim());
    } catch (err) {
      // Fallback: keep native select behavior
      promptsSelect.addEventListener('change', () => {
        if (promptsSelect.value === 'page') {
          promptsTextarea.value = pagePrompt.trim();
        } else {
          promptsTextarea.value = presetPrompt.trim();
        }
      });
    }

    promptsCopyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(promptsTextarea.value);
        showToast('Prompt copied to clipboard', 'success');
      } catch (error) {
        console.error('Copy failed', error);
        showToast('Failed to copy prompt', 'error');
      }
    });
  }

  // Locator save/cancel buttons
  document.getElementById('saveLocatorsBtn')?.addEventListener('click', async () => {
    await saveLocatorChanges();
  });

  document.getElementById('cancelLocatorsBtn')?.addEventListener('click', async () => {
    await loadLocators();
    hideLocatorButtons();
  });

  // Global keyboard shortcuts for modal actions: Enter -> #modalAddBtn, Esc -> #modalCancelBtn
  document.addEventListener('keydown', (e) => {
    // Only act when a modal overlay is visible
    const modalOverlay = document.getElementById('modalOverlay');
    if (!modalOverlay || modalOverlay.style.display === 'none') return;

    if (e.key === 'Escape') {
      const cancelBtn = document.getElementById('modalCancelBtn') as HTMLElement | null;
      if (cancelBtn) {
        e.preventDefault();
        cancelBtn.click();
      }
    } else if (e.key === 'Enter') {
      // Only trigger Enter when focus is inside an editable element (input, textarea, or contenteditable)
      const active = document.activeElement as HTMLElement | null;
      const isFocusedEditable = !!(active && (['input', 'textarea'].includes(active.tagName.toLowerCase()) || active.getAttribute('contenteditable') === 'true'));
      if (!isFocusedEditable) return;
      const addBtn = document.getElementById('modalAddBtn') as HTMLElement | null;
      if (addBtn) {
        e.preventDefault();
        addBtn.click();
      }
    }
  });

  // Pages save/cancel buttons
  document.getElementById('savePagesBtn')?.addEventListener('click', async () => {
    await savePageChanges();
  });

  document.getElementById('cancelPagesBtn')?.addEventListener('click', async () => {
    await loadPages();
    hidePageButtons();
  });

  // Presets save/cancel buttons
  document.getElementById('savePresetsBtn')?.addEventListener('click', async () => {
    await savePresetChanges();
  });

  document.getElementById('cancelPresetsBtn')?.addEventListener('click', async () => {
    await loadPresets();
    hidePresetButtons();
  });

  // Regex patterns save/cancel buttons
  document.getElementById('saveRegexPatternsBtn')?.addEventListener('click', async () => {
    await saveRegexPatternsChanges();
  });

  document.getElementById('cancelRegexPatternsBtn')?.addEventListener('click', async () => {
    // Discard in-memory changes and reload from storage
    originalData = null;
    hasUnsavedChanges = false;
    await loadRegexPatterns();
    hideRegexPatternsButtons();
  });

  // Length config save/cancel buttons
  document.getElementById('saveLengthConfigBtn')?.addEventListener('click', async () => {
    await saveLengthConfigurationsChanges();
  });

  document.getElementById('cancelLengthConfigBtn')?.addEventListener('click', async () => {
    await loadLengthConfigurations();
    hideLengthConfigButtons();
  });

  // Add regex pattern
  document.getElementById('addRegexPatternBtn')?.addEventListener('click', async () => {
    await showAddRegexPatternModal();
  });

  // Add length configuration
  document.getElementById('addLengthConfigBtn')?.addEventListener('click', async () => {
    await showAddLengthConfigModal();
  });

  // Add page
  document.getElementById('addPageBtn')?.addEventListener('click', async () => {
    await showAddPageModal();
  });

  // Add preset
  document.getElementById('addPresetBtn')?.addEventListener('click', async () => {
    await showAddPresetModal();
  });

  // Export/Import Pages
  document.getElementById('exportPagesBtn')?.addEventListener('click', async () => {
    await exportPages();
  });

  document.getElementById('importPagesBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('importPagesFile') as HTMLInputElement;
    fileInput.click();
  });

  document.getElementById('importPagesFile')?.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await importPages(input.files[0]);
      input.value = '';
    }
  });

  // Export/Import Presets
  document.getElementById('exportPresetsBtn')?.addEventListener('click', async () => {
    await exportPresets();
  });

  document.getElementById('importPresetsBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('importPresetsFile') as HTMLInputElement;
    fileInput.click();
  });

  document.getElementById('importPresetsFile')?.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await importPresets(input.files[0]);
      input.value = '';
    }
  });

  // Export/Import Regex Patterns
  document.getElementById('exportRegexPatternsBtn')?.addEventListener('click', async () => {
    await exportRegexPatterns();
  });

  document.getElementById('importRegexPatternsBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('importRegexPatternsFile') as HTMLInputElement;
    fileInput.click();
  });

  document.getElementById('importRegexPatternsFile')?.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await importRegexPatterns(input.files[0]);
      input.value = '';
    }
  });

  // Export/Import Length Configurations
  document.getElementById('exportLengthConfigBtn')?.addEventListener('click', async () => {
    await exportLengthConfigurations();
  });

  document.getElementById('importLengthConfigBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('importLengthConfigFile') as HTMLInputElement;
    fileInput.click();
  });

  document.getElementById('importLengthConfigFile')?.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await importLengthConfigurations(input.files[0]);
      input.value = '';
    }
  });

  // Export/Import All Settings
  document.getElementById('exportAllBtn')?.addEventListener('click', async () => {
    await exportAllSettings();
  });

  document.getElementById('importAllBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('importAllFile') as HTMLInputElement;
    fileInput.click();
  });

  document.getElementById('importAllFile')?.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await importAllSettings(input.files[0]);
      input.value = '';
    }
  });

  // Section Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = (e.target as HTMLElement).dataset.target;
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          // Account for sticky navigation height
          const navElement = document.querySelector('.section-nav') as HTMLElement;
          const navHeight = navElement?.offsetHeight || 0;
          const offsetTop = targetElement.offsetTop - navHeight - 20; // 20px extra padding

          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Update filling assistant note visibility
  updateFillingAssistantNoteVisibility();

  // Sortable header event listeners
  document.querySelectorAll('.sortable-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const element = e.target as HTMLElement;
      const column = element.dataset.sort!;
      const grid = element.closest('.data-grid') as HTMLElement;
      const tableId = grid.id.replace('Grid', '');
      handleHeaderClick(tableId, column);
    });
  });
}

// Sync navigation with scroll position
function updateActiveNavButton() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('[id$="Section"]');
  const navHeight = (document.querySelector('.section-nav') as HTMLElement)?.offsetHeight || 0;

  let currentSection = '';

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= navHeight + 100 && rect.bottom >= navHeight + 100) {
      currentSection = section.id;
    }
  });

  navButtons.forEach(btn => {
    const targetId = (btn as HTMLElement).dataset.target;
    if (targetId === currentSection) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
};

// Update active navigation on scroll
window.addEventListener('scroll', updateActiveNavButton);
// Update active navigation on page load
updateActiveNavButton();

// Save all changes
async function saveAllChanges() {
  const data = await StorageService.getData();
  if (!data) return;

  let errors: string[] = [];
  let locatorUpdates: Array<{ oldKey: string, newTestId: string, newSelector: string }> = [];

  // Validate and collect locator changes
  const locatorsBody = document.getElementById('locatorsTableBody');
  if (locatorsBody) {
    const rows = locatorsBody.querySelectorAll('tr[data-locator-key]');

    rows.forEach(row => {
      const oldKey = (row as HTMLElement).dataset.locatorKey!;
      const [oldTestId, oldSelector] = oldKey.split('|');
      const newTestId = (row.querySelector('.locator-testid') as HTMLInputElement).value.trim();
      const newSelector = (row.querySelector('.locator-selector') as HTMLInputElement).value.trim();

      // If changed, add to update list
      if (oldTestId !== newTestId || oldSelector !== newSelector) {
        locatorUpdates.push({ oldKey, newTestId, newSelector });
      }
    });
  }

  // Validate and save pages
  const pagesBody = document.getElementById('pagesTableBody');
  if (pagesBody) {
    const rows = pagesBody.querySelectorAll('tr[data-page-id]');
    const urlMap = new Map<string, string>();

    rows.forEach(row => {
      const pageId = (row as HTMLElement).dataset.pageId!;
      const title = (row.querySelector('.page-title') as HTMLInputElement).value.trim();
      const url = (row.querySelector('.page-url') as HTMLInputElement).value.trim();
      const description = (row.querySelector('.page-description') as HTMLTextAreaElement).value.trim();
      const owner = (row.querySelector('.page-owner') as HTMLInputElement).value.trim();
      const matchIdentify = (row.querySelector('.page-match') as HTMLSelectElement).value as 'exactMatch' | 'prefixMatch';

      // Validate
      if (!title) {
        errors.push(`Page ${pageId}: Title is required`);
      }
      if (!url) {
        errors.push(`Page ${pageId}: URL is required`);
      }

      // Check duplicates
      const key = `${url}|${matchIdentify}`;
      if (urlMap.has(key) && urlMap.get(key) !== pageId) {
        errors.push(`Duplicate page with URL "${url}" and same match type`);
      }
      urlMap.set(key, pageId);

      // Update page
      const page = data.pages.find(p => p.id === pageId);
      if (page) {
        page.pageTitle = title;
        page.url = url;
        page.description = description;
        page.owner = owner;
        page.matchIdentify = matchIdentify;
        page.updatedAt = getCurrentTimestamp();
      }
    });
  }

  // Validate and save presets
  const presetsBody = document.getElementById('presetsTableBody');
  if (presetsBody) {
    const rows = presetsBody.querySelectorAll('tr[data-preset-id]');
    const nameMap = new Set<string>();

    rows.forEach(row => {
      const presetId = (row as HTMLElement).dataset.presetId!;
      const name = (row.querySelector('.preset-card-name') as HTMLInputElement).value.trim();
      const description = (row.querySelector('.preset-card-description') as HTMLTextAreaElement).value.trim();

      // Validate
      if (!name) {
        errors.push(`Preset ${presetId}: Name is required`);
      }

      // Check duplicates
      const preset = data.presets.find(p => p.id === presetId);
      if (preset) {
        const otherPresetWithSameName = data.presets.find(p => p.id !== presetId && p.name === name);
        if (otherPresetWithSameName) {
          errors.push(`Duplicate preset name: "${name}"`);
        }

        // Update preset
        preset.name = name;
        preset.description = description;
        preset.updatedAt = getCurrentTimestamp();
      }
    });
  }

  if (errors.length > 0) {
    showToast(errors.join('\n'), 'error');
    return;
  }
  // Apply locator updates to all presets and saved values
  if (locatorUpdates.length > 0) {
    locatorUpdates.forEach(update => {
      const [oldTestId, oldSelector] = update.oldKey.split('|');

      // Update in all presets
      data.presets.forEach(preset => {
        preset.formData.forEach(field => {
          if (field.testId === oldTestId && field.querySelector === oldSelector) {
            field.testId = update.newTestId;
            field.querySelector = update.newSelector;
            field.updatedAt = getCurrentTimestamp();
          }
        });
      });

      // Update in saved values
      data.savedValues.forEach(sv => {
        if (sv.testId === oldTestId && sv.querySelector === oldSelector) {
          sv.testId = update.newTestId;
          sv.querySelector = update.newSelector;
          sv.updatedAt = getCurrentTimestamp();
        }
      });
    });
  }
  // Save data
  await StorageService.setData(data);

  // Save settings
  const enableLiveAssistant = (document.getElementById('enableLiveAssistant') as HTMLInputElement).checked;
  const enableSaveValue = (document.getElementById('enableSaveValue') as HTMLInputElement).checked;
  const enableImportValue = (document.getElementById('enableImportValue') as HTMLInputElement).checked;
  const enableLocatorRetriever = (document.getElementById('enableLocatorRetriever') as HTMLInputElement).checked;
  const enableRegexPattern = (document.getElementById('enableRegexPattern') as HTMLInputElement).checked;

  const currentSettings = await StorageService.getSettings();
  if (!currentSettings) return;

  await StorageService.setSettings({
    ...currentSettings,
    enableLiveAssistant,
    enableSaveValue,
    enableImportValue,
    enableLocatorRetriever,
    enableRegexPattern,
    defaultSaveItemTo: currentSettings.defaultSaveItemTo ?? 'savedValues',
    enableRandomStringSectionInPopup: currentSettings.enableRandomStringSectionInPopup ?? true,
    randomStringCharset: currentSettings.randomStringCharset ?? 'alphanumeric',
    randomStringLength: currentSettings.randomStringLength ?? DEFAULTS.RANDOM_STRING_LENGTH
  });

  hasUnsavedChanges = false;
  const footer = document.getElementById('settingsFooter');
  if (footer) footer.style.display = 'none';

  showToast('All changes saved successfully!', 'success');
}

// Show Add Page Modal
async function showAddPageModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (!modalOverlay || !modalTitle || !modalBody) return;

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
      await loadPages();
      cleanup();
      showToast('Page added successfully!', 'success');
    } catch (error) {
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
async function showAddPresetModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (!modalOverlay || !modalTitle || !modalBody) return;

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
      await loadPresets();
      cleanup();
      showToast('Preset added successfully! You can now edit it to add form fields.', 'success');
    } catch (error) {
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

// Show Add Regex Pattern Modal
async function showAddRegexPatternModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (!modalOverlay || !modalTitle || !modalBody) return;

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
      if (!data) return;

      data.regexPatterns.push({ 
        name, 
        regex, 
        order: data.regexPatterns.length + 1 
      });
      await StorageService.setData(data);
      await loadRegexPatterns();
      cleanup();
      showToast('Regex pattern added successfully!', 'success');
    } catch (error) {
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
async function showAddLengthConfigModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (!modalOverlay || !modalTitle || !modalBody) return;

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
      if (!data) return;

      data.lengthConfigurations.push({ name, description, locator, maxLength });
      await StorageService.setData(data);
      await loadLengthConfigurations();
      cleanup();
      showToast('Length configuration added successfully!', 'success');
    } catch (error) {
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

// Initialize
init();

/**
 * Create a custom-styled select to replace native promptsSelect for consistent styling.
 * Keeps the original select element in sync (but hidden) so form logic remains compatible.
 */
function initCustomPromptsSelect(nativeSelect: HTMLSelectElement, textarea: HTMLTextAreaElement, pagePrompt: string, presetPrompt: string) {
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
    if (opt.selected) item.setAttribute('aria-selected', 'true');
    optionsList.appendChild(item);
  });

  wrapper.appendChild(trigger);
  wrapper.appendChild(optionsList);

  // Insert wrapper after native select
  nativeSelect.parentNode?.insertBefore(wrapper, nativeSelect.nextSibling || null);
  // Hide native select visually but keep it in DOM for forms
  nativeSelect.classList.add('native-select-hidden');

  const updateTextarea = (value: string) => {
    if (value === 'page') textarea.value = pagePrompt;
    else textarea.value = presetPrompt;
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
    if (wrapper.classList.contains('open')) closeOptions(); else openOptions();
  });

  // Option click
  optionsList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const option = target.closest('.custom-select__option') as HTMLElement | null;
    if (!option) return;
    const val = option.getAttribute('data-value') || '';

    // Update native select
    nativeSelect.value = val;
    // Update selected visuals
    optionsList.querySelectorAll('.custom-select__option').forEach(el => el.removeAttribute('aria-selected'));
    option.setAttribute('aria-selected', 'true');

    // Update trigger label
    const label = wrapper.querySelector('.custom-select__label') as HTMLElement;
    if (label) label.textContent = option.textContent || '';

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
    if (e.key === 'Escape') closeOptions();
  });

  // Initialize textarea based on current value
  updateTextarea(nativeSelect.value);
}
// Regex Pattern Drag & Drop Handlers
function handleRegexPatternDragStart(e: DragEvent) {
  // Prevent drag if user is focused on an input element
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
    e.preventDefault();
    return;
  }

  draggedRegexPatternRow = e.currentTarget as HTMLElement;
  draggedRegexPatternRow.classList.add('dragging');
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedRegexPatternRow.innerHTML);
  }
  console.log('Drag started:', draggedRegexPatternRow.dataset.patternName);
}

function handleRegexPatternDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  
  const target = e.currentTarget as HTMLElement;
  
  // Remove drag-over class from all rows first
  document.querySelectorAll('#regexPatternsTableBody .data-grid-row').forEach(row => {
    row.classList.remove('drag-over');
  });
  
  // Add drag-over class to current target if it's not the dragged row
  if (draggedRegexPatternRow && target !== draggedRegexPatternRow) {
    target.classList.add('drag-over');
    console.log('Dragging over:', target.dataset.patternName);
  }
}

async function handleRegexPatternDrop(e: DragEvent) {
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  target.classList.remove('drag-over');
  
  if (!draggedRegexPatternRow || target === draggedRegexPatternRow) {
    console.log('Drop ignored - same row or no dragged row');
    return;
  }

  // Get pattern names from data attributes
  const draggedName = draggedRegexPatternRow.dataset.patternName;
  const targetName = target.dataset.patternName;
  
  console.log('Drop event - dragged:', draggedName, 'target:', targetName);
  
  if (!draggedName || !targetName) {
    console.warn('Missing pattern names for drag & drop');
    return;
  }
  
  // Perform reorder in-memory (originalData). Create in-memory copy if needed.
  try {
    if (!originalData) {
      const stored = await StorageService.getData();
      if (!stored) {
        console.error('No data found for reorder');
        return;
      }
      originalData = JSON.parse(JSON.stringify(stored));
    }

    const draggedIndex = originalData!.regexPatterns.findIndex((p: any) => p.name === draggedName);
    const targetIndex = originalData!.regexPatterns.findIndex((p: any) => p.name === targetName);

    console.log('Reordering - draggedIndex:', draggedIndex, 'targetIndex:', targetIndex);

    if (draggedIndex === -1 || targetIndex === -1) {
      console.warn('Could not find patterns to reorder:', { draggedIndex, targetIndex });
      return;
    }

    // Reorder array in memory
    const [removed] = originalData!.regexPatterns.splice(draggedIndex, 1);
    originalData!.regexPatterns.splice(targetIndex, 0, removed);

    // Update order values
    originalData!.regexPatterns.forEach((pattern: any, index: number) => {
      pattern.order = index + 1;
    });

    console.log('New order (in-memory):', originalData!.regexPatterns.map((p: any) => ({ name: p.name, order: p.order })));

    // Mark as unsaved and reload UI from in-memory data
    hasUnsavedChanges = true;
    await loadRegexPatterns();
    showRegexPatternsButtons();
    console.log('Reorder complete (in-memory)');
  } catch (error) {
    console.error('Failed to reorder regex patterns:', error);
    showToast('Failed to reorder patterns. Please try again.', 'error');
  }
}

function handleRegexPatternDragEnd(e: DragEvent) {
  const target = e.currentTarget as HTMLElement;
  target.classList.remove('dragging');
  document.querySelectorAll('#regexPatternsTableBody .drag-over').forEach(el => el.classList.remove('drag-over'));
  console.log('Drag ended');
  draggedRegexPatternRow = null;
}

function handleRegexPatternDragLeave(e: DragEvent) {
  const target = e.currentTarget as HTMLElement;
  target.classList.remove('drag-over');
}