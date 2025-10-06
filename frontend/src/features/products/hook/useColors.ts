import { useQuery } from "@tanstack/react-query";

const API_URL = "http://localhost:5000/api/v1";

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
