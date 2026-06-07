import { StorageService } from '../../services/storage.service';
import { FormFieldData, PageData } from '../../types';
import { generateGuid, getCurrentTimestamp, generateRandomString, getCharacterSet } from '../../utils/helpers';
import { downloadFile, initTheme, initVersion } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initIconReplacement } from '../../utils/icon-replacer';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { showModal, hideModal } from '../../utils/modal-utils';
import { initGuideOverlays } from '../../utils/guide-overlay';

export const state = {
  currentPageData: null as PageData | null,
  currentUrl: '' as string,
  currentTabTitle: '' as string,
  sortColumn: 'rank' as 'rank' | 'name' | 'description' | 'updated',
  sortDirection: 'asc' as 'asc' | 'desc'
};

export interface Actions {
  init: typeof import('./startup').init;
  formatDate: typeof import('./startup').formatDate;
  showNotification: typeof import('./startup').showNotification;
  showConfirmation: typeof import('./startup').showConfirmation;
  loadSettings: typeof import('./startup').loadSettings;
  updateDependentToggles: typeof import('./startup').updateDependentToggles;
  loadPageData: typeof import('./page-data').loadPageData;
  setupNoPageActions: typeof import('./page-data').setupNoPageActions;
  handleImportFile: typeof import('./page-modals').handleImportFile;
  showCreatePageModal: typeof import('./page-modals').showCreatePageModal;
  showClonePageModal: typeof import('./page-modals').showClonePageModal;
  updatePageInfoDisplay: typeof import('./page-data').updatePageInfoDisplay;
  setupPageActionButtons: typeof import('./page-data').setupPageActionButtons;
  showPageManagement: typeof import('./page-modals').showPageManagement;
  sortPresets: typeof import('./preset-table').sortPresets;
  updateSortIndicators: typeof import('./preset-table').updateSortIndicators;
  loadPresets: typeof import('./preset-table').loadPresets;
  renderPresetTable: typeof import('./preset-table').renderPresetTable;
  handleDeletePreset: typeof import('./preset-table').handleDeletePreset;
  applyPreset: typeof import('./preset-table').applyPreset;
  scanFormData: typeof import('./scan-and-link').scanFormData;
  showScannedFieldsModal: typeof import('./scan-and-link').showScannedFieldsModal;
  openPresetEditor: typeof import('./scan-and-link').openPresetEditor;
  showLinkPresetModal: typeof import('./scan-and-link').showLinkPresetModal;
  exportPresetsData: typeof import('./preset-import-export').exportPresetsData;
  showExportPresetsModal: typeof import('./preset-import-export').showExportPresetsModal;
  importPresetsData: typeof import('./preset-import-export').importPresetsData;
  showStringCounterModal: typeof import('./random-tools').showStringCounterModal;
  showRandomStringModal: typeof import('./random-tools').showRandomStringModal;
  initRandomStringSection: typeof import('./random-tools').initRandomStringSection;
}

export const actions = {} as Actions;
