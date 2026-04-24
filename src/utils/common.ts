/**
 * Common utility functions shared across the application
 */

import { THEMES } from '../constants/appConstants';
import { StorageService } from '../services/storage.service';

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date string to human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

/**
 * Initialize version display - Read from manifest and update all data-version elements
 */
export async function initVersion(): Promise<void> {
  try {
    const manifest = chrome.runtime.getManifest();
    const versionText = `Version: ${manifest.version} | Author: The Long Ride`;
    
    const versionElements = document.querySelectorAll('[data-version]');
    versionElements.forEach(element => {
      element.textContent = versionText;
    });
  } catch (error) {
    console.error('Failed to initialize version:', error);
  }
}

/**
 * Initialize theme system - Uses StorageService for persistence
 */
export async function initTheme(): Promise<void> {
  const themeToggle = document.getElementById('themeToggle');

  // Load theme from StorageService
  const theme = await StorageService.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcons(theme);

  themeToggle?.addEventListener('click', toggleTheme);
}

/**
 * Toggle between light and dark theme
 */
export async function toggleTheme(): Promise<void> {
  const currentTheme = document.documentElement.getAttribute('data-theme') || THEMES.DARK;
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;

  document.documentElement.setAttribute('data-theme', newTheme);
  await StorageService.setTheme(newTheme as 'light' | 'dark');
  updateThemeIcons(newTheme);
}

/**
 * Update theme icon display
 */
export function updateThemeIcons(theme: string): void {
  const lightIcon = document.querySelector('.light-icon, .theme-icon.light-icon') as HTMLElement;
  const darkIcon = document.querySelector('.dark-icon, .theme-icon.dark-icon') as HTMLElement;

  if (lightIcon && darkIcon) {
    darkIcon.style.display = theme === THEMES.LIGHT ? 'block' : 'none';
    lightIcon.style.display = theme === THEMES.LIGHT ? 'none' : 'block';
  }
}

/**
 * Prompt user for confirmation
 */
export function confirmAction(message: string): boolean {
  return confirm(message);
}

/**
 * Show alert message
 */
export function showAlert(message: string): void {
  alert(message);
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Sanitize filename for downloads
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/**
 * Create and trigger file download
 */
export function downloadFile(content: string, filename: string, type: string = 'application/json'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Read file as text
 */
export async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden'
  );
}

/**
 * Get element position for sorting
 */
export function getElementPosition(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  };
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 100
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Wait for specified milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
