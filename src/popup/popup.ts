import { StorageService } from '../services/storage.service';
import { FormFieldData, PageData } from '../types';
import { generateGuid, getCurrentTimestamp, generateRandomString, getCharacterSet } from '../utils/helpers';
import { downloadFile, initTheme, initVersion } from '../utils/common';
import { createExportFile, parseExtensionExportJson } from '../utils/export-format';
import { initIconReplacement } from '../utils/icon-replacer';
import { initCyberButtons } from '../utils/cyber-btn-init';
import { showModal, hideModal } from '../utils/modal-utils';
import { initGuideOverlays } from '../utils/guide-overlay';

let currentPageData: PageData | null = null;
let currentUrl: string = '';
let currentTabTitle: string = '';
let sortColumn: 'rank' | 'name' | 'description' | 'updated' = 'rank';
let sortDirection: 'asc' | 'desc' = 'asc';

// Initialize popup
async function init() {
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
      currentUrl = tabs[0].url;
      currentTabTitle = tabs[0].title || '';
    }

    // Load page data
    await loadPageData();

    // Load settings to check if random string section should be shown
    const settings = await StorageService.getSettings();
    const randomStringSection = document.getElementById('randomStringSection');
    if (randomStringSection && settings?.enableRandomStringSectionInPopup) {
      randomStringSection.style.display = 'block';
      initRandomStringSection(settings);
    }

    // Setup settings button
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('./html/settings.html') });
    });

    // Setup string counter button
    document.getElementById('stringCounterBtn')?.addEventListener('click', () => {
      showStringCounterModal();
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
        const abilityText = 
          (btn.getAttribute('title') || btn.getAttribute('data-tooltip') || btn.textContent || '')
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
  } catch (error) {
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
function formatDate(dateString: string): string {
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
function showNotification(message: string, onClose?: () => void) {
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
function showConfirmation(message: string, onConfirm: () => void, onCancel?: () => void) {
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
      if (actionHandled) return;
      actionHandled = true;
      hideModal();
      onConfirm();
    });

    document.getElementById('confirmNoBtn')?.addEventListener('click', () => {
      if (actionHandled) return;
      actionHandled = true;
      hideModal();
      if (onCancel) onCancel();
    });
  }, 0);
}

// Load settings
async function loadSettings() {
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
  updateDependentToggles();

  if (enableSaveValueCheckbox) {
    enableSaveValueCheckbox.addEventListener('change', async () => {
      const currentSettings = await StorageService.getSettings();
      if (!currentSettings) return;
      await StorageService.setSettings({
        ...currentSettings,
        enableSaveValue: enableSaveValueCheckbox.checked
      });
    });
  }

  if (enableImportValueCheckbox) {
    enableImportValueCheckbox.addEventListener('change', async () => {
      const currentSettings = await StorageService.getSettings();
      if (!currentSettings) return;
      await StorageService.setSettings({
        ...currentSettings,
        enableImportValue: enableImportValueCheckbox.checked
      });
    });
  }

  if (enableLiveAssistantCheckbox) {
    enableLiveAssistantCheckbox.addEventListener('change', async () => {
      const currentSettings = await StorageService.getSettings();
      if (!currentSettings) return;
      await StorageService.setSettings({
        ...currentSettings,
        enableLiveAssistant: enableLiveAssistantCheckbox.checked
      });
      updateDependentToggles();
    });
  }
}

