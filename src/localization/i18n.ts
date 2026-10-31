import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import bn from './bn.json';

const resources = {
  en: { translation: en },
  bn: { translation: bn },
};

// Synchronous initialization for SSR, Web Bundler, and Jest stability
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    react: {
      useSuspense: false, // Prevents SSR blank screen / suspense mismatch
    },
  });
}

export default i18n;
