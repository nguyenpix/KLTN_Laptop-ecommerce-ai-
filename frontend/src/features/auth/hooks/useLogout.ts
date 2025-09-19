import { useAuthStore } from "@/store/authStore"

export function useLogout() {
  const { logout } = useAuthStore();

  return () => {
    // Chỉ cần gọi hàm logout từ store, nó đã xử lý việc xóa localStorage
    logout();
    // Có thể thêm logic chuyển hướng hoặc thông báo ở đây nếu muốn
  };
}