// Update dependent toggles based on enableLiveAssistant state
function updateDependentToggles() {
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

// Load page data
async function loadPageData() {
  currentPageData = await StorageService.getCurrentPageData(currentUrl);

  const pageSection = document.getElementById('pageSection') as HTMLElement;
  const noPageContent = document.getElementById('noPageContent') as HTMLElement;
  const hasPageContent = document.getElementById('hasPageContent') as HTMLElement;
  const mainContent = document.getElementById('mainContent') as HTMLElement;

  if (!currentPageData) {
    pageSection.querySelector('.section-title')?.setAttribute('style', 'display: none;');
    noPageContent.style.display = 'block';
    hasPageContent.style.display = 'none';
    mainContent.innerHTML = '';
    mainContent.style.display = 'none';

    setupNoPageActions();
  } else {
    pageSection.querySelector('.section-title')?.setAttribute('style', 'display: block;');
    noPageContent.style.display = 'none';
    hasPageContent.style.display = 'block';
    mainContent.style.display = 'block';

    // Update page info display
    updatePageInfoDisplay();

    // Show page management (presets)
    showPageManagement(mainContent);
  }
}

// Setup actions for when no page data exists
function setupNoPageActions() {
  // Create New Profile button
  document.getElementById('createNewPageBtn')?.addEventListener('click', () => {
    showCreatePageModal();
  });

  // Clone from Existing button
  document.getElementById('cloneFromExistingBtn')?.addEventListener('click', () => {
    showClonePageModal();
  });

  // Import Page Profile button
  document.getElementById('importPageProfileBtn')?.addEventListener('click', () => {
    const importInput = document.getElementById('importPageFile') as HTMLInputElement;
    importInput.click();
  });

  // Setup import file handler
  const importInput = document.getElementById('importPageFile') as HTMLInputElement;
  importInput.addEventListener('change', handleImportFile);
}

// Handle import file
async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      const importedData = parseExtensionExportJson(content);

      const data = await StorageService.getData();
      if (!data) return;

      const duplicates: string[] = [];
      let pageSkipped = false;
      let presetsSkipped = 0;
      let savedValuesSkipped = 0;

      if (!importedData.included.pages || importedData.data.pages.length === 0) {
        showNotification('Failed to import: pages section not included in file.');
        return;
      }

      const pageData = importedData.data.pages[0];

      // Check if page already exists (by currentUrl + matchIdentify)
      const existingPage = data.pages.find(p =>
        p.url === currentUrl && p.matchIdentify === (pageData.matchIdentify ?? 'prefixMatch')
      );

      let targetPageId: string;
      if (existingPage) {
        duplicates.push(`Page: ${pageData.pageTitle}`);
        targetPageId = existingPage.id;
        pageSkipped = true;
      } else {
        // Import the page data
        const newPage = await StorageService.addPage({
          pageTitle: pageData.pageTitle || 'Imported Page',
          url: currentUrl,
          description: pageData.description || '',
          owner: pageData.owner || '',
          matchIdentify: pageData.matchIdentify ?? 'prefixMatch'
        });
        targetPageId = newPage.id;
      }

      // Import presets
      if (importedData.included.presets && Array.isArray(importedData.data.presets)) {
        for (const preset of importedData.data.presets) {
          const existingPreset = data.presets.find(p => (preset.id && p.id === preset.id) || p.name === preset.name);
          if (existingPreset) {
            duplicates.push(`Preset: ${preset.name}`);
            presetsSkipped++;
            // Link existing preset to page if not already linked
            const linkExists = data.presetPageLinks.some(
              l => l.presetId === existingPreset.id && l.pageId === targetPageId
            );
            if (!linkExists) {
              await StorageService.linkPresetToPage(existingPreset.id, targetPageId);
            }
          } else {
            const newPreset = await StorageService.addPreset({
              name: preset.name || 'Imported Preset',
              description: preset.description || '',
              formData: preset.formData || []
            });
            await StorageService.linkPresetToPage(newPreset.id, targetPageId);
          }
        }
      }

      // Import saved values
      if (importedData.included.savedValues && Array.isArray(importedData.data.savedValues)) {
        const refreshedData = await StorageService.getData();
        if (refreshedData) {
          for (const savedValue of importedData.data.savedValues) {
            const existingSavedValue = refreshedData.savedValues.find(sv =>
              sv.pageId === targetPageId
              && sv.testId === savedValue.testId
              && sv.querySelector === savedValue.querySelector
            );
            if (existingSavedValue) {
              duplicates.push(`Saved Value: ${savedValue.label}`);
              savedValuesSkipped++;
            } else {
              refreshedData.savedValues.push({
                ...savedValue,
                id: generateGuid(),
                pageId: targetPageId,
                createdAt: getCurrentTimestamp(),
                updatedAt: getCurrentTimestamp()
              });
            }
          }
          await StorageService.setData(refreshedData);
        }
      }

      let message = 'Page profile imported successfully!';
      if (duplicates.length > 0) {
        message += `<br><br>Duplicates skipped (${duplicates.length}):<br>` + duplicates.slice(0, 10).join('<br>');
        if (duplicates.length > 10) {
          message += `<br>... and ${duplicates.length - 10} more`;
        }
      }

      showNotification(message, async () => {
        await loadPageData();
      });
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Failed to import page profile. Please check the file format.');
    }
  };

  reader.readAsText(file);
  input.value = ''; // Reset input
}

