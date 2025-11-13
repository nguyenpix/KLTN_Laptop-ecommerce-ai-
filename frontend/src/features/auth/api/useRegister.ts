import { useMutation } from '@tanstack/react-query';
import { API_URL } from '@/constants/api-url';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

// The original register response included user and token data
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: any; 
}

const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
  }

  return data;
};

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: registerUser,
  });
};