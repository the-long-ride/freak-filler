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

interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export const state = {
  hasUnsavedChanges: false,
  originalData: null as RootData | null,
  originalSettings: null as any,
  draggedRegexPatternRow: null as HTMLElement | null,
  sortStates: {
    regexPatterns: { column: 'name', direction: 'asc' },
    locators: { column: 'testId', direction: 'asc' },
    pages: { column: 'pageTitle', direction: 'asc' },
    presets: { column: 'name', direction: 'asc' },
    lengthConfig: { column: 'name', direction: 'asc' }
} as { [key: string]: SortState }
};

export interface Actions {
  updateFillingAssistantNoteVisibility: typeof import('./startup').updateFillingAssistantNoteVisibility;
  sortData: typeof import('./sorting').sortData;
  updateSortIndicators: typeof import('./sorting').updateSortIndicators;
  handleHeaderClick: typeof import('./sorting').handleHeaderClick;
  updateSetting: typeof import('./startup').updateSetting;
  init: typeof import('./startup').init;
  loadSettings: typeof import('./startup').loadSettings;
  loadData: typeof import('./startup').loadData;
  loadLocators: typeof import('./locator-loader').loadLocators;
  loadRegexPatterns: typeof import('./patterns-and-length-loader').loadRegexPatterns;
  loadLengthConfigurations: typeof import('./patterns-and-length-loader').loadLengthConfigurations;
  loadPages: typeof import('./pages-and-presets-loader').loadPages;
  handleDeletePage: typeof import('./pages-and-presets-loader').handleDeletePage;
  handleDuplicatePage: typeof import('./pages-and-presets-loader').handleDuplicatePage;
  loadPresets: typeof import('./pages-and-presets-loader').loadPresets;
  handleDeletePreset: typeof import('./pages-and-presets-loader').handleDeletePreset;
  handleClonePreset: typeof import('./pages-and-presets-loader').handleClonePreset;
  markAsChanged: typeof import('./change-buttons').markAsChanged;
  showLocatorButtons: typeof import('./change-buttons').showLocatorButtons;
  hideLocatorButtons: typeof import('./change-buttons').hideLocatorButtons;
  showPageButtons: typeof import('./change-buttons').showPageButtons;
  hidePageButtons: typeof import('./change-buttons').hidePageButtons;
  showRegexPatternsButtons: typeof import('./change-buttons').showRegexPatternsButtons;
  hideRegexPatternsButtons: typeof import('./change-buttons').hideRegexPatternsButtons;
  showLengthConfigButtons: typeof import('./change-buttons').showLengthConfigButtons;
  hideLengthConfigButtons: typeof import('./change-buttons').hideLengthConfigButtons;
  showPresetButtons: typeof import('./change-buttons').showPresetButtons;
  hidePresetButtons: typeof import('./change-buttons').hidePresetButtons;
  saveLocatorChanges: typeof import('./save-changes').saveLocatorChanges;
  saveRegexPatternsChanges: typeof import('./save-changes').saveRegexPatternsChanges;
  saveLengthConfigurationsChanges: typeof import('./save-changes').saveLengthConfigurationsChanges;
  handleDeleteRegexPattern: typeof import('./save-changes').handleDeleteRegexPattern;
  handleDeleteLengthConfig: typeof import('./save-changes').handleDeleteLengthConfig;
  savePageChanges: typeof import('./save-changes').savePageChanges;
  savePresetChanges: typeof import('./save-changes').savePresetChanges;
  exportPages: typeof import('./page-import-export').exportPages;
  showPageExportSelectionModal: typeof import('./page-import-export').showPageExportSelectionModal;
  performPageExport: typeof import('./page-import-export').performPageExport;
  importPages: typeof import('./page-import-export').importPages;
  exportPresets: typeof import('./preset-import-export').exportPresets;
  showPresetExportSelectionModal: typeof import('./preset-import-export').showPresetExportSelectionModal;
  performPresetExport: typeof import('./preset-import-export').performPresetExport;
  importPresets: typeof import('./preset-import-export').importPresets;
  exportRegexPatterns: typeof import('./pattern-import-export').exportRegexPatterns;
  importRegexPatterns: typeof import('./pattern-import-export').importRegexPatterns;
  exportLengthConfigurations: typeof import('./pattern-import-export').exportLengthConfigurations;
  importLengthConfigurations: typeof import('./pattern-import-export').importLengthConfigurations;
  exportAllSettings: typeof import('./pattern-import-export').exportAllSettings;
  importAllSettings: typeof import('./pattern-import-export').importAllSettings;
  setupEventListeners: typeof import('./event-listeners').setupEventListeners;
  updateActiveNavButton: typeof import('./navigation').updateActiveNavButton;
  saveAllChanges: typeof import('./save-all').saveAllChanges;
  showAddPageModal: typeof import('./page-preset-modals').showAddPageModal;
  showAddPresetModal: typeof import('./page-preset-modals').showAddPresetModal;
  showAddRegexPatternModal: typeof import('./pattern-length-modals').showAddRegexPatternModal;
  showAddLengthConfigModal: typeof import('./pattern-length-modals').showAddLengthConfigModal;
  initCustomPromptsSelect: typeof import('./prompt-select').initCustomPromptsSelect;
  handleRegexPatternDragStart: typeof import('./pattern-dragging').handleRegexPatternDragStart;
  handleRegexPatternDragOver: typeof import('./pattern-dragging').handleRegexPatternDragOver;
  handleRegexPatternDrop: typeof import('./pattern-dragging').handleRegexPatternDrop;
  handleRegexPatternDragEnd: typeof import('./pattern-dragging').handleRegexPatternDragEnd;
  handleRegexPatternDragLeave: typeof import('./pattern-dragging').handleRegexPatternDragLeave;
}

export const actions = {} as Actions;
