import { actions } from './context';
import * as startup from './startup';
import * as pageData from './page-data';
import * as pageModals from './page-modals';
import * as presetTable from './preset-table';
import * as scanAndLink from './scan-and-link';
import * as presetImportExport from './preset-import-export';
import * as randomTools from './random-tools';
import { bootstrap } from './bootstrap';

Object.assign(actions, startup, pageData, pageModals, presetTable, scanAndLink, presetImportExport, randomTools);

export function startPopupPage(): void {
  bootstrap();
}
