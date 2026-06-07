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

// String Counter Modal
export function showStringCounterModal() {
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
export async function showRandomStringModal() {
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
            }
            catch (err) {
                console.error('Failed to generate string:', err);
            }
        };
        // Copy function
        const copyHandler = async () => {
            try {
                const text = generatedString.value;
                if (!text) {
                    actions.showNotification('No string to copy. Please generate a string first.');
                    return;
                }
                await navigator.clipboard.writeText(text);
                actions.showNotification('String copied to clipboard!');
            }
            catch (error) {
                console.error('Failed to copy:', error);
                actions.showNotification('Failed to copy to clipboard');
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
    }
    catch (error) {
        console.error('Failed to show random string modal:', error);
    }
}

// Initialize random string section
export function initRandomStringSection(settings: any) {
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
            actions.showNotification('Random string copied to clipboard!');
        }
        catch (error) {
            console.error('Failed to generate/copy string:', error);
            actions.showNotification('Failed to generate and copy random string');
        }
    });
}
