import { useMutation } from "@tanstack/react-query";
import { registerApi } from "../api";
import { useAuthStore } from "@/store/authStore"
import { RegisterPayload, AuthResponse } from "../types";

export function useRegister() {
  const { login } = useAuthStore();

  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: registerApi,
    onSuccess: (data) => {
      if (data.data) {
        login(data.data.user, data.data.token);
      }
    },
  });
}