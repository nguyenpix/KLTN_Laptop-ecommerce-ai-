import { useMutation } from '@tanstack/react-query';
import { LoginCredentials, LoginResponse } from '../types';
import { API_URL } from '@/constants/api-url';

const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
  }

  return data;
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: loginUser,
  });
};