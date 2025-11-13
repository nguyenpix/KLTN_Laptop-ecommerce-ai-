import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/api-url";

const fetchCategories = async () => {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}
