import { useQuery } from "@tanstack/react-query"
import { getCurrentUserApi } from "../api"
import { useAuthStore } from "@/store/authStore"

export function useCurrentUser() {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ["currentUser", token],
    queryFn: () => getCurrentUserApi(token!),
    enabled: !!token, 
  })
}
