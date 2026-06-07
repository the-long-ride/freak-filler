import { actions } from './context';
import * as startup from './startup';
import * as linkingModals from './linking-modals';
import * as pageProfileActions from './page-profile-actions';
import * as eventListeners from './event-listeners';
import * as formDataTable from './form-data-table';
import * as formDataActions from './form-data-actions';
import * as presetPersistence from './preset-persistence';
import * as tabs from './tabs';
import * as savedValues from './saved-values';
import * as exportModals from './export-modals';
import { bootstrap } from './bootstrap';

Object.assign(actions, startup, linkingModals, pageProfileActions, eventListeners, formDataTable, formDataActions, presetPersistence, tabs, savedValues, exportModals);

export function startPageProfileEditor(): void {
  bootstrap();
}
