import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  resources: {
    fr: { translation: { scan: 'Scanner un produit', communityPrice: 'Prix signalé par la communauté' } },
    en: { translation: { scan: 'Scan a product', communityPrice: 'Price reported by the community' } },
  },
});

export default i18n;
