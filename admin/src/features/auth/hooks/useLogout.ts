import { useAuthStore } from "@/store/authStore"

export function useLogout() {
  const { logout } = useAuthStore();

  return () => {
    
    logout();
    
  };
}