import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/api-url";

const fetchBrands = async () => {
  const res = await fetch(`${API_URL}/brands`);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });
}