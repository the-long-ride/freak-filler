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
import { actions, state } from './context';

interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// Sync navigation with scroll position
export function updateActiveNavButton() {
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
        }
        else {
            btn.classList.remove('active');
        }
    });
}
