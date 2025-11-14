import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api";
import { useAuthStore } from "@/store/authStore";
import { LoginPayload, AuthResponse } from "../types";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      console.log('🎉 Login mutation success:', data);
      
      const { user, token } = data.data;
      console.log('👤 User data:', user);
      console.log('🔑 Token:', token ? 'exists' : 'missing');

      
      if (user.role !== 'admin') {
        console.error('⛔ User is not admin:', user.role);
        toast.error('Bạn không có quyền truy cập trang admin. Vui lòng đăng nhập bằng tài khoản admin.');
        return;
      }

      
      console.log('✅ Calling authStore.login...');
      login(user, token);
      toast.success('Đăng nhập thành công!');
      
      // Redirect trong hook
      console.log('🔄 Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
      toast.error(error.message || 'Đăng nhập thất bại');
    }
  });
}