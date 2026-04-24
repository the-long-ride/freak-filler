/**
 * Show a confirmation modal with OK/Cancel buttons
 * @param title - Modal title
 * @param message - Modal message content
 * @returns Promise<boolean> - true if user clicked OK, false if Cancel
 */
export declare function showConfirm(title: string, message: string): Promise<boolean>;
/**
 * Show an informational modal with only an OK button
 * @param title - Modal title
 * @param message - Modal message content
 * @returns Promise<void>
 */
export declare function showMessage(title: string, message: string): Promise<void>;
/**
 * Show a custom modal with custom content (from popup.ts)
 * @param title - Modal title
 * @param bodyContent - Custom HTML content for modal body
 * @param onClose - Optional callback when modal is closed
 */
export declare function showModal(title: string, bodyContent: string, onClose?: () => void): void;
/**
 * Hide the modal
 */
export declare function hideModal(): void;
/**
 * Show a toast notification
 * @param message - Toast message content
 * @param type - Toast type ('success', 'error', 'warning', 'info')
 * @param duration - Duration in milliseconds (default: 3000)
 */
export declare function showToast(message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number): void;
//# sourceMappingURL=modal-utils.d.ts.map