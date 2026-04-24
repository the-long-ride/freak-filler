/**
 * Guide Overlay Utility
 * Manages guide overlays with cyberpunk theme
 * Ensures only one overlay is displayed at a time
 */
/**
 * Initialize guide overlay functionality
 * Sets up event listeners for guide trigger buttons and close buttons
 */
export declare function initGuideOverlays(): void;
/**
 * Show a specific guide overlay
 * Hides any currently active guide first
 * @param guideId - The ID of the guide overlay to show
 */
export declare function showGuide(guideId: string): void;
/**
 * Hide a specific guide overlay
 * @param guideId - The ID of the guide overlay to hide
 */
export declare function hideGuide(guideId: string): void;
/**
 * Hide all active guide overlays
 */
export declare function hideAllGuides(): void;
/**
 * Check if any guide is currently active
 * @returns True if a guide is active, false otherwise
 */
export declare function isGuideActive(): boolean;
/**
 * Get the ID of the currently active guide
 * @returns The ID of the active guide, or null if none is active
 */
export declare function getActiveGuideId(): string | null;
/**
 * Inject structured guide data (validation rules and data links) into a guide overlay
 * @param guideId - ID of the guide overlay element
 * @param payload - object containing optional `validation` and `dataLinks` arrays
 */
export declare function injectGuideData(guideId: string, payload: {
    validation?: Array<{
        selector: string;
        rules: any;
    }>;
    dataLinks?: Array<{
        label: string;
        selector: string;
        value: string;
    }>;
}): void;
//# sourceMappingURL=guide-overlay.d.ts.map