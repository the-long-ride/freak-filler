import type { RandomStringCharset } from '../types';
export declare function generateGuid(): string;
export declare function generateUniqueId(existingIds: string[]): string;
export declare function getCurrentTimestamp(): string;
export declare function matchUrl(pageUrl: string, currentUrl: string, matchIdentify: 'exactMatch' | 'prefixMatch'): boolean;
export declare function buildQuantityString(quantity: number): string;
export declare function getCharacterSet(template: RandomStringCharset): string;
export declare function generateRandomString(length: number, charset: RandomStringCharset | string): string;
export declare function constrainNumber(value: number, min: number, max: number): number;
/**
 * Generate string from regex pattern
 */
export declare function generateFromRegex(regex: string, length: number): string;
/**
 * Get element locators (testId and querySelector)
 */
export declare function getElementLocators(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): {
    testId: string;
    querySelector: string;
};
//# sourceMappingURL=helpers.d.ts.map