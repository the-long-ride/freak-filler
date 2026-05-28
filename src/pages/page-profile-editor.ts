import { StorageService } from '../services/storage.service';
import { Preset, FormFieldData, PageData, SavedValue } from '../types';
import { buildQuantityString, generateGuid, getCurrentTimestamp } from '../utils/helpers';
import { downloadFile, escapeHtml, initTheme, initVersion } from '../utils/common';
import { createExportFile, parseExtensionExportJson } from '../utils/export-format';
import { initCyberButtons } from '../utils/cyber-btn-init';
import { initIconReplacement } from '../utils/icon-replacer';
import { showConfirm, showToast, showModal, hideModal } from '../utils/modal-utils';
import { initGuideOverlays } from '../utils/guide-overlay';

let currentPageId: string = '';
let currentPageData: PageData | null = null;
let currentPresetId: string | null = null;
let currentPreset: Preset | null = null;
let formDataList: FormFieldData[] = [];
let originalFormDataList: FormFieldData[] = [];
let savedValuesList: SavedValue[] = [];
let originalSavedValuesList: SavedValue[] = [];
let draggedRow: HTMLTableRowElement | null = null;
let hasUnsavedPresetChanges: boolean = false;
let hasUnsavedSavedValuesChanges: boolean = false;
let isPresetOnlyMode: boolean = false;

// Initialize
async function init() {
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

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  currentPageId = urlParams.get('pageId') || '';
  currentPresetId = urlParams.get('presetId') || null;

  isPresetOnlyMode = !currentPageId;

  if (!isPresetOnlyMode) {
    // Load page data
    currentPageData = await StorageService.getPageById(currentPageId);
    if (!currentPageData) {
      showToast('Page not found', 'error');
      return;
    }

    // Populate page information in sidebar
    (document.getElementById('pageId') as HTMLElement).textContent = currentPageData.id;
    (document.getElementById('pageTitle') as HTMLInputElement).value = currentPageData.pageTitle;
    (document.getElementById('pageUrl') as HTMLInputElement).value = currentPageData.url;
    (document.getElementById('pageDescription') as HTMLTextAreaElement).value = currentPageData.description || '';
    const pageMatchIdentifyEl = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
    if (pageMatchIdentifyEl) pageMatchIdentifyEl.value = currentPageData.matchIdentify;

    // Load presets for this page
    await loadPagePresets();

    // Load saved values for this page
    await loadSavedValues();

    // Setup change tracking for page profile
    setupPageProfileChangeTracking();
  } else {
    setupPresetOnlyModeUI();
    await loadPagePresets();
  }

  // Load preset if editing
  if (currentPresetId) {
    await loadPreset();
  } else {
    // Set selector to "Create New"
    (document.getElementById('presetSelector') as HTMLSelectElement).value = '';
  }

  // Setup event listeners
  setupEventListeners();
}



function setupPresetOnlyModeUI() {
  // Sidebar shows empty page info and is read-only
  document.querySelectorAll('[data-group="pageInfo"]').forEach(el => el.remove());
  document.querySelectorAll('[data-group="isPresetOnlyMode"]').forEach(el => el.classList.remove('invisible'));
  // Ensure preset tab is active
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const presetTabBtn = document.querySelector('.tab-btn[data-tab="preset-tab"]') as HTMLElement | null;
  if (presetTabBtn) presetTabBtn.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  const presetTabContent = document.getElementById('preset-tab') as HTMLElement | null;
  if (presetTabContent) presetTabContent.classList.add('active');
}

// Load presets for current page
async function loadPagePresets() {
  const presetSelector = document.getElementById('presetSelector') as HTMLSelectElement;
  if (!presetSelector) return;

  const presets = currentPageData
    ? await StorageService.getPresetsForPage(currentPageData.id)
    : (await StorageService.getData())?.presets ?? [];
  
  // Clear existing options except "Create New"
  presetSelector.innerHTML = '<option value="">Create New Preset</option>';
  
  // Add presets as options
  presets.forEach(preset => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name;
    presetSelector.appendChild(option);
  });
  
  // Set current selection
  if (currentPresetId) {
    presetSelector.value = currentPresetId;
  }

  // Update link presets button visibility
  await updateLinkPresetsButtonVisibility();
}

// Update visibility of link presets button based on available unlinked presets
async function updateLinkPresetsButtonVisibility() {
  const linkPresetsBtn = document.getElementById('linkPresetsBtn');
  if (!linkPresetsBtn || !currentPageData) return;

  const unlinkedPresets = await StorageService.getUnlinkedPresets(currentPageData.id);
  linkPresetsBtn.style.display = unlinkedPresets.length > 0 ? 'block' : 'none';
}

// Load preset for editing
async function loadPreset() {
  if (!currentPresetId) return;

  currentPreset = await StorageService.getPresetById(currentPresetId);
  if (!currentPreset) return;

  // Update preset selector
  (document.getElementById('presetSelector') as HTMLSelectElement).value = currentPresetId;
  
  // Show preset ID below selector
  const presetIdDisplay = document.getElementById('presetIdDisplay');
  const presetIdValue = document.getElementById('presetIdValue');
  if (presetIdDisplay && presetIdValue) {
    presetIdValue.textContent = currentPreset.id;
    presetIdDisplay.style.display = 'block';
  }
  
  // Update name and description in tab
  (document.getElementById('presetName') as HTMLInputElement).value = currentPreset.name;
  (document.getElementById('presetDescription') as HTMLInputElement).value = currentPreset.description || '';

  // Load form data
  formDataList = [...currentPreset.formData].sort((a, b) => a.order - b.order);
  originalFormDataList = JSON.parse(JSON.stringify(formDataList)); // Deep copy
  hasUnsavedPresetChanges = false;
  updatePresetButtons();
  renderFormDataTable();
}

function showLinkPresetsToPageModal() {
  if (!currentPageData) {
    showToast('No current page data available', 'error');
    return;
  }

  StorageService.getUnlinkedPresets(currentPageData.id).then((unlinkedPresets) => {
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

    showModal('Link presets to current page', body, () => {});

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
      if (actionHandled) return;
      actionHandled = true;
      hideModal();
    });
    document.getElementById('linkPresetsConfirmBtn')?.addEventListener('click', async () => {
      if (actionHandled) return;
      actionHandled = true;

      const selectedPresetIds: string[] = [];
      document.querySelectorAll('.link-preset-checkbox:checked').forEach(cb => selectedPresetIds.push((cb as HTMLInputElement).value));

      if (selectedPresetIds.length === 0) {
        showToast('Please choose at least one preset to link', 'warning');
        return;
      }

      for (const presetId of selectedPresetIds) {
        await StorageService.linkPresetToPage(presetId, currentPageData!.id);
      }

      hideModal();
      showToast(`Linked ${selectedPresetIds.length} preset(s) to current page`, 'success');
      // Update button visibility and reload presets
      await updateLinkPresetsButtonVisibility();
      await loadPagePresets();
    });
  }).catch((error) => {
    console.error('Failed to load unlinked presets:', error);
    showToast('Failed to load presets. Please try again.', 'error');
  });
}

function showLinkPresetToPagesModal() {
  if (!currentPresetId) {
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

    showModal('Link to exist page(s)', body, () => {});

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
        await StorageService.linkPresetToPage(currentPresetId!, pageId);
      }

      const selectedPages = pages.filter(p => selectedPageIds.includes(p.id));
      let targetPageId = selectedPageIds[0];
      if (selectedPages.length > 1) {
        targetPageId = selectedPages
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].id;
      }

      hideModal();
      window.location.href = `page-profile-editor.html?pageId=${encodeURIComponent(targetPageId)}&presetId=${encodeURIComponent(currentPresetId!)}`;
    });
  }).catch((error) => {
    console.error('Failed to load pages:', error);
    showToast('Failed to load pages. Please try again.', 'error');
  });
}

