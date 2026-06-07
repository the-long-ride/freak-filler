import { StorageService } from '../../services/storage.service';
import { FormFieldData, PageData } from '../../types';
import { generateGuid, getCurrentTimestamp, generateRandomString, getCharacterSet } from '../../utils/helpers';
import { downloadFile, initTheme, initVersion } from '../../utils/common';
import { createExportFile, parseExtensionExportJson } from '../../utils/export-format';
import { initIconReplacement } from '../../utils/icon-replacer';
import { initCyberButtons } from '../../utils/cyber-btn-init';
import { showModal, hideModal } from '../../utils/modal-utils';
import { initGuideOverlays } from '../../utils/guide-overlay';
import { actions, state } from './context';

export function bootstrap(): void {
  // Initialize the popup when the DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
      actions.init();
  });
}
