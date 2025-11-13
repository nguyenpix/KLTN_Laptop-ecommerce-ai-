import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/api-url";

const fetchColors = async () => {
  const res = await fetch(`${API_URL}/colors`);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export function useColors() {
  return useQuery({
    queryKey: ["colors"],
    queryFn: fetchColors,
  });
}