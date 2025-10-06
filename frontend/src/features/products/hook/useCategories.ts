import { useQuery } from "@tanstack/react-query";

const API_URL = "http://localhost:5000/api/v1";

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
