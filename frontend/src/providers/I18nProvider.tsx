'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    common: {
      appName: 'Yoga Yata',
      home: 'Home',
      products: 'Products',
      login: 'Login',
      logout: 'Logout'
    },
    nav: {
      courses: 'Courses',
      onlineCourses: 'Online Courses',
      foundation200h: '200H Foundation Yoga Teacher Training'
    }
  },
  vi: {
    common: {
      appName: 'Yoga Yata',
      home: 'Trang chủ',
      products: 'Sản phẩm',
      login: 'Đăng nhập',
      logout: 'Đăng xuất'
    },
    nav: {
      courses: 'Khóa học',
      onlineCourses: 'Khóa học online',
      foundation200h: 'Khóa đào tạo HLV Yoga quốc tế 200H'
    }
  }
};

// Khởi tạo i18n
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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
