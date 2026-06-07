import { StorageService } from '../../services/storage.service';
import { Preset, FormFieldData, PageData, SavedValue } from '../../types';
import { buildQuantityString, generateGuid, getCurrentTimestamp } from '../../utils/helpers';
import { downloadFile, escapeHtml, initTheme, initVersion } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { initIconReplacement } from '../../utils/icon-replacer';
import { showConfirm, showToast, showModal, hideModal } from '../../utils/modal-utils';
import { initGuideOverlays } from '../../utils/guide-overlay';
import { actions, state } from './context';

export function bootstrap(): void {
  // Initialize
  actions.init();
}
