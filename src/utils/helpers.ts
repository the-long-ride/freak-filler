// Utility functions

import { CHAR_SETS, LIMITS } from '../constants/appConstants';
import type { RandomStringCharset } from '../types';

export function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateUniqueId(existingIds: string[]): string {
  let newId = generateGuid();
  while (existingIds.includes(newId)) {
    newId = generateGuid();
  }
  return newId;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function matchUrl(pageUrl: string, currentUrl: string, matchIdentify: 'exactMatch' | 'prefixMatch'): boolean {
  if (matchIdentify === 'exactMatch') {
    return pageUrl === currentUrl;
  } else {
    return currentUrl.startsWith(pageUrl);
  }
}

export function buildQuantityString(quantity: number): string {
  return quantity > 0 ? `Total: ${quantity} item${quantity !== 1 ? 's' : ''}` : '';
}

export function getCharacterSet(template: RandomStringCharset): string {
  switch (template) {
    case 'numeric':
      return CHAR_SETS.DIGITS;
    case 'alphabet':
      return CHAR_SETS.ALPHABET;
    case 'alphanumeric':
      return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS;
    case 'alphanumeric-special':
      return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS + CHAR_SETS.SPECIAL;
    case 'alphanumeric-special-control':
      return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS + CHAR_SETS.SPECIAL + CHAR_SETS.CONTROL;
    default:
      return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS;
  }
}

export function generateRandomString(length: number, charset: RandomStringCharset | string): string {
  const constrainedLength = constrainNumber(length, LIMITS.MIN_STRING_LENGTH, LIMITS.MAX_STRING_LENGTH);
  let chars: string;
  if (['numeric', 'alphabet', 'alphanumeric', 'alphanumeric-special', 'alphanumeric-special-control'].includes(charset)) {
    chars = getCharacterSet(charset as RandomStringCharset);
  } else {
    chars = charset;
  }
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < constrainedLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}

export function constrainNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function expandCharClass(charClass: string): string {
  let chars = '';
  let i = 0;

  while (i < charClass.length) {
    if (i + 2 < charClass.length && charClass[i + 1] === '-') {
      // Range like a-z
      const start = charClass.charCodeAt(i);
      const end = charClass.charCodeAt(i + 2);
      for (let code = start; code <= end; code++) {
        chars += String.fromCharCode(code);
      }
      i += 3;
    } else {
      chars += charClass[i];
      i++;
    }
  }

  return chars || 'a';
}

/**
 * Generate string from regex pattern
 */
export function generateFromRegex(regex: string, length: number): string {
  try {
    // Remove start (^) and end ($) anchors from the pattern
    let pattern = regex.replace(/^\^/, '').replace(/\$$/, '');
    let result = '';
    let i = 0;

    // Iterate through the pattern until we reach the desired length
    while (i < pattern.length && result.length < length) {
      const char = pattern[i];
      let generatedPart: string | (() => string) = '';

      // Handle escaped characters (e.g., \d, \w, \.)
      if (char === '\\' && i + 1 < pattern.length) {
        const next = pattern[i + 1];
        if (next === '.') {
          // Literal dot
          generatedPart = '.';
        } else if (next === 'd') {
          // Digit (0-9)
          generatedPart = () => String.fromCharCode(48 + Math.floor(Math.random() * 10));
        } else if (next === 'w') {
          // Word character (alphanumeric + underscore)
          generatedPart = () => CHAR_SETS.WORD_CHARS[Math.floor(Math.random() * CHAR_SETS.WORD_CHARS.length)];
        } else {
          // Other escaped characters (literal)
          generatedPart = next;
        }
        i += 2;
      } else if (char === '(') {
        // Group - find matching closing parenthesis
        let depth = 1;
        let closeIndex = i + 1;
        while (closeIndex < pattern.length && depth > 0) {
          if (pattern[closeIndex] === '\\') {
            closeIndex += 2; // Skip escaped characters
            continue;
          }
          if (pattern[closeIndex] === '(') depth++;
          if (pattern[closeIndex] === ')') depth--;
          closeIndex++;
        }

        if (depth === 0) {
          // Extract group content and generate recursively
          const groupContent = pattern.substring(i + 1, closeIndex - 1);
          generatedPart = () => generateFromRegex(groupContent, length - result.length);
          i = closeIndex;
        } else {
          // Unmatched parenthesis, treat as literal
          generatedPart = char;
          i++;
        }
      } else if (char === '[') {
        // Character class (e.g., [a-z], [A-Z0-9])
        const closeIndex = pattern.indexOf(']', i);
        if (closeIndex !== -1) {
          const charClass = pattern.substring(i + 1, closeIndex);
          const chars = expandCharClass(charClass);
          generatedPart = () => chars[Math.floor(Math.random() * chars.length)];
          i = closeIndex + 1;
        } else {
          generatedPart = char;
          i++;
        }
      } else if (char === '.') {
        // Any character (using alphanumeric set)
        generatedPart = () => CHAR_SETS.ALPHABET[Math.floor(Math.random() * CHAR_SETS.ALPHABET.length)];
        i++;
      } else if (char === '+' || char === '*' || char === '?' || char === '{') {
        // Skip standalone quantifiers (will be handled after the character)
        i++;
        continue;
      } else {
        // Literal character
        generatedPart = char;
        i++;
      }

      // Handle quantifiers after the character
      if (i < pattern.length && pattern[i] === '{') {
        // Exact or range quantifier (e.g., {3}, {2,5})
        const closeIndex = pattern.indexOf('}', i);
        if (closeIndex !== -1) {
          const quantifierStr = pattern.substring(i + 1, closeIndex);
          const parts = quantifierStr.split(',');
          const min = parseInt(parts[0]) || 1;
          const max = parts[1] !== undefined ? (parts[1] === '' ? min + 5 : parseInt(parts[1])) : min;
          const count = min + Math.floor(Math.random() * (max - min + 1));

          // Generate the character 'count' times
          for (let j = 0; j < count && result.length < length; j++) {
            result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
          }
          i = closeIndex + 1;
        } else {
          result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
        }
      } else if (i < pattern.length && (pattern[i] === '+' || pattern[i] === '*')) {
        // + (one or more) or * (zero or more)
        const isPlus = pattern[i] === '+';
        const min = isPlus ? 1 : 0;
        const count = min + Math.floor(Math.random() * (LIMITS.QUANTIFIER_MAX_REPEAT - min + 1));

        // Generate the character 'count' times
        for (let j = 0; j < count && result.length < length; j++) {
          result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
        }
        i++;
      } else {
        // No quantifier, generate once
        result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
      }
    }

    // Fallback to random alphanumeric if result is empty
    return result || generateRandomString(length, 'alphanumeric');
  } catch (e) {
    console.error('Error generating from regex:', e);
    return generateRandomString(length, 'alphanumeric');
  }
}
