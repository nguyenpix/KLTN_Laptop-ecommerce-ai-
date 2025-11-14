'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    common: {
      appName: 'Watch Store',
      home: 'Home',
      products: 'Products',
      login: 'Login',
      logout: 'Logout'
    },
    nav: {
      news: 'News',
      about: 'About Us'
    }
  },
  vi: {
    common: {
      appName: 'Watch Store',
      home: 'Trang chủ',
      products: 'Sản phẩm',
      login: 'Đăng nhập',
      logout: 'Đăng xuất'
    },
    nav: {
      news: 'Tin tức',
      about: 'Về chúng tôi'
    }
  }
};

if (typeof window !== 'undefined') {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n;