// Load saved values for current page
async function loadSavedValues() {
  if (!currentPageData) return;
  
  savedValuesList = await StorageService.getSavedValuesForPage(currentPageData.id);
  originalSavedValuesList = JSON.parse(JSON.stringify(savedValuesList)); // Deep copy
  hasUnsavedSavedValuesChanges = false;
  renderSavedValuesTable();
  updateSavedValuesCount();
  updateSavedValuesButtons();
}

// Setup change tracking for page profile
function setupPageProfileChangeTracking() {
  const pageInputs = ['pageTitle', 'pageUrl', 'pageDescription', 'pageMatchIdentify'];
  pageInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', () => {
        updatePageProfileButtons();
      });
      element.addEventListener('change', () => {
        updatePageProfileButtons();
      });
    }
  });
  // Ensure buttons reflect current state (hidden if no changes)
  updatePageProfileButtons();
}

// Update page profile save/cancel button visibility
function updatePageProfileButtons() {
  const hasChanges = checkPageProfileChanges();
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  
  if (saveBtn) saveBtn.style.display = hasChanges ? 'block' : 'none';
  if (cancelBtn) cancelBtn.style.display = hasChanges ? 'block' : 'none';
}

// Check if page profile has changes
function checkPageProfileChanges(): boolean {
  if (!currentPageData) return false;
  
  const title = (document.getElementById('pageTitle') as HTMLInputElement).value;
  const url = (document.getElementById('pageUrl') as HTMLInputElement).value;
  const description = (document.getElementById('pageDescription') as HTMLTextAreaElement).value;
  const matchIdentifyEl = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
  const matchIdentify = (matchIdentifyEl?.value ?? 'prefixMatch') as 'exactMatch' | 'prefixMatch';
  
  return title !== currentPageData.pageTitle ||
         url !== currentPageData.url ||
         description !== (currentPageData.description || '') ||
         matchIdentify !== currentPageData.matchIdentify;
}

// Save page profile data
async function savePageProfile() {
  if (!currentPageData) return;
  
  const title = (document.getElementById('pageTitle') as HTMLInputElement).value.trim();
  const url = (document.getElementById('pageUrl') as HTMLInputElement).value.trim();
  const description = (document.getElementById('pageDescription') as HTMLTextAreaElement).value.trim();
  const matchIdentifyEl2 = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
  const matchIdentify2 = (matchIdentifyEl2?.value ?? 'prefixMatch') as 'exactMatch' | 'prefixMatch';
  
  if (!title || !url) {
    showToast('Title and URL are required', 'warning');
    return;
  }
  
  currentPageData.pageTitle = title;
  currentPageData.url = url;
  currentPageData.description = description;
  currentPageData.matchIdentify = matchIdentify2;
  currentPageData.updatedAt = getCurrentTimestamp();
  
  await StorageService.updatePage(currentPageData.id, currentPageData);
  updatePageProfileButtons();
  showToast('Page profile saved successfully', 'success');
}

// Reset page profile data
function resetPageProfile() {
  if (!currentPageData) return;
  
  (document.getElementById('pageTitle') as HTMLInputElement).value = currentPageData.pageTitle;
  (document.getElementById('pageUrl') as HTMLInputElement).value = currentPageData.url;
  (document.getElementById('pageDescription') as HTMLTextAreaElement).value = currentPageData.description || '';
  const pageMatchIdentifyEl2 = document.getElementById('pageMatchIdentify') as HTMLSelectElement | null;
  if (pageMatchIdentifyEl2) pageMatchIdentifyEl2.value = currentPageData.matchIdentify;
  
  updatePageProfileButtons();
}

// Save preset data
async function savePresetData() {
  if (!currentPreset) return;
  
  const name = (document.getElementById('presetName') as HTMLInputElement).value.trim();
  const description = (document.getElementById('presetDescription') as HTMLInputElement).value.trim();
  
  if (!name) {
    showToast('Preset name is required', 'warning');
    return;
  }
  
  currentPreset.name = name;
  currentPreset.description = description;
  currentPreset.formData = [...formDataList];
  currentPreset.updatedAt = getCurrentTimestamp();
  
  await StorageService.updatePreset(currentPreset.id, currentPreset);
  originalFormDataList = JSON.parse(JSON.stringify(formDataList));
  hasUnsavedPresetChanges = false;
  updatePresetButtons();
  showToast('Preset saved successfully', 'success');
}

// Reset preset data
function resetPresetData() {
  formDataList = JSON.parse(JSON.stringify(originalFormDataList));
  hasUnsavedPresetChanges = false;
  updatePresetButtons();
  renderFormDataTable();
}

// Delete current preset
async function deleteCurrentPreset() {
  if (!currentPreset) return;
  
  if (!await showConfirm('Delete Preset', `Delete preset "${currentPreset.name}"? This cannot be undone.`)) {
    return;
  }
  
  await StorageService.deletePreset(currentPreset.id);
  
  // Reset to create new preset mode
  currentPresetId = null;
  currentPreset = null;
  formDataList = [];
  originalFormDataList = [];
  hasUnsavedPresetChanges = false;
  
  (document.getElementById('presetSelector') as HTMLSelectElement).value = '';
  (document.getElementById('presetName') as HTMLInputElement).value = '';
  (document.getElementById('presetDescription') as HTMLInputElement).value = '';
  
  updatePresetButtons();
  renderFormDataTable();
  showToast('Preset deleted successfully', 'success');
}

// Save saved values data
async function saveSavedValuesData() {
  if (!currentPageData) return;
  
  // Update all saved values for this page
  const data = await StorageService.getData();
  if (!data) return;

  // Remove old saved values for this page
  data.savedValues = data.savedValues.filter(sv => sv.pageId !== currentPageId);

  // Add updated saved values
  data.savedValues.push(...savedValuesList);

  await StorageService.setData(data);
  originalSavedValuesList = JSON.parse(JSON.stringify(savedValuesList));
  hasUnsavedSavedValuesChanges = false;
  updateSavedValuesButtons();
  showToast('Saved values saved successfully', 'success');
}

// Reset saved values data
function resetSavedValuesData() {
  savedValuesList = JSON.parse(JSON.stringify(originalSavedValuesList));
  hasUnsavedSavedValuesChanges = false;
  renderSavedValuesTable();
  updateSavedValuesButtons();
}

// Update preset buttons visibility
function updatePresetButtons() {
  const hasChanges = hasUnsavedPresetChanges || checkPresetInfoChanges();
  const saveBtn = document.getElementById('savePresetBtn');
  const rollbackBtn = document.getElementById('rollbackPresetBtn');
  const deleteBtn = document.getElementById('deletePresetBtn');
  
  if (saveBtn) saveBtn.style.display = hasChanges ? 'inline-block' : 'none';
  if (rollbackBtn) rollbackBtn.style.display = hasChanges ? 'inline-block' : 'none';
  if (deleteBtn) deleteBtn.style.display = currentPreset ? 'inline-block' : 'none';
}

// Check if preset info (name/description) has changes
function checkPresetInfoChanges(): boolean {
  if (!currentPreset) return false;
  
  const name = (document.getElementById('presetName') as HTMLInputElement).value;
  const description = (document.getElementById('presetDescription') as HTMLInputElement).value;
  
  return name !== currentPreset.name || description !== (currentPreset.description || '');
}

