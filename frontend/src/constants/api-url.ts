
let apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
if (apiUrl.endsWith('/api')) {
  apiUrl += '/v1';
}
export const API_URL = apiUrl;