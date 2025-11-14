export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}


export type LoginPayload = {
  email: string;
  password: string;
};


export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};


export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}


export type LoginResponse = AuthResponse;
