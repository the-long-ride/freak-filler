import { FormFieldData } from '../types';
export type NativeEditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type HtmlEditorElement = HTMLElement | HTMLIFrameElement;
export type FillableElement = NativeEditableElement | HtmlEditorElement;
export type ScannedFormField = FormFieldData & {
    position: {
        top: number;
        left: number;
    };
};
export declare const INLINE_HTML_EDITOR_SELECTOR: string;
export declare const HTML_EDITOR_IFRAME_SELECTOR: string;
export declare const HTML_EDITOR_SELECTOR: string;
export declare function isNativeEditableElement(element: Element | null): element is NativeEditableElement;
export declare function isHtmlEditorElement(element: Element | null): boolean;
export declare function isNestedHtmlEditorElement(element: HTMLElement): boolean;
export declare function isAssistantElement(element: Element | null): element is FillableElement;
export declare function getAssistantElementFromTarget(target: EventTarget | Element | null): FillableElement | null;
export declare function allowsTextActions(element: FillableElement): boolean;
export declare function dispatchValueEvents(element: Element): void;
export declare function getEditableValue(element: FillableElement): string;
export declare function setEditableValue(element: FillableElement, value: string): void;
export declare function getFieldTypeForElement(element: FillableElement): FormFieldData['type'];
export declare function getElementLocators(element: Element): {
    testId: string;
    querySelector: string;
};
export declare function getTestId(element: Element): string;
export declare function getSelector(element: Element): string;
export declare function getElementSelector(element: Element | null): string;
export declare function getElementLabel(element: FillableElement): string;
export declare function createScannedField(element: FillableElement, type: FormFieldData['type'], value: FormFieldData['value'], order: number): ScannedFormField;
export declare function populateIdentifiers(element: Element, testIdInput: HTMLInputElement, selectorInput: HTMLInputElement): void;
//# sourceMappingURL=element-helpers.d.ts.map