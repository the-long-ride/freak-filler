/**
 * Guide Overlay Utility
 * Manages guide overlays with cyberpunk theme
 * Ensures only one overlay is displayed at a time
 */

import { escapeHtml } from './common';

let currentActiveGuide: string | null = null;

/**
 * Initialize guide overlay functionality
 * Sets up event listeners for guide trigger buttons and close buttons
 */
export function initGuideOverlays() {
  // Setup trigger buttons

  function setupGuideTriggers(element: Element, e: Event) {
      e.preventDefault();
      e.stopPropagation();
      const guideId = (element as HTMLElement).getAttribute('data-guide');
      if (guideId) {
        showGuide(guideId);
      }
  }
  const triggerButtons = document.querySelectorAll('.guide-trigger-btn');
  
  const promptButton = document.getElementById('openPromptsBtn');
  if (promptButton) {
    promptButton.addEventListener('click', (e) => setupGuideTriggers(promptButton, e));
  }
  
  triggerButtons.forEach(button => {
    button.addEventListener('click', (e) => setupGuideTriggers(button, e));
  });

  // Setup close buttons for all guide overlays
  const guideOverlays = document.querySelectorAll('.guide-overlay');
  guideOverlays.forEach(overlay => {
    const closeBtn = overlay.querySelector('.guide-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hideGuide(overlay.id);
      });
    }

    // Close on overlay background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hideGuide(overlay.id);
      }
    });
  });

  // Setup keyboard shortcut (ESC to close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentActiveGuide) {
      hideGuide(currentActiveGuide);
    }
  });
}

/**
 * Show a specific guide overlay
 * Hides any currently active guide first
 * @param guideId - The ID of the guide overlay to show
 */
export function showGuide(guideId: string) {
  // Hide any currently active guide
  if (currentActiveGuide && currentActiveGuide !== guideId) {
    hideGuide(currentActiveGuide);
  }

  const guideOverlay = document.getElementById(guideId);
  if (!guideOverlay) {
    console.warn(`Guide overlay not found: ${guideId}`);
    return;
  }

  // Show the guide
  guideOverlay.classList.add('active');
  currentActiveGuide = guideId;

  // Prevent body scroll when overlay is open
  document.body.style.overflow = 'hidden';
}

/**
 * Hide a specific guide overlay
 * @param guideId - The ID of the guide overlay to hide
 */
export function hideGuide(guideId: string) {
  const guideOverlay = document.getElementById(guideId);
  if (!guideOverlay) {
    console.warn(`Guide overlay not found: ${guideId}`);
    return;
  }

  // Add closing animation
  guideOverlay.classList.add('closing');
  guideOverlay.classList.remove('active');
  
  // Remove closing class after animation completes
  setTimeout(() => {
    guideOverlay.classList.remove('closing');
  }, 300); // Match animation duration

  if (currentActiveGuide === guideId) {
    currentActiveGuide = null;
  }

  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Hide all active guide overlays
 */
export function hideAllGuides() {
  const guideOverlays = document.querySelectorAll('.guide-overlay.active');
  guideOverlays.forEach(overlay => {
    overlay.classList.remove('active');
  });
  currentActiveGuide = null;
  document.body.style.overflow = '';
}

/**
 * Check if any guide is currently active
 * @returns True if a guide is active, false otherwise
 */
export function isGuideActive(): boolean {
  return currentActiveGuide !== null;
}

/**
 * Get the ID of the currently active guide
 * @returns The ID of the active guide, or null if none is active
 */
export function getActiveGuideId(): string | null {
  return currentActiveGuide;
}

/**
 * Inject structured guide data (validation rules and data links) into a guide overlay
 * @param guideId - ID of the guide overlay element
 * @param payload - object containing optional `validation` and `dataLinks` arrays
 */
export function injectGuideData(guideId: string, payload: { validation?: Array<{selector:string;rules:any}>; dataLinks?: Array<{label:string;selector:string;value:string}> }) {
  const overlay = document.getElementById(guideId);
  if (!overlay) return;

  const body = overlay.querySelector('.guide-body');
  if (!body) return;

  // Remove existing injected sections if present
  const existingVal = body.querySelector('.guide-validation-section');
  if (existingVal) existingVal.remove();
  const existingLink = body.querySelector('.guide-datalink-section');
  if (existingLink) existingLink.remove();

  if (payload.validation && payload.validation.length > 0) {
    const section = document.createElement('div');
    section.className = 'guide-section guide-validation-section';
    const title = document.createElement('h3');
    title.className = 'guide-section-title';
    title.textContent = 'Detected Validation Rules';
    section.appendChild(title);

    payload.validation.forEach(item => {
      const row = document.createElement('div');
      row.className = 'guide-list-item';

      const sel = document.createElement('div');
      sel.className = 'guide-list-key';
      sel.textContent = item.selector;
      row.appendChild(sel);

      const rulesEl = document.createElement('div');
      rulesEl.className = 'guide-list-value';
      // Render rule entries
      const ul = document.createElement('ul');
      for (const [k, v] of Object.entries(item.rules || {})) {
        const li = document.createElement('li');
        li.textContent = `${k}: ${String(v)}`;
        ul.appendChild(li);
      }
      rulesEl.appendChild(ul);
      row.appendChild(rulesEl);

      section.appendChild(row);
    });

    body.appendChild(section);
  }

  if (payload.dataLinks && payload.dataLinks.length > 0) {
    const section = document.createElement('div');
    section.className = 'guide-section guide-datalink-section';
    const title = document.createElement('h3');
    title.className = 'guide-section-title';
    title.textContent = 'Data Links / Saved Values';
    section.appendChild(title);

    payload.dataLinks.forEach(item => {
      const row = document.createElement('div');
      row.className = 'guide-list-item';

      const label = document.createElement('div');
      label.className = 'guide-list-key';
      label.textContent = item.label;
      row.appendChild(label);

      const desc = document.createElement('div');
      desc.className = 'guide-list-value';
      desc.textContent = `${item.selector} → ${item.value}`;
      row.appendChild(desc);

      section.appendChild(row);
    });

    body.appendChild(section);
  }
}