// Show create page modal
function showCreatePageModal() {
  const bodyContent = `
    <div class="form-group">
      <label for="newPageTitle">Page Title *</label>
      <input type="text" id="newPageTitle" value="${currentTabTitle}" required />
    </div>
    <div class="form-group">
      <label for="newPageUrl">URL *</label>
      <input type="text" id="newPageUrl" value="${currentUrl}" required />
    </div>
    <div class="form-group">
      <label for="newMatchIdentify">URL Match Type</label>
      <select id="newMatchIdentify" class="match-select">
      <option value="prefixMatch" selected>Prefix Match</option>
      <option value="exactMatch">Exact Match</option>
      </select>
    </div>
    <div class="form-group">
      <label for="newPageDescription">Description</label>
      <textarea id="newPageDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-group">
      <label for="newPageOwner">Owner</label>
      <input type="text" id="newPageOwner" placeholder="Optional owner name" />
    </div>
    <div class="form-actions">
      <button id="cancelNewPageBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="saveNewPageBtn" class="cyber-btn">Create Profile
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;

  showModal('Create New Page Profile', bodyContent);

  document.getElementById('saveNewPageBtn')?.addEventListener('click', async () => {
    const pageTitle = (document.getElementById('newPageTitle') as HTMLInputElement).value;
    const pageUrl = (document.getElementById('newPageUrl') as HTMLInputElement).value;
    const pageDescription = (document.getElementById('newPageDescription') as HTMLTextAreaElement).value;
    const pageOwner = (document.getElementById('newPageOwner') as HTMLInputElement).value;
    const matchIdentify = (document.getElementById('newMatchIdentify') as HTMLSelectElement).value as 'exactMatch' | 'prefixMatch';

    if (!pageTitle || !pageUrl) {
      showNotification('Page title and URL are required');
      return;
    }

    await StorageService.addPage({
      pageTitle,
      url: pageUrl,
      description: pageDescription,
      owner: pageOwner,
      matchIdentify
    });

    hideModal();
    await loadPageData();
  });

  document.getElementById('cancelNewPageBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Show clone page modal
async function showClonePageModal() {
  const data = await StorageService.getData();
  const pages = data?.pages || [];

  if (pages.length === 0) {
    showNotification('No existing pages to clone from. Please create a new page first.');
    return;
  }

  const bodyContent = `
    <div class="form-group">
      <label for="sourcePageSelect">Select source page to clone:</label>
      <select id="sourcePageSelect">
        <option value="">-- Select a page --</option>
        ${pages.map(page => `<option value="${page.id}">${page.pageTitle} (${page.url})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="clonePageTitle">New Page Title *</label>
      <input type="text" id="clonePageTitle" placeholder="Enter a name for this page" value="${currentTabTitle}" required />
    </div>
    <div class="form-group">
      <label for="clonePageUrl">URL *</label>
      <input type="text" id="clonePageUrl" value="${currentUrl}" required />
    </div>
    <div class="form-group">
      <label for="cloneMatchIdentify">URL Match Type</label>
      <select id="cloneMatchIdentify" class="match-select">
        <option value="prefixMatch" selected>Prefix Match</option>
        <option value="exactMatch">Exact Match</option>
      </select>
    </div>
    <div class="form-group">
      <label for="clonePageDescription">Description</label>
      <textarea id="clonePageDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-group">
      <label for="clonePageOwner">Owner</label>
      <input type="text" id="clonePageOwner" placeholder="Optional owner name" />
    </div>
    <div class="form-actions">
      <button id="cancelCloneBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="confirmCloneBtn" class="cyber-btn">Clone Profile
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;

  showModal('Clone from Existing Page', bodyContent);

  document.getElementById('confirmCloneBtn')?.addEventListener('click', async () => {
    const sourcePageId = (document.getElementById('sourcePageSelect') as HTMLSelectElement).value;
    const newTitle = (document.getElementById('clonePageTitle') as HTMLInputElement).value;
    const newUrl = (document.getElementById('clonePageUrl') as HTMLInputElement).value;
    const newDescription = (document.getElementById('clonePageDescription') as HTMLTextAreaElement).value;
    const newOwner = (document.getElementById('clonePageOwner') as HTMLInputElement).value;
    const matchIdentify = (document.getElementById('cloneMatchIdentify') as HTMLSelectElement).value as 'exactMatch' | 'prefixMatch';

    if (!sourcePageId) {
      showNotification('Please select a source page');
      return;
    }

    if (!newTitle || !newUrl) {
      showNotification('Page title and URL are required');
      return;
    }

    const sourcePage = pages.find(p => p.id === sourcePageId);
    if (!sourcePage) {
      showNotification('Source page not found');
      return;
    }

    // Create new page with new settings
    const newPage = await StorageService.addPage({
      pageTitle: newTitle,
      url: newUrl,
      description: newDescription || sourcePage.description || '',
      owner: newOwner || sourcePage.owner || '',
      matchIdentify: matchIdentify
    });

    // Clone presets if any
    const sourcePresets = await StorageService.getPresetsForPage(sourcePage.id);
    if (sourcePresets && sourcePresets.length > 0) {
      for (const preset of sourcePresets) {
        // Create new preset and link to new page
        const newPreset = await StorageService.addPreset({
          name: preset.name,
          description: preset.description || '',
          formData: preset.formData || []
        });
        await StorageService.linkPresetToPage(newPreset.id, newPage.id);
      }
    }

    hideModal();
    showNotification('Page profile cloned successfully!', async () => {
      await loadPageData();
    });
  });

  document.getElementById('cancelCloneBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Update page info display
function updatePageInfoDisplay() {
  if (!currentPageData) return;

  const pageTitleEl = document.getElementById('pageTitle');
  const pageUrlEl = document.getElementById('pageUrl');
  const urlIdentifyEl = document.getElementById('urlIdentify');
  const pageDescEl = document.getElementById('pageDescription');

  if (pageTitleEl) pageTitleEl.textContent = currentPageData.pageTitle;
  if (pageUrlEl) pageUrlEl.textContent = currentPageData.url;
  if (urlIdentifyEl) urlIdentifyEl.textContent = currentPageData.matchIdentify === 'exactMatch' ? 'exact match' : 'prefix match';
  if (pageDescEl) pageDescEl.textContent = currentPageData.description || '-';

  // Setup page action buttons
  setupPageActionButtons();
}

// Setup page action buttons
function setupPageActionButtons() {
  document.getElementById('editPageBtn')?.addEventListener('click', () => {
    if (!currentPageData) return;
    // Open page-profile-editor directly
    window.open(`page-profile-editor.html?pageId=${encodeURIComponent(currentPageData.id)}`, '_blank');
  });

  // Scan form data functionality is now in preset section as scanFormDataBtnPreset

  document.getElementById('exportPageBtn')?.addEventListener('click', async () => {
    if (!currentPageData) return;

    const data = await StorageService.getData();
    if (!data) return;

    // Get presets for this page
    const presets = await StorageService.getPresetsForPage(currentPageData!.id);

    // Get saved values for this page
    const savedValues = data.savedValues.filter(sv => sv.pageId === currentPageData!.id);

    const presetIds = new Set(presets.map(p => p.id));
    const presetPageLinks = data.presetPageLinks.filter(
      l => l.pageId === currentPageData!.id && presetIds.has(l.presetId)
    );

    const exportFile = createExportFile({
      included: {
        pages: true,
        presets: true,
        presetPageLinks: true,
        savedValues: true,
      },
      data: {
        pages: [currentPageData],
        presets,
        presetPageLinks,
        savedValues,
      },
    });

    downloadFile(
      JSON.stringify(exportFile, null, 2),
      `form-filler-${currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_')}.json`
    );
    try {
      const fileName = `form-filler-${currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
      showNotification(`Exported page data to ${fileName}`);
    } catch (error) {
      console.error('Failed to show export notification:', error);
    }
  });
}

// Show page management
async function showPageManagement(container: HTMLElement) {
  // Check if there are unlinked presets available
  const unlinkedPresets = await StorageService.getUnlinkedPresets(currentPageData?.id || '');
  const hasUnlinkedPresets = unlinkedPresets.length > 0;

  container.innerHTML = `
    ${currentPageData ? `
    <div class="presets-section">
    <div class="section-header">
        <h3>
        Presets
        </h3>
        <div class="section-header-actions">
          <button id="scanFormDataBtnPreset" class="cyber-btn cyber-btn--small" title="Scan form fields on current page" data-icons="ScanForm">Scan Page
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">scan</span>
          </button>
          <button id="createPresetBtn" class="cyber-btn cyber-btn--small" data-icons="Plus">Create Preset
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">new</span>
          </button>
          ${hasUnlinkedPresets ? `<button id="linkPresetBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small" title="Link this page with exists preset from other page">Link Preset
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">link</span>
          </button>` : ''}
          <button id="exportPresetsBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small">Export Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">json</span>
          </button>
          <button id="importPresetsBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small">Import Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">load</span>
          </button>
          <button class="guide-trigger-btn" data-guide="presets-guide" title="Show guide for Presets" data-icons="Info"></button>
        </div>
      </div>
      <div class="table-container compact-presets">
        <table class="presets-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="rank">#</th>
              <th class="sortable" data-sort="name">Preset Name</th>
              <th class="sortable" data-sort="description">Description</th>
              <th class="sortable" data-sort="updated">Last Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="presetsBody">
            <!-- Presets will be loaded here -->
          </tbody>
        </table>
      </div>
    </div>
    <input type="file" id="importPresetsFile" accept=".json" style="display: none;" />
    ` : ''}
  `;

  // Re-initialize guide overlays for dynamically added buttons
  initGuideOverlays();

  // Initialize cyber buttons after content is rendered
  initCyberButtons();

  if (currentPageData) {
    loadPresets();

    document.getElementById('createPresetBtn')?.addEventListener('click', () => {
      openPresetEditor();
    });

    document.getElementById('linkPresetBtn')?.addEventListener('click', () => {
      showLinkPresetModal();
    });

    document.getElementById('exportPresetsBtn')?.addEventListener('click', async () => {
      await showExportPresetsModal();
    });

    document.getElementById('importPresetsBtn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('importPresetsFile') as HTMLInputElement;
      fileInput.click();
    });

    document.getElementById('importPresetsFile')?.addEventListener('change', async (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        await importPresetsData(input.files[0]);
        input.value = ''; // Reset input
      }
    });

    // Scan form data button in preset section
    document.getElementById('scanFormDataBtnPreset')?.addEventListener('click', async () => {
      await scanFormData();
    });

    // Add sort listeners
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', (e) => {
        const column = (e.target as HTMLElement).getAttribute('data-sort') as 'rank' | 'name' | 'description' | 'updated';
        if (column) {
          sortPresets(column);
        }
      });
    });
  }
}

// Sort presets
async function sortPresets(column: 'rank' | 'name' | 'description' | 'updated') {
  if (!currentPageData) return;

  // Get presets for this page
  const presets = await StorageService.getPresetsForPage(currentPageData.id);

  // Toggle direction if same column, otherwise default to ascending
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }

  // Sort presets
  const sortedPresets = [...presets];

  sortedPresets.sort((a, b) => {
    let compareA: any;
    let compareB: any;

    switch (column) {
      case 'rank':
        // Use original index for rank (presets array order)
        compareA = presets.indexOf(a);
        compareB = presets.indexOf(b);
        break;
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'description':
        compareA = (a.description || '').toLowerCase();
        compareB = (b.description || '').toLowerCase();
        break;
      case 'updated':
        compareA = new Date(a.updatedAt).getTime();
        compareB = new Date(b.updatedAt).getTime();
        break;
    }

    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Update display
  renderPresetTable(sortedPresets);
  updateSortIndicators();
}

// Update sort indicators
function updateSortIndicators() {
  document.querySelectorAll('.sortable').forEach(header => {
    const column = (header as HTMLElement).getAttribute('data-sort');
    header.classList.remove('sort-asc', 'sort-desc');

    if (column === sortColumn) {
      header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

// Load presets into table
async function loadPresets() {
  if (!currentPageData) return;

  const tbody = document.getElementById('presetsBody') as HTMLTableSectionElement;
  tbody.innerHTML = '';

  // Get presets for this page
  const presets = await StorageService.getPresetsForPage(currentPageData.id);

  if (presets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">No presets found. Create your first preset!</td></tr>';
    return;
  }

  renderPresetTable(presets);
}

// Render preset table
function renderPresetTable(presets: any[]) {
  const tbody = document.getElementById('presetsBody') as HTMLTableSectionElement;
  tbody.innerHTML = '';

  const appendCell = (row: HTMLTableRowElement, text: string) => {
    const cell = document.createElement('td');
    cell.textContent = text;
    row.appendChild(cell);
  };

  const appendActionButton = (
    actionsCell: HTMLTableCellElement,
    opts: { className: string; action?: string; icon?: string; label?: string; presetId: string }
  ) => {
    const button = document.createElement('button');
    button.className = opts.className;
    button.dataset.id = opts.presetId;
    if (opts.action) {
      button.dataset.action = opts.action;
    }
    if (opts.icon) {
      button.dataset.icons = opts.icon;
    }
    if (opts.label) {
      button.textContent = opts.label;
    }
    actionsCell.appendChild(button);
    return button;
  };

  presets.forEach((preset, index) => {
    const row = document.createElement('tr');
    appendCell(row, String(index + 1));
    appendCell(row, preset.name);
    appendCell(row, preset.description || '');
    appendCell(row, formatDate(preset.updatedAt));

    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    appendActionButton(actionsCell, {
      className: 'action-btn action-btn--apply',
      label: 'Apply',
      presetId: preset.id,
    });
    appendActionButton(actionsCell, {
      className: 'action-btn action-btn--edit',
      action: 'edit',
      icon: 'Modify',
      presetId: preset.id,
    });
    appendActionButton(actionsCell, {
      className: 'action-btn action-btn--delete',
      action: 'delete',
      icon: 'Trash',
      presetId: preset.id,
    });
    row.appendChild(actionsCell);

    tbody.appendChild(row);
  });

  // Add event listeners scoped to the table body
  tbody.querySelectorAll('.actions .action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const presetId = target.getAttribute('data-id');
      const action = target.getAttribute('data-action');

      if (!presetId) return;

      if (action === 'edit') {
        openPresetEditor(presetId);
      } else if (action === 'delete') {
        await handleDeletePreset(presetId);
      } else {
        // Apply action (default)
        await applyPreset(presetId);
      }
    });
  });
}

// Handle delete/unlink preset
async function handleDeletePreset(presetId: string) {
  if (!currentPageData) return;

  // Check how many pages this preset is linked to
  const linkedPageIds = await StorageService.getPageIdsForPreset(presetId);

  if (linkedPageIds.length === 1) {
    // Preset is only linked to current page - confirm permanent deletion
    showConfirmation('This preset is only linked to this page. Delete it permanently?', async () => {
      await StorageService.deletePreset(presetId);
      await loadPageData();
    });
  } else {
    // Preset is linked to multiple pages - confirm unlinking
    showConfirmation(`This preset is linked to ${linkedPageIds.length} pages. Unlink it from this page only?`, async () => {
      if (!currentPageData) return;
      await StorageService.unlinkPresetFromPage(presetId, currentPageData.id);
      await loadPageData();
    });
  }
}

// Apply preset to current page
async function applyPreset(presetId: string) {
  if (!currentPageData) return;

  const preset = await StorageService.getPresetById(presetId);
  if (!preset) return;

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) {
      showNotification('Could not find active tab');
      return;
    }

    const tabId = tabs[0].id;

    // Try to send message to content script
    try {
      await chrome.tabs.sendMessage(tabId, {
        action: 'applypreset',
        formData: preset.formData
      });
      window.close();
    } catch (error) {
      // Content script not loaded, inject it first
      console.log('Content script not ready, injecting...');

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });

      // Inject CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });

      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try sending message again
      await chrome.tabs.sendMessage(tabId, {
        action: 'applypreset',
        formData: preset.formData
      });

      window.close();
    }
  } catch (error) {
    console.error('Error applying preset:', error);
    showNotification('Failed to apply preset. Make sure you are on a valid web page (not chrome:// or extension pages). Or try refreshing the page.');
  }
}

// Scan form data on current page
async function scanFormData() {
  if (!currentPageData) return;

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    const tabId = tab?.id;

    if (!tabId || !tab.url) {
      showNotification('Could not find active tab');
      return;
    }

    // Check if tab is a valid web page
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
      showNotification('Cannot scan form fields on browser internal pages');
      return;
    }

    let response;
    try {
      // Try to send message to content script
      response = await chrome.tabs.sendMessage(tabId, { action: 'scanFormFields' });
    } catch (error) {
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
      } catch (injectError) {
        console.error('Failed to inject content script:', injectError);
        showNotification('Failed to scan form fields. Please refresh the page and try again.');
        return;
      }
    }

    if (response && response.fields && response.fields.length > 0) {
      // Show confirmation modal with scanned fields
      showScannedFieldsModal(response.fields);
    } else {
      showNotification('No form fields found on this page');
    }
  } catch (error) {
    console.error('Error scanning form fields:', error);
    showNotification('Failed to scan form fields. Make sure you are on a valid web page.');
  }
}

// Show scanned fields modal
function showScannedFieldsModal(fields: any[]) {
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
      showNotification('Preset name is required');
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
    if (currentPageData) {
      await StorageService.linkPresetToPage(newPreset.id, currentPageData.id);
    }

    hideModal();
    showNotification(`Preset "${presetName}" created with ${fields.length} field(s)!`, async () => {
      await loadPageData();
    });
  });

  document.getElementById('cancelScannedFieldsBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Open preset editor
function openPresetEditor(presetId?: string) {
  const basePath = 'html/page-profile-editor.html';
  const pageIdParam = `pageId=${encodeURIComponent(currentPageData!.id)}`;
  const url = presetId
    ? `${basePath}?${pageIdParam}&presetId=${encodeURIComponent(presetId)}`
    : `${basePath}?${pageIdParam}`;
  chrome.tabs.create({ url: chrome.runtime.getURL(url) });
}

// Show link preset modal
async function showLinkPresetModal() {
  if (!currentPageData) return;

  const data = await StorageService.getData();
  if (!data) return;

  // Get all presets
  const allPresets = data.presets;

  // Get current page's linked presets
  const currentPresetIds = data.presetPageLinks
    .filter(link => link.pageId === currentPageData!.id)
    .map(link => link.presetId);

  // Filter out already linked presets
  const availablePresets = allPresets.filter(p => !currentPresetIds.includes(p.id));

  if (availablePresets.length === 0) {
    showNotification('No available presets to link. All presets are already linked to this page.');
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
        showNotification('Please select at least one preset to link.');
        return;
      }

      // Link all selected presets
      for (const presetId of selectedPresetIds) {
        await StorageService.linkPresetToPage(presetId, currentPageData!.id);
      }

      hideModal();
      const message = selectedPresetIds.length === 1 
        ? 'Preset linked successfully!' 
        : `${selectedPresetIds.length} presets linked successfully!`;
      showNotification(message, async () => {
        await loadPageData();
      });
    });
  }, 0);
}

// Export presets data
async function exportPresetsData() {
  if (!currentPageData) return;

  const presets = await StorageService.getPresetsForPage(currentPageData.id);

  if (presets.length === 0) {
    showNotification('No presets to export.');
    return;
  }

  const exportFile = createExportFile({
    included: { presets: true },
    data: { presets },
    exportedAt: new Date().toISOString(),
  });

  downloadFile(
    JSON.stringify(exportFile, null, 2),
    `${currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presets.json`
  );

  showNotification(`Exported ${presets.length} preset(s) successfully!`);
}

// Show export presets modal with selection
async function showExportPresetsModal() {
  if (!currentPageData) return;

  const presets = await StorageService.getPresetsForPage(currentPageData.id);

  if (presets.length === 0) {
    showNotification('No presets to export.');
    return;
  }

  const checkboxes = presets.map(preset => `
    <label style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" 
           onmouseover="this.style.background='var(--bg-hover)'" 
           onmouseout="this.style.background='transparent'">
      <input type="checkbox" class="preset-export-checkbox" value="${preset.id}" checked 
             style="width: 18px; height: 18px; cursor: pointer;" />
      <div style="flex: 1;">
        <div style="font-weight: 500;">${preset.name}</div>
        ${preset.description ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${preset.description}</div>` : ''}
      </div>
    </label>
  `).join('');

  const bodyContent = `
    <div style="margin-bottom: 16px;">
      <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; margin-bottom: 12px; cursor: pointer;">
        <input type="checkbox" id="selectAllPresets" checked style="width: 18px; height: 18px;" />
        <span>Select All (${presets.length} presets)</span>
      </label>
    </div>
    <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px; padding: 8px;">
      ${checkboxes}
    </div>
    <div class="form-actions" style="margin-top: 16px;">
      <button id="cancelExportBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="exportSelectedBtn" class="cyber-btn">Export Selected
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;

  showModal('Export Presets', bodyContent);

  // Select all checkbox logic
  document.getElementById('selectAllPresets')?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    document.querySelectorAll('.preset-export-checkbox').forEach(cb => {
      (cb as HTMLInputElement).checked = checked;
    });
  });

  // Export selected button
  document.getElementById('exportSelectedBtn')?.addEventListener('click', async () => {
    const selectedIds: string[] = [];
    document.querySelectorAll('.preset-export-checkbox:checked').forEach(cb => {
      selectedIds.push((cb as HTMLInputElement).value);
    });

    if (selectedIds.length === 0) {
      showNotification('Please select at least one preset to export.');
      return;
    }

    const selectedPresets = presets.filter(p => selectedIds.includes(p.id));

    const exportFile = createExportFile({
      included: { presets: true },
      data: { presets: selectedPresets },
      exportedAt: new Date().toISOString(),
    });

    downloadFile(
      JSON.stringify(exportFile, null, 2),
      `${currentPageData!.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presets.json`
    );

    hideModal();
    showNotification(`Exported ${selectedPresets.length} preset(s) successfully!`);
  });

  document.getElementById('cancelExportBtn')?.addEventListener('click', () => {
    hideModal();
  });
}

// Import presets data
async function importPresetsData(file: File) {
  if (!currentPageData) return;

  try {
    const text = await file.text();

    const importedData = parseExtensionExportJson(text);

    if (!importedData.included.presets || !Array.isArray(importedData.data.presets)) {
      showNotification('Invalid import file: presets section not included');
      return;
    }

    const data = await StorageService.getData();
    if (!data) return;

    let addedCount = 0;
    let skippedIdCount = 0;
    let skippedDuplicateCount = 0;

    for (const preset of importedData.data.presets) {
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

      const newPreset = await StorageService.addPreset({
        name: preset.name,
        description: preset.description || '',
        formData: preset.formData || []
      });
      await StorageService.linkPresetToPage(newPreset.id, currentPageData.id);
      addedCount++;
    }

    let message = `Added ${addedCount} preset${addedCount === 1 ? '' : 's'}`;
    if (skippedIdCount > 0) message += `, skipped ${skippedIdCount} with existing IDs`;
    if (skippedDuplicateCount > 0) message += `, skipped ${skippedDuplicateCount} duplicates`;
    
    showNotification(message, async () => {
      await loadPageData();
    });
  } catch (error) {
    console.error('Import error:', error);
    showNotification('Failed to import presets. Please check the file format.');
  }
}

// String Counter Modal
function showStringCounterModal() {
  const modalBody = `
    <div class="string-counter-container">
      <div class="counter-input-section">
        <textarea id="counterText" class="counter-textarea" placeholder="Enter or paste your text here to count characters, words, lines, etc." rows="8"></textarea>
      </div>
      
      <div class="counter-stats">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Characters:</span>
            <span class="stat-value" id="charCount">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Characters (no spaces):</span>
            <span class="stat-value" id="charNoSpaceCount">0</span>
          </div>
        </div>
        
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Words:</span>
            <span class="stat-value" id="wordCount">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Sentences:</span>
            <span class="stat-value" id="sentenceCount">0</span>
          </div>
        </div>
        
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Lines:</span>
            <span class="stat-value" id="lineCount">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Paragraphs:</span>
            <span class="stat-value" id="paragraphCount">0</span>
          </div>
        </div>
      </div>
    </div>
  `;

  showModal('String Counter', modalBody);

  // Setup event listeners after modal is shown
  const textarea = document.getElementById('counterText') as HTMLTextAreaElement;

  // Update counts function
  const updateCounts = () => {
    const text = textarea.value;
    
    // Character counts
    const charCount = text.length;
    const charNoSpaceCount = text.replace(/\s/g, '').length;
    
    // Word count (split by whitespace and filter empty strings)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Sentence count (split by . ! ? and filter)
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Line count
    const lines = text.split('\n');
    const lineCount = text === '' ? 0 : lines.length;
    
    // Paragraph count (split by double newlines)
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    const paragraphCount = paragraphs.length;
    
    // Update display
    (document.getElementById('charCount') as HTMLElement).textContent = charCount.toString();
    (document.getElementById('charNoSpaceCount') as HTMLElement).textContent = charNoSpaceCount.toString();
    (document.getElementById('wordCount') as HTMLElement).textContent = wordCount.toString();
    (document.getElementById('sentenceCount') as HTMLElement).textContent = sentenceCount.toString();
    (document.getElementById('lineCount') as HTMLElement).textContent = lineCount.toString();
    (document.getElementById('paragraphCount') as HTMLElement).textContent = paragraphCount.toString();
  };

  // Initial count
  updateCounts();

  // Listen for input changes - immediate calculation
  textarea.addEventListener('input', updateCounts);
  textarea.addEventListener('paste', updateCounts);
  textarea.addEventListener('change', updateCounts);
  textarea.addEventListener('keyup', updateCounts);

  // Focus textarea
  setTimeout(() => textarea.focus(), 100);
}

// Show random string generator modal
async function showRandomStringModal() {
  try {
    const randomStringModal = document.getElementById('randomStringModal');
    if (!randomStringModal) {
      console.error('Random string modal not found');
      return;
    }

    // Load current settings
    const settings = await StorageService.getSettings();
    const charsetSelect = document.getElementById('charsetSelect') as HTMLSelectElement;
    const lengthInput = document.getElementById('lengthInput') as HTMLInputElement;
    const generatedString = document.getElementById('generatedString') as HTMLTextAreaElement;

    if (!charsetSelect || !lengthInput || !generatedString) {
      console.error('Modal elements not found');
      return;
    }

    // Set default values from settings
    if (settings) {
      charsetSelect.value = settings.randomStringCharset;
      lengthInput.value = settings.randomStringLength.toString();
    }

    // Generate function
    const generateHandler = () => {
      try {
        const length = parseInt(lengthInput.value) || 50;
        const charset = charsetSelect.value;
        const randomStr = generateRandomString(length, charset as any);
        generatedString.value = randomStr;
      } catch (err) {
        console.error('Failed to generate string:', err);
      }
    };

    // Copy function
    const copyHandler = async () => {
      try {
        const text = generatedString.value;
        if (!text) {
          showNotification('No string to copy. Please generate a string first.');
          return;
        }
        await navigator.clipboard.writeText(text);
        showNotification('String copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
        showNotification('Failed to copy to clipboard');
      }
    };

    // Close function
    const closeModal = () => {
      randomStringModal.style.display = 'none';
    };

    // Setup event listeners
    const generateBtn = document.getElementById('generateStringBtn');
    const copyBtn = document.getElementById('copyStringBtn');
    const closeBtn = document.getElementById('randomStringModalClose');

    if (generateBtn) {
      generateBtn.onclick = generateHandler;
    }

    if (copyBtn) {
      copyBtn.onclick = copyHandler;
    }

    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }

    // Close on overlay click
    randomStringModal.onclick = (e: MouseEvent) => {
      if (e.target === randomStringModal) {
        closeModal();
      }
    };

    // Show modal
    randomStringModal.style.display = 'flex';

    // Auto-generate on first show
    generateHandler();
  } catch (error) {
    console.error('Failed to show random string modal:', error);
  }
}

// Initialize the popup when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});

// Initialize random string section
function initRandomStringSection(settings: any) {
  const charsetSelect = document.getElementById('popupCharsetSelect') as HTMLSelectElement;
  const lengthInput = document.getElementById('popupLengthInput') as HTMLInputElement;
  const copyBtn = document.getElementById('popupCopyBtn');

  // Set default charset from settings
  if (settings && charsetSelect) {
    charsetSelect.value = settings.randomStringCharset;
  }

  // Set default length from settings
  if (settings && lengthInput) {
    lengthInput.value = settings.randomStringLength.toString();
  }

  // Copy button (generates and copies in one action)
  copyBtn?.addEventListener('click', async () => {
    try {
      const length = parseInt(lengthInput.value) || 50;
      const charset = charsetSelect.value;
      const randomStr = generateRandomString(length, charset as any);
      await navigator.clipboard.writeText(randomStr);
      showNotification('Random string copied to clipboard!');
    } catch (error) {
      console.error('Failed to generate/copy string:', error);
      showNotification('Failed to generate and copy random string');
    }
  });
}

