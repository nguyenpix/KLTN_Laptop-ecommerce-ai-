// import { useQuery } from "@tanstack/react-query"

// const API_URL = "http://localhost:5000/api/v1"

// const fetchProducts = async () => {
//   const res = await fetch(`${API_URL}/products`)
//   if (!res.ok) throw new Error("Network response was not ok")
//   return res.json()
// }

// export function useProducts() {
//   return useQuery({
//     queryKey: ["products"],
//     queryFn: fetchProducts,
//   })
// }

import { useQuery } from "@tanstack/react-query";
import { MOCK_PRODUCTS } from "../data/mockProducts"; 

const fetchProductsMock = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PRODUCTS;
};

export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: fetchProductsMock, 
    });
}