// Update saved values buttons visibility
function updateSavedValuesButtons() {
  const hasChanges = hasUnsavedSavedValuesChanges || JSON.stringify(savedValuesList) !== JSON.stringify(originalSavedValuesList);
  const saveBtn = document.getElementById('saveSavedValuesBtn');
  const rollbackBtn = document.getElementById('rollbackSavedValuesBtn');
  
  if (saveBtn) saveBtn.style.display = hasChanges ? 'inline-block' : 'none';
  if (rollbackBtn) rollbackBtn.style.display = hasChanges ? 'inline-block' : 'none';
}

// Setup event listeners
function setupEventListeners() {
  // Preset selector change
  document.getElementById('presetSelector')?.addEventListener('change', async (e) => {
    const select = e.target as HTMLSelectElement;
    const newPresetId = select.value;
    
    if (newPresetId === currentPresetId) return;
    
    // Warn if there are unsaved preset changes (saved-values edits shouldn't block switching presets)
    if (hasUnsavedPresetChanges) {
      if (!await showConfirm('Unsaved Changes', 'You have unsaved preset changes. Do you want to discard them and switch preset?')) {
        select.value = currentPresetId || '';
        return;
      }
    }
    
    if (currentPageData) {
      if (newPresetId) {
        // Switch to existing preset
        window.location.href = `page-profile-editor.html?pageId=${currentPageId}&presetId=${newPresetId}`;
      } else {
        // Create new preset
        window.location.href = `page-profile-editor.html?pageId=${currentPageId}`;
      }
      return;
    }

    // Preset-only mode navigation
    if (newPresetId) {
      window.location.href = `page-profile-editor.html?presetId=${newPresetId}`;
    } else {
      window.location.href = 'page-profile-editor.html';
    }
  });

  // Preset name/description change tracking
  document.getElementById('presetName')?.addEventListener('input', () => {
    updatePresetButtons();
  });
  
  document.getElementById('presetDescription')?.addEventListener('input', () => {
    updatePresetButtons();
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = (e.target as HTMLElement).closest('.tab-btn')?.getAttribute('data-tab');
      if (targetTab) switchTab(targetTab);
    });
  });

  if (currentPageData) {
    // Add saved value button
    document.getElementById('addSavedValueBtn')?.addEventListener('click', () => {
      addSavedValueRow();
      // Scroll saved values container to bottom after row rendered
      setTimeout(() => {
        const tbody = document.getElementById('savedValuesBody');
        if (!tbody) return;
        // Find nearest table container
        const container = tbody.closest('.table-container') as HTMLElement | null;
        if (container) {
          container.scrollTop = container.scrollHeight;
        } else {
          // fallback: scroll the table itself
          const table = document.getElementById('savedValuesTable');
          if (table) table.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 50);
    });

    // Export/import saved values
    document.getElementById('exportSavedValuesBtn')?.addEventListener('click', async () => {
      await exportSavedValues();
    });

    // Sidebar Link Presets button (link presets to current page)
    document.getElementById('linkPresetsBtn')?.addEventListener('click', () => {
      showLinkPresetsToPageModal();
    });

    document.getElementById('importSavedValuesBtn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('importSavedValuesFile') as HTMLInputElement;
      fileInput.click();
    });

    document.getElementById('importSavedValuesFile')?.addEventListener('change', async (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        await importSavedValues(input.files[0]);
        input.value = '';
      }
    });
  }

  document.getElementById('backBtn')?.addEventListener('click', () => {
    window.close();
  });

  document.getElementById('addFormDataBtn')?.addEventListener('click', () => {
    addFormDataRow();
  });

  // Preset tab buttons
  document.getElementById('savePresetBtn')?.addEventListener('click', async () => {
    await savePresetData();
  });

  document.getElementById('rollbackPresetBtn')?.addEventListener('click', async () => {
    if (await showConfirm('Rollback Changes', 'Are you sure? Unsaved changes will be lost.')) {
      resetPresetData();
    }
  });

  document.getElementById('deletePresetBtn')?.addEventListener('click', async () => {
    await deleteCurrentPreset();
    // Reload current page to reset state
    if (currentPageData){
      window.location.href = `page-profile-editor.html?pageId=${currentPageData.id}`;
    }
    else {
      window.location.href = `./html/settings.html`;
    }
  });

  // Saved values tab buttons
  if (currentPageData) {
    document.getElementById('saveSavedValuesBtn')?.addEventListener('click', async () => {
      await saveSavedValuesData();
    });

    document.getElementById('rollbackSavedValuesBtn')?.addEventListener('click', async () => {
      if (await showConfirm('Rollback Changes', 'Are you sure? Unsaved changes will be lost.')) {
        resetSavedValuesData();
        // Ensure buttons hide after rollback
        updateSavedValuesButtons();
      }
    });

    document.getElementById('saveBtn')?.addEventListener('click', async () => {
      await savePageProfile();
    });

    document.getElementById('cancelBtn')?.addEventListener('click', async () => {
      if (await showConfirm('Cancel Changes', 'Are you sure? Unsaved changes will be lost.')) {
        resetPageProfile();
      }
    });

    document.getElementById('exportBtn')?.addEventListener('click', async () => {
      await exportPageData();
    });
  }
  
  // New preset import/export buttons
  document.getElementById('exportPresetJsonBtn')?.addEventListener('click', async () => {
    await showPresetExportSelectionModal();
  });
  
  document.getElementById('importPresetJsonBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('importPresetFile') as HTMLInputElement;
    fileInput.click();
  });
  
  document.getElementById('importPresetFile')?.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await importPresetFromJson(input.files[0]);
      input.value = ''; // Reset file input
    }
  });

  document.getElementById('linkPresetToPagesBtn')?.addEventListener('click', () => {
    showLinkPresetToPagesModal();
  });

  // Settings button (open settings page in new tab)
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    try {
      chrome.tabs.create({ url: chrome.runtime.getURL('./html/settings.html') });
    } catch (e) {
      // Fallback for contexts where chrome.tabs might not be available
      window.open('./html/settings.html', '_blank');
    }
  });
}

// Add new form data row
function addFormDataRow(data?: FormFieldData) {
  const newData: FormFieldData = data || {
    id: generateGuid(),
    type: 'text',
    title: '',
    value: '',
    testId: '',
    querySelector: '',
    fillDelay: 0,
    autoBlur: true,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
    order: formDataList.length + 1
  };

  formDataList.push(newData);
  renderFormDataTable();
  if (!data){
    hasUnsavedPresetChanges = true;
    updateButtonVisibility();
  }
  
  // Scroll to bottom and highlight new row
  setTimeout(() => {
    const tbody = document.getElementById('formDataBody');
    const newRow = tbody?.querySelector(`tr[data-id="${newData.id}"]`) as HTMLElement;
    if (newRow) {
      newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      newRow.classList.add('highlight-new');
      setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
    }
  }, 100);
}

