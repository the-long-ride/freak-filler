/**
 * Initialize cyber button components
 * This function populates cyber-btn__glitch elements with content from button text and data-icons
 */

/**
 * Initialize all cyber buttons on the page
 * - Moves button's direct text content into cyber-btn__glitch element
 * - Moves data-icons attribute from button to cyber-btn__glitch
 * - Cleans up button's direct text content
 */
export function initCyberButtons(): void {
    const buttons = document.querySelectorAll<HTMLElement>('.cyber-btn');

    buttons.forEach((button) => {
        const glitchElement = button.querySelector<HTMLElement>('.cyber-btn__glitch');

        if (!glitchElement) {
            console.warn('cyber-btn missing cyber-btn__glitch element:', button);
            return;
        }

        // Get data-icons from button if exists
        const dataIcons = button.getAttribute('data-icons');

        // Get button's direct text content (not from child elements)
        let buttonText = '';
        button.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) {
                    buttonText = text;
                }
            }
        });

        // If button has text content or data-icons, populate glitch element

        // Move data-icons to glitch element
        // if (dataIcons) {
        //     glitchElement.setAttribute('data-icons', dataIcons);
        //     button.removeAttribute('data-icons');
        // }

        // Set text content to glitch element
        if (buttonText) {
            glitchElement.textContent = buttonText;

            // Remove direct text content from button
            // button.childNodes.forEach((node) => {
            //   if (node.nodeType === Node.TEXT_NODE) {
            //     node.textContent = '';
            //   }
            // });
        }
    });
}

/**
 * Initialize a single cyber button element
 * Useful when dynamically creating buttons
 * @param button - The button element to initialize
 */
export function initSingleCyberButton(button: HTMLElement): void {
    const glitchElement = button.querySelector<HTMLElement>('.cyber-btn__glitch');

    if (!glitchElement) {
        console.warn('cyber-btn missing cyber-btn__glitch element:', button);
        return;
    }

    // Get data-icons from button if exists
    const dataIcons = button.getAttribute('data-icons');

    // Get button's direct text content (not from child elements)
    let buttonText = '';
    button.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
                buttonText = text;
            }
        }
    });

    // If button has text content or data-icons, populate glitch element
    if (buttonText || dataIcons) {
        // Move data-icons to glitch element
        if (dataIcons) {
            glitchElement.setAttribute('data-icons', dataIcons);
            button.removeAttribute('data-icons');
        }

        // Set text content to glitch element
        if (buttonText) {
            glitchElement.textContent = buttonText;

            // Remove direct text content from button
            button.childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = '';
                }
            });
        }
    }
}
