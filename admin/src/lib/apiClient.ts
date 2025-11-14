import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function fetchWithAuth(endpoint: string, options?: RequestOptions): Promise<Response> {
  const token = options?.token || useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    
    if (response.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response;
}
