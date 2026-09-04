export {
  createI18n,
  createFarmerI18n,
  createAdminI18n,
  applyDocumentLanguage,
  en,
  ur,
  resources,
} from './createI18n';
export type { AppLanguage, CreateI18nOptions } from './createI18n';

export { useTranslation, I18nextProvider } from 'react-i18next';
