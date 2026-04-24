import { ExtensionExportFile, ExtensionExportIncluded, ExtensionSettings, RootData } from '../types';
export declare function createEmptyRootData(): RootData;
export declare function createDefaultSettings(): ExtensionSettings;
export declare function createExportFile(params: {
    included: Partial<ExtensionExportIncluded>;
    settings?: ExtensionSettings | null;
    data?: Partial<RootData> | null;
    exportedAt?: string;
}): ExtensionExportFile;
export declare function isExtensionExportFile(value: unknown): value is ExtensionExportFile;
export declare function parseExtensionExportJson(text: string): ExtensionExportFile;
//# sourceMappingURL=export-format.d.ts.map