/**
 * Common utility functions shared across the application
 */
/**
 * Escape HTML special characters to prevent XSS
 */
export declare function escapeHtml(text: string): string;
/**
 * Format date string to human-readable format
 */
export declare function formatDate(dateString: string): string;
/**
 * Initialize version display - Read from manifest and update all data-version elements
 */
export declare function initVersion(): Promise<void>;
/**
 * Initialize theme system - Uses StorageService for persistence
 */
export declare function initTheme(): Promise<void>;
/**
 * Toggle between light and dark theme
 */
export declare function toggleTheme(): Promise<void>;
/**
 * Update theme icon display
 */
export declare function updateThemeIcons(theme: string): void;
/**
 * Prompt user for confirmation
 */
export declare function confirmAction(message: string): boolean;
/**
 * Show alert message
 */
export declare function showAlert(message: string): void;
/**
 * Debounce function execution
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Sanitize filename for downloads
 */
export declare function sanitizeFilename(name: string): string;
/**
 * Create and trigger file download
 */
export declare function downloadFile(content: string, filename: string, type?: string): void;
/**
 * Read file as text
 */
export declare function readFileAsText(file: File): Promise<string>;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Check if element is visible
 */
export declare function isElementVisible(element: HTMLElement): boolean;
/**
 * Get element position for sorting
 */
export declare function getElementPosition(element: HTMLElement): {
    top: number;
    left: number;
};
/**
 * Retry async operation with exponential backoff
 */
export declare function retryAsync<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
/**
 * Wait for specified milliseconds
 */
export declare function wait(ms: number): Promise<void>;
//# sourceMappingURL=common.d.ts.map