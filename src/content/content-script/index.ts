import { actions } from './context';
import * as startupListeners from './startup-listeners';
import * as assistantPopup from './assistant-popup';
import * as fieldScan from './field-scan';
import * as fieldFill from './field-fill';
import * as assistantSections from './assistant-sections';
import { bootstrap } from './bootstrap';

Object.assign(actions, startupListeners, assistantPopup, fieldScan, fieldFill, assistantSections);

export function startContentScript(): void {
  bootstrap();
}
