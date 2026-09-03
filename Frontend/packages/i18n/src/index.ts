import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ur from './locales/ur.json';
import type { Language } from '@hv/api-types';

/**
 * @hv/i18n
 *
 * Shared i18n configuration for Happy Veggie applications.
 * Supports English (LTR) and Urdu (RTL).
 *
 * Usage in apps:
 *   import { i18n } from '@hv/i18n';
 *   // Already initialized — use useTranslation() in components.
 */

const STORAGE_KEY = 'hv_language';

export const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  lng: getStoredLanguage() ?? 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

/** Persist language choice and set document direction */
export function setLanguage(lang: Language): void {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
}

/** Get the current language */
export function getLanguage(): Language {
  return (i18n.language as Language) ?? 'en';
}

/** Read stored language from localStorage */
function getStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ur') return stored;
  } catch {
    // localStorage may be unavailable (SSR, tests)
  }
  return null;
}

/** Initialize document direction from current language */
export function initDirection(): void {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
}

export { en, ur };
export type { Language };
