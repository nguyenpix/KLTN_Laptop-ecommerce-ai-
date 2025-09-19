import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api";
import { useAuthStore } from "@/store/authStore";
import { LoginPayload, AuthResponse } from "../types";

export function useLogin() {
  const { login } = useAuthStore();

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: loginApi, 
    onSuccess: (data) => {
      // Khi API trả về thành công, gọi action `login` của store
      login(data.token, data.user);
    },
  });
}