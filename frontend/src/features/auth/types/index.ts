export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}