// Render form data table
function renderFormDataTable() {
  const tbody = document.getElementById('formDataBody') as HTMLTableSectionElement;
  tbody.innerHTML = '';

  formDataList.forEach((data, index) => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', data.id);
    row.setAttribute('draggable', 'true');
    
    // Generate value cell based on type
    let valueCell = '';
    if (data.type === 'checkbox') {
      const checked = data.value === true || data.value === 'true' ? 'checked' : '';
      valueCell = `<label class="toggle-switch"><input type="checkbox" class="value-checkbox" ${checked} data-id="${data.id}" /><span class="toggle-slider"></span></label>`;
    } else if (data.type === 'radio') {
      valueCell = `<input type="text" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" placeholder="Radio value" />`;
    } else if (data.type === 'range' || data.type === 'number') {
      valueCell = `<input type="number" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
    } else if (data.type === 'color') {
      const colorValue = data.value || '#000000';
      valueCell = `
        <div class="color-input-group">
          <input type="color" class="value-color-picker" value="${escapeHtml(String(colorValue))}" data-id="${data.id}" />
          <input type="text" class="value-color-text" value="${escapeHtml(String(colorValue))}" data-id="${data.id}" placeholder="#000000" />
        </div>`;
    } else if (data.type === 'datepicker') {
      valueCell = `<input type="date" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
    } else if (data.type === 'htmlEditor') {
      valueCell = `<textarea class="value-input html-editor-value" rows="3" data-id="${data.id}" placeholder="HTML content">${escapeHtml(String(data.value || ''))}</textarea>`;
    } else if (data.type === 'dynamicDate') {
      // Parse existing value or use defaults
      let years = 0, months = 0, days = 0;
      try {
        if (data.value) {
          const parsed = JSON.parse(String(data.value));
          years = parsed.years || 0;
          months = parsed.months || 0;
          days = parsed.days || 0;
        }
      } catch (e) {
        // Use defaults if parsing fails
      }
      valueCell = `
        <div class="dynamic-date-group">
          <span class="dynamic-date-label">Current date + </span>
          <input type="number" class="value-dynamic-years" value="${years}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">years</span>
          <input type="number" class="value-dynamic-months" value="${months}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">months</span>
          <input type="number" class="value-dynamic-days" value="${days}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">days</span>
        </div>`;
    } else if (data.type === 'clickable') {
      valueCell = `
        <div class="clickable-input-group">
          <span class="clickable-label">wait for</span>
          <input type="number" class="value-clickable-delay" value="${escapeHtml(String(data.value || '0'))}" min="1" max="30000" step="100" data-id="${data.id}" placeholder="0" />
          <span class="clickable-label">(ms) before clicking</span>
        </div>`;
    } else {
      valueCell = `<input type="text" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
    }
    
    row.innerHTML = `
      <td class="order-cell">
        <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
        <span class="order-number">${data.order}</span>
        <div class="order-actions">
          <button class="btn-order-action" data-action="insert" data-id="${data.id}" title="Insert row below">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="btn-order-action" data-action="clone" data-id="${data.id}" title="Clone row below">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="btn-order-action" data-action="move" data-id="${data.id}" title="Move to position">
            <svg 
              width="14" height="14"
              shape-rendering="geometricPrecision" 
              text-rendering="geometricPrecision" 
              image-rendering="optimizeQuality" 
              fill-rule="evenodd" 
              clip-rule="evenodd" 
              viewBox="0 0 320 512.29"
              fill="currentColor"
            >
                <path 
                    fill-rule="nonzero" 
                    d="M51.49 169.41h218.18L163.39 40.96 51.49 169.41zM16.1 310.66h287.79c8.9 0 16.11 7.21 16.11 16.11 0 4.18-1.59 7.98-4.2 10.85L176.1 506.46c-5.66 6.85-15.82 7.8-22.66 2.14l-1.88-1.83L3.96 337.34c-5.84-6.7-5.14-16.88 1.57-22.71a16.09 16.09 0 0 1 10.57-3.97zm253.57 32.22H51.49l111.9 128.45 106.28-128.45zm34.22-141.25H16.1c-3.75 0-7.52-1.31-10.57-3.96-6.71-5.84-7.41-16.01-1.57-22.72L151.55 5.52l1.89-1.83c6.84-5.66 17-4.7 22.66 2.14l139.7 168.84c2.61 2.87 4.2 6.68 4.2 10.85 0 8.9-7.21 16.11-16.11 16.11z"
                />
            </svg>
          </button>
          <button class="btn-order-action btn-share-action" data-id="${data.id}" title="Share row to other presets" data-icons="Share"></button>
        </div>
      </td>
      <td><input type="text" class="title-input" value="${escapeHtml(data.title || '')}" data-id="${data.id}" placeholder="Field title" /></td>
      <td>
        <select class="type-select" data-id="${data.id}">
          <option value="text" ${data.type === 'text' ? 'selected' : ''}>Text</option>
          <option value="search" ${data.type === 'search' ? 'selected' : ''}>Search</option>
          <option value="checkbox" ${data.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
          <option value="dropdown" ${data.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
          <option value="datepicker" ${data.type === 'datepicker' ? 'selected' : ''}>Datepicker</option>
          <option value="radio" ${data.type === 'radio' ? 'selected' : ''}>Radio</option>
          <option value="range" ${data.type === 'range' ? 'selected' : ''}>Range</option>
          <option value="number" ${data.type === 'number' ? 'selected' : ''}>Number</option>
          <option value="color" ${data.type === 'color' ? 'selected' : ''}>Color</option>
          <option value="htmlEditor" ${data.type === 'htmlEditor' ? 'selected' : ''}>HTML Editor</option>
          <option value="dynamicDate" ${data.type === 'dynamicDate' ? 'selected' : ''}>Dynamic Date</option>
          <option value="clickable" ${data.type === 'clickable' ? 'selected' : ''}>Click on</option>
        </select>
      </td>
      <td class="value-cell">${valueCell}</td>
      <td><input type="text" class="testid-input" value="${escapeHtml(data.testId || '')}" data-id="${data.id}" placeholder="data-testid" /></td>
      <td><input type="text" class="querySelector-input" value="${escapeHtml(data.querySelector || '')}" data-id="${data.id}" placeholder="CSS selector" /></td>
      <td><input type="number" class="delay-input" value="${data.fillDelay || 0}" min="0" max="30000" step="100" data-id="${data.id}" placeholder="0" /></td>
      <td><button class="action-btn action-btn--delete" data-id="${data.id}" title="Delete row" data-icons="Trash"></button></td>
    `;

    // Add drag events
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);

    tbody.appendChild(row);
  });

  // Add event listeners
  addTableEventListeners();

  // Update form data count
  const formDataCountEl = document.getElementById('formDataCount');
  if (formDataCountEl) {
    formDataCountEl.textContent = buildQuantityString(formDataList.length);
  }
}

// Add event listeners to table inputs
function addTableEventListeners() {
  document.querySelectorAll('.title-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = (e.target as HTMLInputElement).value;
      updateFormData(id!, { title: value });
    });
  });

  document.querySelectorAll('.type-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = (e.target as HTMLSelectElement).value as FormFieldData['type'];
      updateFormData(id!, { type: value });
      renderFormDataTable(); // Re-render to show correct value input
    });
  });

  document.querySelectorAll('.value-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = (e.target as HTMLInputElement).value;
      updateFormData(id!, { value: value });
    });
  });

  document.querySelectorAll('.value-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = (e.target as HTMLInputElement).checked;
      updateFormData(id!, { value: value });
    });
  });

  // Color picker input synchronization
  document.querySelectorAll('.value-color-picker').forEach(picker => {
    picker.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = (e.target as HTMLInputElement).value;
      // Update the corresponding text input
      const textInput = document.querySelector(`.value-color-text[data-id="${id}"]`) as HTMLInputElement;
      if (textInput) {
        textInput.value = value;
      }
      updateFormData(id!, { value: value });
    });
  });

  // Clickable delay input
  document.querySelectorAll('.value-clickable-delay').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = parseInt((e.target as HTMLInputElement).value) || 0;
      updateFormData(id!, { value: value });
    });
  });

  // Color text input synchronization
  document.querySelectorAll('.value-color-text').forEach(textInput => {
    textInput.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      let value = (e.target as HTMLInputElement).value.trim();
      
      // Add # prefix if not present and value looks like a hex color
      if (value && !value.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(value)) {
        value = '#' + value;
        (e.target as HTMLInputElement).value = value;
      }
      
      // Update the corresponding color picker if valid hex color
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        const colorPicker = document.querySelector(`.value-color-picker[data-id="${id}"]`) as HTMLInputElement;
        if (colorPicker) {
          colorPicker.value = value;
        }
        updateFormData(id!, { value: value });
      }
    });
  });

  document.querySelectorAll('.testid-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = (e.target as HTMLInputElement).value;
      updateFormData(id!, { testId: value });
    });
  });

  document.querySelectorAll('.querySelector-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = (e.target as HTMLInputElement).value;
      updateFormData(id!, { querySelector: value });
    });
  });

  document.querySelectorAll('.delay-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      const value = parseInt((e.target as HTMLInputElement).value) || 0;
      updateFormData(id!, { fillDelay: Math.min(value, 30000) });
    });
  });

  // Dynamic date input event listeners
  const updateDynamicDateValue = (id: string) => {
    const yearsInput = document.querySelector(`.value-dynamic-years[data-id="${id}"]`) as HTMLInputElement;
    const monthsInput = document.querySelector(`.value-dynamic-months[data-id="${id}"]`) as HTMLInputElement;
    const daysInput = document.querySelector(`.value-dynamic-days[data-id="${id}"]`) as HTMLInputElement;
    
    if (yearsInput && monthsInput && daysInput) {
      const years = parseInt(yearsInput.value) || 0;
      const months = parseInt(monthsInput.value) || 0;
      const days = parseInt(daysInput.value) || 0;
      const value = JSON.stringify({ years, months, days });
      updateFormData(id, { value });
    }
  };

  document.querySelectorAll('.value-dynamic-years, .value-dynamic-months, .value-dynamic-days').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id');
      if (id) updateDynamicDateValue(id);
    });
  });

  document.querySelectorAll('.action-btn--delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      deleteFormDataRow(id!);
    });
  });

  document.querySelectorAll('.btn-order-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const id = target.getAttribute('data-id');
      const action = target.getAttribute('data-action');
      if (action === 'insert') {
        insertRowBelow(id!);
      } else if (action === 'clone') {
        cloneRowBelow(id!);
      } else if (action === 'move') {
        moveRowToPosition(id!);
      }
    });
  });

  // Share action (clone to selected presets)
  document.querySelectorAll('.btn-share-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) openShareRowModal(id);
    });
  });
}

// Update form data
function updateFormData(id: string, updates: Partial<FormFieldData>) {
  const index = formDataList.findIndex(f => f.id === id);
  if (index !== -1) {
    formDataList[index] = {
      ...formDataList[index],
      ...updates,
      updatedAt: getCurrentTimestamp()
    };
    hasUnsavedPresetChanges = true;
    updatePresetButtons();
  }
}

// Delete form data row
function deleteFormDataRow(id: string) {
  formDataList = formDataList.filter(f => f.id !== id);
  reorderFormData();
  renderFormDataTable();
  hasUnsavedPresetChanges = true;
  updatePresetButtons();
}

// Reset form data to original state
function resetFormData() {
  formDataList = JSON.parse(JSON.stringify(originalFormDataList));
  hasUnsavedPresetChanges = false;
  updatePresetButtons();
  
  // Reload UI
  (document.getElementById('presetName') as HTMLInputElement).value = currentPreset?.name || '';
  (document.getElementById('presetDescription') as HTMLTextAreaElement).value = currentPreset?.description || '';
  renderFormDataTable();
}

// Update button visibility based on unsaved changes
function updateButtonVisibility() {
  updatePresetButtons();
  updateSavedValuesButtons();
}

// Insert new row below
function insertRowBelow(id: string) {
  const index = formDataList.findIndex(f => f.id === id);
  if (index === -1) return;
  
  const newData: FormFieldData = {
    id: generateGuid(),
    type: 'text',
    title: '',
    value: '',
    testId: '',
    querySelector: '',
    fillDelay: 0,
    autoBlur: true,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
    order: index + 2
  };
  
  formDataList.splice(index + 1, 0, newData);
  reorderFormData();
  renderFormDataTable();
  hasUnsavedPresetChanges = true;
  updateButtonVisibility();
  
  // Highlight new row
  setTimeout(() => {
    const newRow = document.querySelector(`tr[data-id="${newData.id}"]`) as HTMLElement;
    if (newRow) {
      newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      newRow.classList.add('highlight-new');
      setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
    }
  }, 100);
}

// Clone row below
function cloneRowBelow(id: string) {
  const index = formDataList.findIndex(f => f.id === id);
  if (index === -1) return;
  
  const sourceData = formDataList[index];
  const clonedData: FormFieldData = {
    ...sourceData,
    id: generateGuid(),
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
    order: index + 2
  };
  
  formDataList.splice(index + 1, 0, clonedData);
  reorderFormData();
  renderFormDataTable();
  hasUnsavedPresetChanges = true;
  updateButtonVisibility();
  
  // Highlight cloned row
  setTimeout(() => {
    const newRow = document.querySelector(`tr[data-id="${clonedData.id}"]`) as HTMLElement;
    if (newRow) {
      newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      newRow.classList.add('highlight-new');
      setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
    }
  }, 100);
}

// Move row to specified position
function moveRowToPosition(id: string) {
  const currentIndex = formDataList.findIndex(f => f.id === id);
  if (currentIndex === -1) return;

  const body = `
    <div class="modal-body">
      <p>Enter the new position for this row (1 to ${formDataList.length}):</p>
      <input class="modal-input" type="number" id="movePositionInput" min="1" max="${formDataList.length}" value="${currentIndex + 1}" />
      <div class="modal-actions">
        <button id="moveCancelBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="moveConfirmBtn" class="cyber-btn">
          Move
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;

  showModal('Move row to new position', body, () => {});

  document.getElementById('moveCancelBtn')?.addEventListener('click', () => hideModal());
  document.getElementById('moveConfirmBtn')?.addEventListener('click', () => {
    const inputEl = document.getElementById('movePositionInput') as HTMLInputElement;
    const newPos = parseInt(inputEl.value);
    if (isNaN(newPos) || newPos < 1 || newPos > formDataList.length) {
      showToast('Invalid position', 'error');
      return;
    }
    // Move the item
    const item = formDataList.splice(currentIndex, 1)[0];
    formDataList.splice(newPos - 1, 0, item);
    reorderFormData();
    renderFormDataTable();
    hasUnsavedPresetChanges = true;
    updatePresetButtons();
    hideModal();
  });
}

// Open modal to select target presets and share (clone) a row into them
async function openShareRowModal(rowId: string) {
  const sourceField = formDataList.find(f => f.id === rowId);
  if (!sourceField) {
    showToast('Field not found', 'error');
    return;
  }

  try {
    const data = await StorageService.getData();
    const allPresets = data?.presets ?? [];
    // Exclude current preset
    const targets = allPresets.filter(p => p.id !== currentPresetId);
    if (targets.length === 0) {
      showToast('No other presets available to share to', 'info');
      return;
    }

    const itemsHtml = targets.map(p => {
      const fieldsCount = (p.formData || []).length;
      return `
        <label class="modal-list-item">
          <input type="checkbox" class="share-preset-checkbox" value="${p.id}" />
          <div class="meta">
            <div class="title">${escapeHtml(p.name || '(Untitled)')}</div>
            <div class="subtitle">${escapeHtml(p.description || '')}</div>
            <div class="subtitle">Fields: ${fieldsCount}</div>
          </div>
        </label>
      `;
    }).join('');

    const body = `
      <div class="modal-body">
        <div class="modal-selection-counter">Selected: 0 / ${targets.length}</div>
        <div class="modal-list">${itemsHtml}</div>
        <div class="modal-actions">
          <button id="shareCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel<span class="cyber-btn__glitch"></span></button>
          <button id="shareConfirmBtn" class="cyber-btn">Confirm<span class="cyber-btn__glitch"></span></button>
        </div>
      </div>
    `;

    showModal('Share Field To Presets', body, () => {});

    // Update counter when checkboxes change
    const updateCounter = () => {
      const checkedCount = document.querySelectorAll('.share-preset-checkbox:checked').length;
      const totalCount = targets.length;
      const counterEl = document.querySelector('.modal-selection-counter');
      if (counterEl) {
        counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
      }
    };

    // Add change listeners to checkboxes
    document.querySelectorAll('.share-preset-checkbox').forEach(cb => {
      cb.addEventListener('change', updateCounter);
    });

    document.getElementById('shareCancelBtn')?.addEventListener('click', () => hideModal());
    document.getElementById('shareConfirmBtn')?.addEventListener('click', async () => {
      const selected: string[] = [];
      document.querySelectorAll('.share-preset-checkbox:checked').forEach(cb => selected.push((cb as HTMLInputElement).value));
      if (selected.length === 0) {
        showToast('Please choose at least one preset', 'warning');
        return;
      }

      try {
        for (const presetId of selected) {
          const preset = await StorageService.getPresetById(presetId);
          if (!preset) continue;

          const newField: FormFieldData = {
            ...sourceField,
            id: generateGuid(),
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: (preset.formData?.length || 0) + 1
          };

          const updatedFormData = [...(preset.formData || []), newField];
          await StorageService.updatePreset(presetId, { formData: updatedFormData });
        }

        hideModal();
        showToast(`Field shared to ${selected.length} preset(s)`, 'success');
      } catch (err) {
        console.error('Failed to share field:', err);
        showToast('Failed to share field. Please try again.', 'error');
      }
    });

  } catch (err) {
    console.error('Failed to load presets:', err);
    showToast('Failed to load presets. Please try again.', 'error');
  }
}

// Reorder form data after changes
function reorderFormData() {
  formDataList.forEach((item, index) => {
    item.order = index + 1;
    item.updatedAt = getCurrentTimestamp();
  });
}

// Drag and drop handlers
function handleDragStart(e: DragEvent) {
  // Prevent drag if user is focused on an input element
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
    e.preventDefault();
    return;
  }

  draggedRow = e.currentTarget as HTMLTableRowElement;
  draggedRow.classList.add('dragging');
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  
  const target = e.currentTarget as HTMLTableRowElement;
  
  // Remove drag-over class from all rows first
  document.querySelectorAll('#formDataTable tbody tr').forEach(row => {
    row.classList.remove('drag-over');
  });
  
  // Add drag-over class to current target if it's not the dragged row
  if (draggedRow && target !== draggedRow) {
    target.classList.add('drag-over');
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  const target = e.currentTarget as HTMLTableRowElement;
  target.classList.remove('drag-over');
  
  if (!draggedRow || target === draggedRow) return;
  
  const draggedId = draggedRow.getAttribute('data-id');
  const targetId = target.getAttribute('data-id');
  
  if (!draggedId || !targetId) return;
  
  const draggedIndex = formDataList.findIndex(f => f.id === draggedId);
  const targetIndex = formDataList.findIndex(f => f.id === targetId);
  
  if (draggedIndex === -1 || targetIndex === -1) return;
  
  // Reorder array
  const [removed] = formDataList.splice(draggedIndex, 1);
  formDataList.splice(targetIndex, 0, removed);
  
  reorderFormData();
  renderFormDataTable();
  hasUnsavedPresetChanges = true;
  updateButtonVisibility();
}

function handleDragEnd(e: DragEvent) {
  const target = e.currentTarget as HTMLTableRowElement;
  target.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedRow = null;
}

// Export page data (full page profile including presets and saved values)
async function exportPageData() {
  if (!currentPageData) return;

  const page = currentPageData;
  
  const presets = await StorageService.getPresetsForPage(page.id);
  const savedValues = await StorageService.getSavedValuesForPage(page.id);

  const data = await StorageService.getData();
  const presetIds = new Set(presets.map(p => p.id));
  const presetPageLinks = (data?.presetPageLinks ?? []).filter(
    link => link.pageId === page.id && presetIds.has(link.presetId)
  );

  const exportFile = createExportFile({
    included: {
      pages: true,
      presets: true,
      presetPageLinks: true,
      savedValues: true,
    },
    data: {
      pages: [page],
      presets,
      presetPageLinks,
      savedValues,
    },
  });

  const filename = page.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_page_profile.json`);
  showToast('Page profile exported and downloaded', 'success');
}

// Export preset only to JSON
function exportPresetOnly() {
  const name = (document.getElementById('presetName') as HTMLInputElement).value || 'preset';
  const description = (document.getElementById('presetDescription') as HTMLInputElement).value;

  const exportedAt = getCurrentTimestamp();
  const preset: Preset = {
    id: `export-${generateGuid()}`,
    name,
    description,
    formData: formDataList,
    createdAt: exportedAt,
    updatedAt: exportedAt,
  };

  const exportFile = createExportFile({
    included: { presets: true },
    data: { presets: [preset] },
    exportedAt,
  });

  downloadFile(
    JSON.stringify(exportFile, null, 2),
    `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preset.json`
  );
  showToast('Preset exported and downloaded', 'success');
}

// Import preset from JSON and create new preset
async function importPresetFromJson(file: File) {
  try {
    const text = await file.text();

    const imported = parseExtensionExportJson(text);

    if (!imported.included.presets || !Array.isArray(imported.data.presets) || imported.data.presets.length === 0) {
      showToast('Invalid import file: presets section not included', 'error');
      return;
    }
    
    if (!currentPageData) {
      showToast('No page data available', 'error');
      return;
    }

    // Get current data to check for duplicates
    const data = await StorageService.getData();
    if (!data) return;

    let importedCount = 0;
    let ignoredCount = 0;
    let firstImportedPresetId: string | null = null;

    // Process each preset in the import file
    for (const presetToImport of imported.data.presets) {
      // Check if preset already exists with same ID
      const existingPreset = data.presets.find(p => p.id === presetToImport.id);
      
      if (existingPreset) {
        // Duplicate found, ignore it
        ignoredCount++;
        continue;
      }

      // Create new preset with imported data (ignore exported ids/timestamps)
      const newPreset = await StorageService.addPreset({
        name: presetToImport.name || 'Imported Preset',
        description: presetToImport.description || '',
        formData: (presetToImport.formData || []).map((field: any, index: number) => ({
          id: generateGuid(),
          type: field.type || 'text',
          title: field.title || '',
          value: field.value || '',
          testId: field.testId || '',
          querySelector: field.querySelector || '',
          fillDelay: field.fillDelay || 0,
          autoBlur: field.autoBlur ?? true,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
          order: index + 1
        }))
      });
      
      // Link to current page
      await StorageService.linkPresetToPage(newPreset.id, currentPageData.id);
      
      // Track first imported preset for redirect
      if (!firstImportedPresetId) {
        firstImportedPresetId = newPreset.id;
      }
      
      importedCount++;
    }

    // Show summary notification
    if (importedCount === 0 && ignoredCount > 0) {
      showToast(`All ${ignoredCount} preset(s) already exist (same IDs). If the duplicated ones are owned by another page, try to link them to there. Finally: Import skipped.`, 'info');
    } else if (importedCount > 0 && ignoredCount === 0) {
      showToast(`${importedCount} preset(s) imported successfully.`, 'success');
    } else if (importedCount > 0 && ignoredCount > 0) {
      showToast(`${importedCount} preset(s) imported, ${ignoredCount} duplicate(s) ignored. If the duplicated ones are owned by another page, try to link them to there.`, 'success');
    }
    
    // Reload the page with the first imported preset (or just current page if none imported)
    if (firstImportedPresetId) {
      window.location.href = `page-profile-editor.html?pageId=${currentPageData.id}&presetId=${firstImportedPresetId}`;
    }
  } catch (error) {
    console.error('Import error:', error);
    showToast('Failed to import preset. Please check the file format.', 'error');
  }
}

// Save preset
async function savePreset() {
  const name = (document.getElementById('presetName') as HTMLInputElement).value;
  const description = (document.getElementById('presetDescription') as HTMLTextAreaElement).value;

  if (!name) {
    showToast('Preset name is required', 'warning');
    return false;
  }

  // Sort form data by order
  formDataList.sort((a, b) => a.order - b.order);

  if (!currentPageData) {
    showToast('Page data not found', 'error');
    return false;
  }

  if (currentPresetId && currentPreset) {
    // Update existing preset
    await StorageService.updatePreset(currentPresetId, {
      name,
      description,
      formData: formDataList
    });
  } else {
    // Create new preset
    const newPreset = await StorageService.addPreset({
      name,
      description,
      formData: formDataList
    });
    // Link to current page
    await StorageService.linkPresetToPage(newPreset.id, currentPageData.id);
  }

  await loadPagePresets(); // Refresh preset list
  return true;
}

// Save all data (preset + saved values)
async function saveAllData() {
  // Save preset
  const presetSaved = await savePreset();
  if (!presetSaved) return;

  // Save saved values
  await saveSavedValues();

  hasUnsavedPresetChanges = false;
  hasUnsavedSavedValuesChanges = false;
  updateButtonVisibility();
  showToast('All changes saved successfully!', 'success');
}

// Save saved values
async function saveSavedValues() {
  if (!currentPageData) return;

  // Update all saved values for this page
  const data = await StorageService.getData();
  if (!data) return;

  // Remove old saved values for this page
  data.savedValues = data.savedValues.filter(sv => sv.pageId !== currentPageId);

  // Add updated saved values
  data.savedValues.push(...savedValuesList);

  await StorageService.setData(data);
  originalSavedValuesList = JSON.parse(JSON.stringify(savedValuesList));
}

// Tab switching
function switchTab(tabId: string) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

// Add new saved value row
function addSavedValueRow(data?: SavedValue) {
  const newData: SavedValue = data || {
    id: generateGuid(),
    pageId: currentPageId,
    label: '',
    value: '',
    testId: '',
    querySelector: '',
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  };

  savedValuesList.push(newData);
  renderSavedValuesTable();
  updateSavedValuesCount();
  hasUnsavedSavedValuesChanges = true;
  updateButtonVisibility();

  // Highlight and scroll to the new saved value row similar to preset editor
  setTimeout(() => {
    const newRow = document.querySelector(`tr[data-id="${newData.id}"]`) as HTMLElement | null;
    if (newRow) {
      const tbody = document.getElementById('savedValuesBody');
      const container = tbody?.closest('.table-container') as HTMLElement | null;
      if (container) container.scrollTop = container.scrollHeight;
      else newRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
      newRow.classList.add('highlight-new');
      setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
    }
  }, 100);
}

// Render saved values table
function renderSavedValuesTable() {
  const tbody = document.getElementById('savedValuesBody');
  if (!tbody) return;

  if (savedValuesList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 24px;">No saved values yet</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  savedValuesList.forEach((data, index) => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', data.id);
    
    const formattedDate = new Date(data.updatedAt).toLocaleString('en-US', {
      year: '2-digit',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    row.innerHTML = `
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.label}" 
          data-field="label"
          placeholder="Field label"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.value}" 
          data-field="value"
          placeholder="Saved value"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.testId || ''}" 
          data-field="testId"
          placeholder="data-testid"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.querySelector || ''}" 
          data-field="querySelector"
          placeholder="CSS selector"
        />
      </td>
      <td style="color: var(--text-secondary); font-size: 11px;">
        ${formattedDate}
      </td>
      <td>
        <button class="action-btn action-btn--delete" data-id="${data.id}" title="Delete" data-icons="Trash"></button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // Add event listeners for inputs
  tbody.querySelectorAll('.table-input').forEach(input => {
    input.addEventListener('input', handleSavedValueInputChange);
    input.addEventListener('blur', () => { hasUnsavedSavedValuesChanges = true; updateSavedValuesButtons(); });
  });

  // Add event listeners for delete buttons
  tbody.querySelectorAll('.action-btn--delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) await deleteSavedValue(id);
    });
  });

  // Update saved values count
  updateSavedValuesCount();
}

