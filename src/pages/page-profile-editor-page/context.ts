import { StorageService } from '../../services/storage.service';
import { Preset, FormFieldData, PageData, SavedValue } from '../../types';
import { buildQuantityString, generateGuid, getCurrentTimestamp } from '../../utils/helpers';
import { downloadFile, escapeHtml, initTheme, initVersion } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { initIconReplacement } from '../../utils/icon-replacer';
import { showConfirm, showToast, showModal, hideModal } from '../../utils/modal-utils';
import { initGuideOverlays } from '../../utils/guide-overlay';

export const state = {
  currentPageId: '' as string,
  currentPageData: null as PageData | null,
  currentPresetId: null as string | null,
  currentPreset: null as Preset | null,
  formDataList: [] as FormFieldData[],
  originalFormDataList: [] as FormFieldData[],
  savedValuesList: [] as SavedValue[],
  originalSavedValuesList: [] as SavedValue[],
  draggedRow: null as HTMLTableRowElement | null,
  hasUnsavedPresetChanges: false as boolean,
  hasUnsavedSavedValuesChanges: false as boolean,
  isPresetOnlyMode: false as boolean
};

export interface Actions {
  init: typeof import('./startup').init;
  setupPresetOnlyModeUI: typeof import('./startup').setupPresetOnlyModeUI;
  loadPagePresets: typeof import('./startup').loadPagePresets;
  updateLinkPresetsButtonVisibility: typeof import('./startup').updateLinkPresetsButtonVisibility;
  loadPreset: typeof import('./startup').loadPreset;
  showLinkPresetsToPageModal: typeof import('./linking-modals').showLinkPresetsToPageModal;
  showLinkPresetToPagesModal: typeof import('./linking-modals').showLinkPresetToPagesModal;
  loadSavedValues: typeof import('./startup').loadSavedValues;
  setupPageProfileChangeTracking: typeof import('./page-profile-actions').setupPageProfileChangeTracking;
  updatePageProfileButtons: typeof import('./page-profile-actions').updatePageProfileButtons;
  checkPageProfileChanges: typeof import('./page-profile-actions').checkPageProfileChanges;
  savePageProfile: typeof import('./page-profile-actions').savePageProfile;
  resetPageProfile: typeof import('./page-profile-actions').resetPageProfile;
  savePresetData: typeof import('./page-profile-actions').savePresetData;
  resetPresetData: typeof import('./page-profile-actions').resetPresetData;
  deleteCurrentPreset: typeof import('./page-profile-actions').deleteCurrentPreset;
  saveSavedValuesData: typeof import('./page-profile-actions').saveSavedValuesData;
  resetSavedValuesData: typeof import('./page-profile-actions').resetSavedValuesData;
  updatePresetButtons: typeof import('./page-profile-actions').updatePresetButtons;
  checkPresetInfoChanges: typeof import('./page-profile-actions').checkPresetInfoChanges;
  updateSavedValuesButtons: typeof import('./page-profile-actions').updateSavedValuesButtons;
  setupEventListeners: typeof import('./event-listeners').setupEventListeners;
  addFormDataRow: typeof import('./form-data-table').addFormDataRow;
  renderFormDataTable: typeof import('./form-data-table').renderFormDataTable;
  addTableEventListeners: typeof import('./form-data-table').addTableEventListeners;
  updateFormData: typeof import('./form-data-actions').updateFormData;
  deleteFormDataRow: typeof import('./form-data-actions').deleteFormDataRow;
  resetFormData: typeof import('./form-data-actions').resetFormData;
  updateButtonVisibility: typeof import('./form-data-actions').updateButtonVisibility;
  insertRowBelow: typeof import('./form-data-actions').insertRowBelow;
  cloneRowBelow: typeof import('./form-data-actions').cloneRowBelow;
  moveRowToPosition: typeof import('./form-data-actions').moveRowToPosition;
  openShareRowModal: typeof import('./form-data-actions').openShareRowModal;
  reorderFormData: typeof import('./form-data-actions').reorderFormData;
  handleDragStart: typeof import('./form-data-actions').handleDragStart;
  handleDragOver: typeof import('./form-data-actions').handleDragOver;
  handleDrop: typeof import('./form-data-actions').handleDrop;
  handleDragEnd: typeof import('./form-data-actions').handleDragEnd;
  exportPageData: typeof import('./preset-persistence').exportPageData;
  exportPresetOnly: typeof import('./preset-persistence').exportPresetOnly;
  importPresetFromJson: typeof import('./preset-persistence').importPresetFromJson;
  savePreset: typeof import('./preset-persistence').savePreset;
  saveAllData: typeof import('./preset-persistence').saveAllData;
  saveSavedValues: typeof import('./preset-persistence').saveSavedValues;
  switchTab: typeof import('./tabs').switchTab;
  addSavedValueRow: typeof import('./saved-values').addSavedValueRow;
  renderSavedValuesTable: typeof import('./saved-values').renderSavedValuesTable;
  updateSavedValuesCount: typeof import('./saved-values').updateSavedValuesCount;
  handleSavedValueInputChange: typeof import('./saved-values').handleSavedValueInputChange;
  deleteSavedValue: typeof import('./saved-values').deleteSavedValue;
  exportSavedValues: typeof import('./saved-values').exportSavedValues;
  importSavedValues: typeof import('./saved-values').importSavedValues;
  showExportSelectionModal: typeof import('./export-modals').showExportSelectionModal;
  showPresetExportSelectionModal: typeof import('./export-modals').showPresetExportSelectionModal;
  performExport: typeof import('./export-modals').performExport;
  performPresetExport: typeof import('./export-modals').performPresetExport;
}

export const actions = {} as Actions;
