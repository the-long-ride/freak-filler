// Common modal utilities for all pages

import { initCyberButtons } from './cyber-btn-init';

/**
 * Show a confirmation modal with OK/Cancel buttons
 * @param title - Modal title
 * @param message - Modal message content
 * @returns Promise<boolean> - true if user clicked OK, false if Cancel
 */
export function showConfirm(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modalOverlay || !modalTitle || !modalBody) {
      // Fallback to native confirm
      resolve(confirm(message));
      return;
    }
    
    modalTitle.textContent = title;
    modalBody.innerHTML = `
      <p class="modal-message">${message}</p>
      <div class="modal-actions">
          <button id="modalCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[esc]</span>
          </button>
          <button id="modalOkBtn" class="cyber-btn">OK
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
      </div>
    `;
    
    modalOverlay.style.display = 'flex';
    
    // Initialize cyber buttons after modal content is rendered
    initCyberButtons();
    
    let actionHandled = false;

    const handleOk = () => {
      if (actionHandled) return;
      actionHandled = true;
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      if (actionHandled) return;
      actionHandled = true;
      cleanup();
      resolve(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleOk();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    const cleanup = () => {
      modalOverlay.style.display = 'none';
      document.getElementById('modalOkBtn')?.removeEventListener('click', handleOk);
      document.getElementById('modalCancelBtn')?.removeEventListener('click', handleCancel);
      document.getElementById('modalClose')?.removeEventListener('click', handleCancel);
      window.removeEventListener('keydown', handleKeyDown);
    };

    document.getElementById('modalOkBtn')?.addEventListener('click', handleOk);
    document.getElementById('modalCancelBtn')?.addEventListener('click', handleCancel);
    document.getElementById('modalClose')?.addEventListener('click', handleCancel);
    window.addEventListener('keydown', handleKeyDown);
  });
}

/**
 * Show an informational modal with only an OK button
 * @param title - Modal title
 * @param message - Modal message content
 * @returns Promise<void>
 */
export function showMessage(title: string, message: string): Promise<void> {
  return new Promise((resolve) => {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modalOverlay || !modalTitle || !modalBody) {
      // Fallback to native alert
      alert(message);
      resolve();
      return;
    }
    
    modalTitle.textContent = title;
    modalBody.innerHTML = `
      <p class="modal-message">${message}</p>
      <div class="modal-actions">
          <button id="modalOkBtn" class="cyber-btn">OK
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
      </div>
    `;
    
    modalOverlay.style.display = 'flex';
    
    // Initialize cyber buttons after modal content is rendered
    initCyberButtons();
    
    const handleOk = () => {
      cleanup();
      resolve();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleOk();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleOk();
      }
    };

    const cleanup = () => {
      modalOverlay.style.display = 'none';
      document.getElementById('modalOkBtn')?.removeEventListener('click', handleOk);
      document.getElementById('modalClose')?.removeEventListener('click', handleOk);
      window.removeEventListener('keydown', handleKeyDown);
    };

    document.getElementById('modalOkBtn')?.addEventListener('click', handleOk);
    document.getElementById('modalClose')?.addEventListener('click', handleOk);
    window.addEventListener('keydown', handleKeyDown);
  });
}

/**
 * Show a custom modal with custom content (from popup.ts)
 * @param title - Modal title
 * @param bodyContent - Custom HTML content for modal body
 * @param onClose - Optional callback when modal is closed
 */
export function showModal(title: string, bodyContent: string, onClose?: () => void) {
  const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;
  const modalTitle = document.getElementById('modalTitle') as HTMLElement;
  const modalBody = document.getElementById('modalBody') as HTMLElement;
  const modalClose = document.getElementById('modalClose') as HTMLElement;

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyContent;
  modalOverlay.style.display = 'flex';

  // Initialize cyber buttons after modal content is rendered
  initCyberButtons();

  const closeHandler = () => {
    hideModal();
    if (onClose) onClose();
    modalOverlay.removeEventListener('click', overlayClickHandler);
    modalClose.removeEventListener('click', closeHandler);
    window.removeEventListener('keydown', keyHandler);
  };

  // Only allow overlay click to close for notification modals (when onClose is provided)
  const overlayClickHandler = (e: Event) => {
    if (e.target === modalOverlay && onClose) {
      closeHandler();
    }
  };

  modalClose.addEventListener('click', closeHandler);
  modalOverlay.addEventListener('click', overlayClickHandler);

  // Keyboard handling: Enter => primary button, Escape => secondary button
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Trigger primary action (first cyber-btn that is not secondary)
      const primary = modalBody.querySelector<HTMLElement>('.cyber-btn:not(.cyber-btn--secondary)');
      if (primary) {
        e.preventDefault();
        primary.click();
      }
    } else if (e.key === 'Escape') {
      // Trigger secondary action (first cyber-btn--secondary)
      const secondary = modalBody.querySelector<HTMLElement>('.cyber-btn--secondary');
      if (secondary) {
        e.preventDefault();
        secondary.click();
      } else {
        // Fallback to closing modal
        closeHandler();
      }
    }
  };

  window.addEventListener('keydown', keyHandler);
}

/**
 * Hide the modal
 */
export function hideModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
  }
}

/**
 * Show a toast notification
 * @param message - Toast message content
 * @param type - Toast type ('success', 'error', 'warning', 'info')
 * @param duration - Duration in milliseconds (default: 3000)
 */
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  // Add title
  const titleText = {
    success: 'SUCCESS',
    error: 'ERROR',
    warning: 'WARNING',
    info: 'INFORMATION'
  };
  const title = document.createElement('div');
  title.className = 'toast__title';
  title.textContent = titleText[type];
  toast.appendChild(title);

  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'toast__close';
  closeBtn.textContent = '×';
  toast.appendChild(closeBtn);

  // Add message
  const messageEl = document.createElement('div');
  messageEl.className = 'toast__message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);
  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('toast--show');
  }, 10);

  // Auto remove
  const removeToast = () => {
    toast.classList.remove('toast--show');
    toast.classList.add('toast--hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };

  // Click to dismiss
  toast.addEventListener('click', removeToast);
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeToast();
  });

  // Auto dismiss after duration
  setTimeout(removeToast, duration);
}
