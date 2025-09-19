import { useQuery } from "@tanstack/react-query"
import { meApi } from "../api"
import { useAuthStore } from "@/store/authStore"

export function useCurrentUser() {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ["currentUser", token],
    queryFn: () => meApi(token!),
    enabled: !!token, // chỉ gọi khi có token
  })
}
