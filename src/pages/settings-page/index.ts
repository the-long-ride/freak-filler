import { actions } from './context';
import * as startup from './startup';
import * as sorting from './sorting';
import * as locatorLoader from './locator-loader';
import * as patternsAndLengthLoader from './patterns-and-length-loader';
import * as pagesAndPresetsLoader from './pages-and-presets-loader';
import * as changeButtons from './change-buttons';
import * as saveChanges from './save-changes';
import * as pageImportExport from './page-import-export';
import * as presetImportExport from './preset-import-export';
import * as patternImportExport from './pattern-import-export';
import * as eventListeners from './event-listeners';
import * as navigation from './navigation';
import * as saveAll from './save-all';
import * as pagePresetModals from './page-preset-modals';
import * as patternLengthModals from './pattern-length-modals';
import * as promptSelect from './prompt-select';
import * as patternDragging from './pattern-dragging';
import { bootstrap } from './bootstrap';

Object.assign(actions, startup, sorting, locatorLoader, patternsAndLengthLoader, pagesAndPresetsLoader, changeButtons, saveChanges, pageImportExport, presetImportExport, patternImportExport, eventListeners, navigation, saveAll, pagePresetModals, patternLengthModals, promptSelect, patternDragging);

export function startSettingsPage(): void {
  bootstrap();
}
