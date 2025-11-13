 import { useQuery } from "@tanstack/react-query";

const API_URL = "http://localhost:5000/api/v1";

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


  /**     `useProducts(filters)`:
  2. Lọc theo MỘT tag:
  (Lấy các sản phẩm có tag là "gaming")
  `javascript
  const filters = { tags: 'gaming' };
  const { data, isLoading } = useProducts(filters);
  `


  3. Lọc theo Brand (dùng `brand_id`):
  (Lấy các sản phẩm của Acer)
  `javascript
  const filters = { brand_id: '68c55be5c47e4b9b326732a0' };
  const { data, isLoading } = useProducts(filters);
  `


  4. Lọc theo Category (dùng `category_id`):
  (Lấy các sản phẩm thuộc danh mục Laptop Văn Phòng)
  `javascript
  const filters = { category_id: '68c55be5c47e4b9b326732ac' };
  const { data, isLoading } = useProducts(filters);
  `


  5. Lọc sản phẩm có NHIỀU tag:
  (Lấy sản phẩm có cả tag "new" VÀ "gaming")
  `javascript
  const filters = { tags: 'new,gaming' };
  const { data, isLoading } = useProducts(filters);
  `


  6. Sắp xếp sản phẩm theo giá TĂNG dần:
  `javascript
  const filters = { sort: 'price' };
  const { data, isLoading } = useProducts(filters);
  `

  7. Sắp xếp sản phẩm theo giá GIẢM dần:

  `javascript
  const filters = { sort: '-price' };
  const { data, isLoading } = useProducts(filters);
  `

  8. KẾT HỢP NHIỀU BỘ LỌC:
  (Lấy sản phẩm của Acer, có tag "new", và sắp xếp theo giá giảm dần)

  `javascript
  const filters = {
    brand_id: '68c55be5c47e4b9b326732a0',
    tags: 'new',
    sort: '-price'
  };
  const { data, isLoading } = useProducts(filters); **/