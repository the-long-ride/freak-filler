/**
 * Helper functions for extracting element identifiers
 */
/**
 * Get the data-testid attribute or fall back to element id
 * @param element - The input element
 * @returns The test ID or empty string
 */
export declare function getTestId(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string;
/**
 * Get the CSS selector for an element
 * @param element - The input element
 * @returns A CSS selector string or empty string
 */
export declare function getSelector(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string;
/**
 * Get element selector prioritizing data-testid
 * @param element - The input element
 * @returns data-testid if available, otherwise querySelector
 */
export declare function getElementSelector(element: Element | null): string;
/**
 * Auto-populate test ID and selector inputs
 * @param element - The input element
 * @param testIdInput - The test ID input field
 * @param selectorInput - The selector input field
 */
export declare function populateIdentifiers(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, testIdInput: HTMLInputElement, selectorInput: HTMLInputElement): void;
//# sourceMappingURL=element-helpers.d.ts.map