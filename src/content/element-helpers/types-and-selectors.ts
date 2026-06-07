import { DEFAULTS, LIMITS } from '../../constants/appConstants';
import { FormFieldData } from '../../types';
import { getElementPosition } from '../../utils/common';
import { getCurrentTimestamp } from '../../utils/helpers';

export type NativeEditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type HtmlEditorElement = HTMLElement | HTMLIFrameElement;
export type FillableElement = NativeEditableElement | HtmlEditorElement;
export type ScannedFormField = FormFieldData & { position: { top: number; left: number } };

export const ASSISTANT_INPUT_TYPES = new Set([
  'text',
  'date',
  'datetime-local',
  'email',
  'tel',
  'number',
  'search',
  'url',
  'range',
  'color',
  'password'
]);

export const TEXT_ACTION_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number'
]);

export const INLINE_HTML_EDITOR_SELECTOR = [
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
  '[contenteditable=""]',
  '[role="textbox"][contenteditable]',

  '.alloy-editor[contenteditable]',
  '.ce-block__content[contenteditable]',
  '.ce-paragraph[contenteditable]',
  '.ck-editor__editable[contenteditable]',
  '.ck-editor__editable_inline[contenteditable]',
  '.cke_editable[contenteditable]',
  '.ck-content[contenteditable]',
  '.codex-editor [contenteditable]',
  '.editor-input[contenteditable]',
  '.fr-element[contenteditable]',
  '.jodit-wysiwyg[contenteditable]',
  '.medium-editor-element[contenteditable]',
  '.mce-content-body[contenteditable]',
  '.mce-edit-focus[contenteditable]',
  '.note-editable[contenteditable]',
  '.pell-content[contenteditable]',
  '.public-DraftEditor-content[contenteditable]',
  '.ql-editor[contenteditable]',
  '.redactor-in[contenteditable]',
  '.se-wrapper-wysiwyg[contenteditable]',
  '.scribe-editor[contenteditable]',
  '.st-editor__editable[contenteditable]',
  '.ProseMirror[contenteditable]',
  '.tiptap[contenteditable]',
  '.toastui-editor-contents[contenteditable]',
  '.trumbowyg-editor[contenteditable]',
  '.wym_iframe body[contenteditable]',
  '[data-contents="true"][contenteditable]',
  '[data-lexical-editor="true"]',
  '[data-medium-editor-element="true"]',
  '[data-slate-editor="true"]',
  '[data-testid*="editor" i][contenteditable]',
  '[class*="wysiwyg" i][contenteditable]',
  '[class*="rich-text" i][contenteditable]',
  '[class*="rte" i][contenteditable]',
  'trix-editor',
  'wysiwyg-editor'
].join(', ');

export const HTML_EDITOR_IFRAME_SELECTOR = [
  '.cke_wysiwyg_frame',
  '.fr-iframe',
  '.jodit-wysiwyg_iframe',
  '.mce-edit-area iframe',
  '.redactor-box iframe',
  '.tox-edit-area iframe',
  '.tox-edit-area__iframe',
  '.wysihtml5-sandbox',
  'iframe[id$="_ifr"]',
  'iframe[name*="editor" i]',
  'iframe[title*="editor" i]',
  'iframe[title*="rich text" i]',
  'iframe[title*="wysiwyg" i]',
  'iframe[aria-label*="editor" i]',
  'iframe[aria-label*="rich text" i]'
].join(', ');

export const HTML_EDITOR_SELECTOR = [
  INLINE_HTML_EDITOR_SELECTOR,
  HTML_EDITOR_IFRAME_SELECTOR
].join(', ');
