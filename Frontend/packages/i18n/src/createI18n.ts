import i18n, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ur from './locales/ur.json';

export type AppLanguage = 'en' | 'ur';

const resources = {
  en: { translation: en },
  ur: { translation: ur },
} as const;

export interface CreateI18nOptions {
  /** Initial language. Farmer apps default to `en` (or stored preference). */
  lng?: AppLanguage;
  /** When true, prefer English unless an explicit `lng` is passed. */
  englishFirst?: boolean;
}

function applyDocumentLanguage(lang: string): void {
  if (typeof document === 'undefined') return;
  const normalized: AppLanguage = lang === 'ur' ? 'ur' : 'en';
  document.documentElement.lang = normalized;
  document.documentElement.dir = normalized === 'ur' ? 'rtl' : 'ltr';
}

/**
 * Create and initialize an i18next instance with en/ur resources.
 * `changeLanguage` also updates `document.documentElement.lang` and `.dir`.
 */
export function createI18n(options: CreateI18nOptions = {}): I18nInstance {
  const instance = i18n.createInstance();
  const lng: AppLanguage = options.lng ?? 'en';

  void instance.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  applyDocumentLanguage(lng);
  instance.on('languageChanged', (nextLng) => {
    applyDocumentLanguage(nextLng);
  });

  return instance;
}

/** Farmer web — English + Urdu, RTL when Urdu is active. */
export function createFarmerI18n(lng: AppLanguage = 'en'): I18nInstance {
  return createI18n({ lng, englishFirst: false });
}

/** Admin web — English-first, still supports Urdu. */
export function createAdminI18n(lng: AppLanguage = 'en'): I18nInstance {
  return createI18n({ lng, englishFirst: true });
}

export { en, ur, resources, applyDocumentLanguage };
