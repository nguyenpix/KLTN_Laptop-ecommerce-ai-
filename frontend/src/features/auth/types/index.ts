export interface User {
  id: string;
  email: string;
  name: string;
  // Có thể thêm các trường khác của user nếu cần
}

// Dữ liệu gửi đi khi login
export type LoginPayload = {
  email: string;
  password: string;
};

// Dữ liệu gửi đi khi register
export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

// Dữ liệu API trả về sau khi login/register thành công
export interface AuthResponse {
  user: User;
  token: string;
}
