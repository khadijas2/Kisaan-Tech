import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/translation.json'
import ur from './locales/ur/translation.json'

i18n
  .use(LanguageDetector)           // auto-detect via localStorage, browser settings, …
  .use(initReactI18next)           // pass to React
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur }
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  })

export default i18n