// Update saved values count (separate function to reuse)
function updateSavedValuesCount() {
  const el = document.getElementById('savedValuesCount');
  if (!el) return;
  el.textContent = buildQuantityString(savedValuesList.length);
}

// Handle saved value input change
function handleSavedValueInputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const row = input.closest('tr');
  if (!row) return;

  const id = row.getAttribute('data-id');
  if (!id) return;

  const field = input.getAttribute('data-field');
  if (!field) return;

  const savedValue = savedValuesList.find(d => d.id === id);
  if (!savedValue) return;

  // Update the data
  (savedValue as any)[field] = input.value;
  savedValue.updatedAt = getCurrentTimestamp();
  hasUnsavedSavedValuesChanges = true;
  updateSavedValuesButtons();
}

// Delete saved value
async function deleteSavedValue(id: string) {
  if (!await showConfirm('Delete Saved Value', 'Are you sure you want to delete this saved value?')) return;

  const index = savedValuesList.findIndex(d => d.id === id);
  if (index === -1) return;

  savedValuesList.splice(index, 1);
  renderSavedValuesTable();
  updateSavedValuesCount();
  hasUnsavedSavedValuesChanges = true;
  updateSavedValuesButtons();
}

// Export saved values to JSON
async function exportSavedValues() {
  if (!currentPageData) {
    showToast('No page selected', 'warning');
    return;
  }

  if (savedValuesList.length === 0) {
    showToast('No saved values to export', 'info');
    return;
  }

  const exportFile = createExportFile({
    included: { pages: true, savedValues: true },
    data: { pages: [currentPageData], savedValues: savedValuesList },
  });

  downloadFile(
    JSON.stringify(exportFile, null, 2),
    `saved-values-${currentPageData.pageTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`
  );
  showToast('Saved values exported and downloaded', 'success');
}

