import { ICON_MAP } from '../constants/svgs';

/**
 * Initialize icon replacement for elements with data-icons attributes
 */
export function initIconReplacement(): void {
  // Replace icons immediately for existing elements
  replaceIconsInDocument();

  // Set up observer for dynamically added elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          replaceIconsInElement(node as Element);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Replace icons in the entire document
 */
function replaceIconsInDocument(): void {
  replaceIconsInElement(document.body);
}

/**
 * Replace icons in a specific element and its children
 */
function replaceIconsInElement(element: Element): void {
  // Check if this element has a data-icons attribute
  if (element.hasAttribute('data-icons')) {
    replaceIcon(element);
  }

  // Recursively check child elements
  element.querySelectorAll('[data-icons]').forEach(replaceIcon);
}

/**
 * Replace the content of an element with the corresponding SVG icon
 * Preserves cyber-btn__glitch and cyber-btn__label spans
 */
function replaceIcon(element: Element): void {
  const iconName = element.getAttribute('data-icons');
  if (!iconName || !ICON_MAP[iconName]) {
    console.warn(`Icon "${iconName}" not found in ICON_MAP`);
    return;
  }

  // Get existing cyber button elements to preserve
  const glitchSpan = element.querySelector('.cyber-btn__glitch');
  const labelSpan = element.querySelector('.cyber-btn__label');
  
  // Get direct text content only (not from child elements)
  let textContent = '';
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        textContent += text + ' ';
      }
    }
  });
  textContent = textContent.trim();

  // Build new content with SVG + text + preserved spans for regular elements
  let newContent = ICON_MAP[iconName];
  if (textContent) {
    newContent += textContent;
  }

  // Set the new content
  element.innerHTML = newContent;

  // Re-append preserved spans
  if (glitchSpan) {
    element.appendChild(glitchSpan);
  }
  if (labelSpan) {
    element.appendChild(labelSpan);
  }
}
