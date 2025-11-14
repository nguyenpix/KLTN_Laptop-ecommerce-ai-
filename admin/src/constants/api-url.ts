
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'; 


export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  ME: `${API_BASE_URL}/users/profile`,
} as const;


export const PRODUCT_ENDPOINTS = {
  LIST: `${API_BASE_URL}/products`,
  DETAIL: (id: string) => `${API_BASE_URL}/products/${id}`,
  CREATE: `${API_BASE_URL}/products`,
  UPDATE: (id: string) => `${API_BASE_URL}/products/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/products/${id}`,
} as const;


export const NEWS_ENDPOINTS = {
  LIST: `${API_BASE_URL}/news`,
  DETAIL: (id: string) => `${API_BASE_URL}/news/${id}`,
  CREATE: `${API_BASE_URL}/news`,
  UPDATE: (id: string) => `${API_BASE_URL}/news/${id}`,
} as const;


export const COLOR_ENDPOINTS = {
  LIST: `${API_BASE_URL}/colors`,
  DETAIL: (id: string) => `${API_BASE_URL}/colors/${id}`,
  CREATE: `${API_BASE_URL}/colors`,
  UPDATE: (id: string) => `${API_BASE_URL}/colors/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/colors/${id}`,
} as const;


export const CATEGORY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/categories`,
  DETAIL: (id: string) => `${API_BASE_URL}/categories/${id}`,
  CREATE: `${API_BASE_URL}/categories`,
  UPDATE: (id: string) => `${API_BASE_URL}/categories/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/categories/${id}`,
} as const;


export const ORDER_ENDPOINTS = {
  LIST: `${API_BASE_URL}/orders`, 
  DETAIL: (id: string) => `${API_BASE_URL}/orders/${id}`,
  UPDATE_STATUS: (id: string) => `${API_BASE_URL}/orders/${id}/status`,
} as const;


export const USER_ENDPOINTS = {
  LIST: `${API_BASE_URL}/users`,
  DETAIL: (id: string) => `${API_BASE_URL}/users/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/users/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/users/${id}`,
} as const;
