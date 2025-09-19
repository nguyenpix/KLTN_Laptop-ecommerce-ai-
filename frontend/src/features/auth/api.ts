import { LoginPayload, RegisterPayload, AuthResponse } from "./types";

const API_BASE_URL = "http://localhost:5000/api/v1/users"; // Sửa lại cho đúng với backend của bạn

export const meApi = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/profile`, { // Giả sử endpoint là /profile
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to fetch current user" }));
    throw new Error(errorData.message);
  }
  return res.json();
};

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Email hoặc mật khẩu không đúng" }));
    throw new Error(errorData.message);
  }
  return res.json();
};

export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Đăng ký thất bại" }));
    throw new Error(errorData.message);
  }
  return res.json();
};