// Import saved values from JSON
async function importSavedValues(file: File) {
  if (!currentPageData) {
    showToast('No page selected', 'warning');
    return;
  }

  try {
    const text = await file.text();
    const imported = parseExtensionExportJson(text);

    if (!imported.included.savedValues || !Array.isArray(imported.data.savedValues)) {
      showToast('Invalid import file: savedValues section not included', 'error');
      return;
    }

    let addedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const addedIds: string[] = [];

    for (const value of imported.data.savedValues) {
      // Check for duplicate by testId AND querySelector
      const existing = savedValuesList.find(v => 
        v.testId === value.testId && v.querySelector === value.querySelector
      );

      if (existing) {
        // Ask user if they want to overwrite
        const overwrite = await showConfirm(
          'Overwrite Saved Value',
          `A saved value with testId="${value.testId}" and querySelector="${value.querySelector}" already exists.\n\n` +
          `Current value: "${existing.value}"\n` +
          `Imported value: "${value.value}"\n\n` +
          `Do you want to overwrite it?`
        );

        if (overwrite) {
          existing.label = value.label;
          existing.value = value.value;
          existing.testId = value.testId;
          existing.querySelector = value.querySelector;
          existing.updatedAt = getCurrentTimestamp();
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        // Add new saved value with new ID
        const newValue = {
          ...value,
          id: generateGuid(),
          pageId: currentPageData.id,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp()
        };

        savedValuesList.push(newValue);
        addedIds.push(newValue.id);
        addedCount++;
      }
    }

    renderSavedValuesTable();
    hasUnsavedSavedValuesChanges = true;
    updateSavedValuesButtons();
    updateSavedValuesCount();

    // Highlight the most recently added saved value (if any)
    if (addedIds.length > 0) {
      setTimeout(() => {
        const lastId = addedIds[addedIds.length - 1];
        const newRow = document.querySelector(`tr[data-id="${lastId}"]`) as HTMLElement | null;
        if (newRow) {
          const tbody = document.getElementById('savedValuesBody');
          const container = tbody?.closest('.table-container') as HTMLElement | null;
          if (container) container.scrollTop = container.scrollHeight;
          else newRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
          newRow.classList.add('highlight-new');
          setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
      }, 100);
    }

    showToast(
      `Import complete: Added: ${addedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`,
      'success'
    );
  } catch (error) {
    console.error('Import saved values error:', error);
    showToast('Failed to import saved values. Please check the file format.', 'error');
  }
}

// Show export selection modal for page profile
async function showExportSelectionModal() {
  if (!currentPageData) return;

  const page = currentPageData;
  const presets = await StorageService.getPresetsForPage(page.id);
  const savedValues = await StorageService.getSavedValuesForPage(page.id);

  const modalContent = `
    <div class="export-selection">
      <p>Select what you want to export for this page profile:</p>
      
      <div class="export-options">
        <label class="export-option">
          <input type="checkbox" id="exportPage" checked>
          <span class="checkmark"></span>
          Page Information (${escapeHtml(page.pageTitle)})
        </label>
        
        <label class="export-option">
          <input type="checkbox" id="exportPresets" checked>
          <span class="checkmark"></span>
          Presets (${presets.length} items)
        </label>
        
        <label class="export-option">
          <input type="checkbox" id="exportSavedValues" checked>
          <span class="checkmark"></span>
          Saved Values (${savedValues.length} items)
        </label>
      </div>
      
      <div class="modal-actions">
        <button id="cancelExportBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="selectAllBtn" class="cyber-btn cyber-btn--secondary">
          Select All
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">all</span>
        </button>
        <button id="exportSelectedBtn" class="cyber-btn">
        Export Selected
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;

  showModal('Export Page Profile', modalContent);

  // Handle select all button
  document.getElementById('selectAllBtn')?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.export-selection input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
      cb.checked = !allChecked;
    });
  });

  // Handle export selected button
  document.getElementById('exportSelectedBtn')?.addEventListener('click', async () => {
    const exportPage = (document.getElementById('exportPage') as HTMLInputElement).checked;
    const exportPresets = (document.getElementById('exportPresets') as HTMLInputElement).checked;
    const exportSavedValues = (document.getElementById('exportSavedValues') as HTMLInputElement).checked;

    if (!exportPage && !exportPresets && !exportSavedValues) {
      showToast('Please select at least one item to export', 'warning');
      return;
    }

    hideModal();
    await performExport(exportPage, exportPresets, exportSavedValues);
  });

  // Handle cancel button
  document.getElementById('cancelExportBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Show preset export selection modal for current page presets
async function showPresetExportSelectionModal() {
  if (!currentPageData) return;

  const presets = await StorageService.getPresetsForPage(currentPageData.id);

  if (presets.length === 0) {
    showToast('No presets available for this page', 'info');
    return;
  }

  const modalContent = `
    <div class="export-selection">
      <p>Select presets to export:</p>
      <div class="modal-selection-counter">Selected: ${presets.length} / ${presets.length}</div>
      
      <div class="preset-selection-list">
        <label class="export-option select-all-option">
          <input type="checkbox" id="selectAllPresets" checked>
          <span class="checkmark"></span>
          <strong>Select All Presets</strong>
        </label>
        
        <div class="preset-list">
          ${presets.map(preset => `
            <label class="export-option preset-option">
              <input type="checkbox" class="preset-checkbox" value="${preset.id}" checked>
              <span class="checkmark"></span>
              <div class="preset-card">
                <div class="preset-title">${escapeHtml(preset.name)}</div>
                ${preset.description ? `<div class="preset-card-description">${escapeHtml(preset.description)}</div>` : '<div class="preset-card-description">No description</div>'}
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
    const totalCount = presets.length;
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

    const selectedPresets = presets.filter(preset => selectedIds.includes(preset.id));

    hideModal();
    await performPresetExport(selectedPresets);
  });

  // Handle cancel button
  document.getElementById('cancelPresetExportBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Perform the actual export based on selections
async function performExport(includePage: boolean, includePresets: boolean, includeSavedValues: boolean) {
  if (!currentPageData) return;

  const page = currentPageData;
  const presets = includePresets ? await StorageService.getPresetsForPage(page.id) : [];
  const savedValues = includeSavedValues ? await StorageService.getSavedValuesForPage(page.id) : [];

  const data = await StorageService.getData();
  const presetIds = new Set(presets.map(p => p.id));
  const presetPageLinks = includePresets ? (data?.presetPageLinks ?? []).filter(
    link => link.pageId === page.id && presetIds.has(link.presetId)
  ) : [];

  const included: any = {};
  const exportData: any = {};

  if (includePage) {
    included.pages = true;
    exportData.pages = [page];
  }

  if (includePresets) {
    included.presets = true;
    included.presetPageLinks = true;
    exportData.presets = presets;
    exportData.presetPageLinks = presetPageLinks;
  }

  if (includeSavedValues) {
    included.savedValues = true;
    exportData.savedValues = savedValues;
  }

  const exportFile = createExportFile({
    included,
    data: exportData,
  });

  const filename = page.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const selectedItems = [];
  if (includePage) selectedItems.push('page');
  if (includePresets) selectedItems.push('presets');
  if (includeSavedValues) selectedItems.push('saved values');
  
  downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_page_profile.json`);
  showToast(`Selected ${selectedItems.join(', ')} exported and downloaded`, 'success');
}

// Perform the actual preset export
async function performPresetExport(selectedPresets: Preset[]) {
  if (!currentPageData) return;

  const exportFile = createExportFile({
    included: { presets: true },
    data: { presets: selectedPresets }
  });

  const filename = currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_presets.json`);
  showToast(`${selectedPresets.length} preset${selectedPresets.length === 1 ? '' : 's'} exported and downloaded`, 'success');
}

// Initialize
init();
