import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/api-url";

interface ProductFilters {
  [key: string]: string | number | undefined | null;
}

const fetchProducts = async (filters?: ProductFilters) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const res = await fetch(`${API_URL}/products?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });
}