// Notification utility for showing temporary toasts and listening for module events
export function showNotification(message: string) {
  try {
    const existing = document.getElementById('form-filler-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'form-filler-notification';
    notification.id = 'form-filler-notification';

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('slide-out');
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  } catch (e) {
    // Fallback: console log if DOM operations fail
    try { console.log('Notification:', message); } catch {}
  }
}

// Helper to dispatch notifications from other modules
export function dispatchNotification(message: string) {
  try {
    const ev = new CustomEvent('formFiller:notify', { detail: { message } });
    document.dispatchEvent(ev);
  } catch (e) {
    // As fallback, directly call showNotification
    showNotification(message);
  }
}

// Also listen for external events and show notification (useful if modules dispatch directly)
document.addEventListener('formFiller:notify', (ev: Event) => {
  try {
    const detail = (ev as CustomEvent).detail;
    if (detail && typeof detail.message === 'string') {
      showNotification(detail.message);
    }
  } catch (e) {
    // ignore
  }
});
